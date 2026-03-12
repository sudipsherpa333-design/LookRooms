# Rental Property Management System

A comprehensive full-stack web application designed to streamline the rental process for both tenants and landlords. This platform facilitates property discovery, application management, secure communication, online payments, and trust-building through a robust review system.

## 🚀 Features

### For Tenants (Users)
- **Advanced Property Search:** Filter properties by location, price range, property type, number of rooms, and specific amenities (WiFi, AC, Parking, etc.).
- **Saved Searches & Favorites:** Save favorite listings and search criteria for quick access.
- **Application Management:** Apply for properties, track application status (pending, accepted, rejected), and view move-in dates.
- **Secure Messaging:** Real-time chat with landlords to ask questions and discuss terms.
- **Online Payments:** Pay service fees securely using integrated payment gateways (eSewa, Khalti).
- **Review System:** Leave detailed reviews for landlords and properties after a completed stay, rating aspects like cleanliness, location, and overall experience.
- **Trust Badges:** Build a reputable profile to increase the chances of application approval.

### For Landlords (Homeowners)
- **Property Management:** Create, edit, and manage property listings with detailed descriptions, photos, and amenities.
- **Application Processing:** Review tenant applications, view applicant profiles (including verification level and rental preferences), and accept or reject applications.
- **Tenant Communication:** Chat directly with prospective and current tenants.
- **Review System:** Rate tenants on communication, cleanliness, and behavior to help other landlords.
- **Dashboard Analytics:** Track listing views, application counts, and revenue.

### For Administrators
- **Platform Moderation:** Manage users, listings, and reviews.
- **Scam Reporting:** Review and act upon user-reported scams or suspicious activities.
- **Analytics:** View platform-wide metrics and user engagement data.

## 🛠 Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS (v4)
- Framer Motion (Animations)
- Lucide React (Icons)
- React Router DOM
- React Hook Form & Zod (Form Validation)
- Socket.io-client (Real-time features)
- Recharts (Data Visualization)
- Leaflet & React-Leaflet (Maps)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose (Database)
- Socket.io (WebSockets for real-time chat)
- JSON Web Tokens (JWT) for Authentication
- Bcrypt.js (Password Hashing)
- Node-cron (Scheduled tasks)
- Multer (File uploads)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (Local instance or MongoDB Atlas cluster)

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following variables. You can use `.env.example` as a template.

```env
# MongoDB Connection String
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"

# JWT Secret for Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Gemini API Key (If using AI features)
GEMINI_API_KEY="your_gemini_api_key"

# App URL (Used for callbacks and self-referential links)
APP_URL="http://localhost:3000"
```

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will start concurrently, serving the Vite frontend and the Express backend on `http://localhost:3000`.

## 🏗 Project Structure

```text
├── src/                  # Frontend React Application
│   ├── components/       # Reusable UI components (Cards, Modals, Forms)
│   ├── context/          # React Context (AuthContext, etc.)
│   ├── pages/            # Route components (Home, Dashboard, Listing, etc.)
│   ├── App.tsx           # Main React component and Routing
│   ├── index.css         # Global Tailwind CSS
│   └── main.tsx          # React entry point
├── server/               # Backend Express Application
│   ├── controllers/      # Request handlers (Reviews, Bookings, etc.)
│   ├── jobs/             # Scheduled cron jobs
│   ├── models/           # Mongoose schemas (User, Listing, Review, etc.)
│   ├── routes/           # Express API routes
│   ├── services/         # Business logic and third-party integrations
│   ├── utils/            # Helper functions (Socket emitter, aggregators)
│   └── models.ts         # Centralized Mongoose models export
├── server.ts             # Main Express server entry point & Vite middleware
├── package.json          # Project dependencies and scripts
├── vite.config.ts        # Vite bundler configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## 🔌 API Endpoints (Overview)

The backend exposes a RESTful API under the `/api` prefix:

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Listings:** `/api/listings` (GET, POST), `/api/listings/:id` (GET, PUT, DELETE)
- **Applications:** `/api/user/applications`, `/api/homeowner/applications`
- **Reviews:** `/api/reviews/submit`, `/api/reviews/listing/:listingId`
- **Chat:** `/api/conversations`, `/api/messages`
- **Payments:** `/api/payments/initiate`, `/api/payments/verify`

*(Note: Most endpoints require a valid JWT Bearer token in the Authorization header).*

## 🔒 Security Features

- Passwords hashed using `bcryptjs`.
- API endpoints protected via JWT authentication middleware.
- Rate limiting implemented using `express-rate-limit` to prevent brute-force attacks.
- HTTP headers secured using `helmet`.
- Input validation and sanitization.
- Profanity filtering for reviews and messages using `bad-words`.

## 📜 License

This project is licensed under the MIT License.
