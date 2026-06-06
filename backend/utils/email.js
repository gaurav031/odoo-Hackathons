import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // For development, we can use Ethereal Email (a fake SMTP service provided by Nodemailer)
  // In production, you would use SendGrid, Mailgun, AWS SES, or a real SMTP server.
  
  // Create a test account if we don't have real credentials
  let transporter;
  
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const mailOptions = {
    from: 'VendorBridge ERP <noreply@vendorbridge.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML version
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    console.log('✉️ Email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;
