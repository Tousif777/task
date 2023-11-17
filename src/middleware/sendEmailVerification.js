const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, verificationCode) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "md.tousif.hossain777@gmail.com",
    to: email,
    subject: "Email Verification",
    html: `
        <h1>Email Verification</h1>
        <p>Hello,</p>
        <p>Please use the following verification code to complete your sign-up:</p>
        <h4>${verificationCode}</h4>
        <p>Don't share your otp with anyone!</p>
        <p>Thank you for signing up!</p>
        <p>Best Regards,</p>
        <p>Quiz Craft Team</p>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email!");
  }
}

module.exports = sendVerificationEmail;
