import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not found. Email not sent.');
    return;
  }

  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'noreply@lookrooms.com',
    subject,
    text,
    html: html || text,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
