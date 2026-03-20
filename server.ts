import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Routes
import authRoutes from './server/routes/authRoutes';
import listingRoutes from './server/routes/listingRoutes';
import applicationRoutes from './server/routes/applicationRoutes';
import reviewRoutes from './server/routes/reviewRoutes';
import chatRoutes from './server/routes/chatRoutes';
import paymentRoutes from './server/routes/paymentRoutes';

// Middleware
import { errorHandler, notFound } from './server/middleware/errorMiddleware';
import { startJobs } from './server/jobs/cleanupJobs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development/Vite
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
  console.error('Please add MONGODB_URI to your project secrets in AI Studio Settings.');
} else {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB');
      if (typeof startJobs === 'function') startJobs();
    })
    .catch(err => {
      console.error('CRITICAL: Failed to connect to MongoDB.');
      console.error('Error details:', err.message);
      if (err.name === 'MongoNetworkError') {
        console.error('Network error detected. Check your database host, credentials, and firewall settings.');
      }
    });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.io
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('send_message', (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', message);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('User disconnected');
  });
});

// Serve Frontend
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
