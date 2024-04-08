"use-strict";
const nodemailer = require("nodemailer");
const config = {
  service: "gmail",
 auth: {
    user: process.env.EMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
};
exports.sendEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport(config);
    return await transporter.sendMail({
      from: "E-commerce@gmail.com",
      to: email,
      subject: "Signup succeeded!",
      html: "<h1>You successfully signed up!</h1>",
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
exports.sendResetEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport(config);
    return await transporter.sendMail({
      from: "E-commerce@gmail.com",
      to: email,
      subject: "Password reset",
      html: `<p>You requested a password reset</p>
      <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
