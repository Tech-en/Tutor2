const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || options.text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    throw error;
  }
};

const sendBookingConfirmation = async (booking, student, tutor) => {
  const subject = 'Booking Confirmation - TutorPlatform';
  const html = `
    <h1>Booking Confirmed!</h1>
    <p>Dear ${student.firstName},</p>
    <p>Your booking with ${tutor.firstName} has been confirmed.</p>
    <p><strong>Details:</strong></p>
    <ul>
      <li>Subject: ${booking.subject}</li>
      <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
      <li>Time: ${booking.startTime} - ${booking.endTime}</li>
      <li>Price: $${booking.price}</li>
    </ul>
  `;
  
  return await sendEmail({ to: student.email, subject, html });
};

module.exports = { sendEmail, sendBookingConfirmation };
