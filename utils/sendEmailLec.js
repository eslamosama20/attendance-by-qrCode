const nodemailer = require('nodemailer');

// Nodemailer
const sendEmailForLec = async (options) => {
  // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_lec,
    port: process.env.EMAIL_PORT_lec, // if secure false port = 587, if true port= 465
    secure: true,
    auth: {
      user: process.env.EMAIL_Lec,
      pass: process.env.EMAIL_PASSWORD_lec,
    },
  });

  // 2) Define email options (like from, to, subject, email content)
  const mailOpts = {
    from: 'Attendence App <amirasalahsal66@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmailForLec;