const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use another email service like SendGrid, SMTP, etc.
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Fitness Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📩 Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
  }
};

module.exports = sendEmail;
