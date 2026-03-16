import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const emailService = {
  async sendEmail({ to, subject, templateName, data, userId }: any) {
    const templatePath = path.join(__dirname, `../../templates/emails/${templateName}.html`);
    const htmlSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(htmlSource);
    const html = template({
      ...data,
      currentYear: new Date().getFullYear(),
    });

    const fromEmail = process.env.EMAIL_FROM || 'noreply@lookrooms.com';

    try {
      if (process.env.BREVO_API_KEY) {
        // Use Brevo API
        await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: { email: fromEmail },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
          },
          {
            headers: {
              'api-key': process.env.BREVO_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        return { success: true };
      } else if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid
        await sgMail.send({
          to,
          from: fromEmail,
          subject,
          html
        });
        return { success: true };
      } else {
        // Fallback to Nodemailer
        await transporter.sendMail({
          to,
          from: fromEmail,
          subject,
          html
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }
  }
};
