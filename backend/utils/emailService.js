const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Email options
  const mailOptions = {
    from: `"Leave Management System" <${process.env.SMTP_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;