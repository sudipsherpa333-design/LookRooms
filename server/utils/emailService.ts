import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_API_KEY ? 'smtp-relay.brevo.com' : (process.env.EMAIL_HOST || 'smtp.gmail.com'),
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.BREVO_API_KEY ? (process.env.EMAIL_FROM || 'noreply@lookrooms.com') : process.env.EMAIL_USER,
    pass: process.env.BREVO_API_KEY || process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@lookrooms.com';
  
  if (!process.env.BREVO_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
    console.log('Email credentials not set. Skipping email send.');
    console.log('To:', to);
    console.log('Subject:', subject);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"LookRooms" <${fromEmail}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email Send Error:', error);
  }
};
