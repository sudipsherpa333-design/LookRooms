import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

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

    try {
      await sgMail.send({
        to,
        from: process.env.EMAIL_FROM || 'noreply@lookrooms.com',
        subject,
        html
      });
      return { success: true };
    } catch (error) {
      console.error('SendGrid failed, falling back to Nodemailer', error);
      await transporter.sendMail({
        to,
        from: process.env.EMAIL_FROM || 'noreply@lookrooms.com',
        subject,
        html
      });
      return { success: true };
    }
  }
};
