const nodemailer = require('nodemailer');

let transporter;
const createTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('📧 Email service ready (Production Mode)');
  return transporter;
};

const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  try {
    const emailTransporter = await createTransporter();
    
    const mailOptions = {
      from: '"Job Board" <noreply@jobboard.com>',
      to: candidateEmail,
      subject: `Application Submitted: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #667eea; text-align: center;">✅ Application Confirmed!</h2>
          <p style="font-size: 16px;">Dear Applicant,</p>
          <p style="font-size: 16px;">Your application for <strong style="color: #667eea;">${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
          <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Job Title:</strong> ${jobTitle}</p>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
          </div>
          <p style="font-size: 16px;">We will notify you once the employer reviews your application.</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br><strong>Job Board Team</strong></p>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent to:', candidateEmail);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

const sendApplicationNotification = async (employerEmail, candidateName, jobTitle) => {
  try {
    const emailTransporter = await createTransporter();
    
    const mailOptions = {
      from: '"Job Board" <noreply@jobboard.com>',
      to: employerEmail,
      subject: `🎯 New Application: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #667eea; text-align: center;">📬 New Job Application!</h2>
          <p style="font-size: 16px;">Dear Employer,</p>
          <p style="font-size: 16px;"><strong style="color: #667eea;">${candidateName}</strong> has applied for the position of <strong>${jobTitle}</strong>.</p>
          <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Candidate:</strong> ${candidateName}</p>
            <p style="margin: 5px 0;"><strong>Position:</strong> ${jobTitle}</p>
          </div>
          <p style="font-size: 16px;">Log in to your dashboard to review the application and candidate details.</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br><strong>Job Board Team</strong></p>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Notification email sent to:', employerEmail);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

const sendStatusUpdate = async (candidateEmail, jobTitle, status) => {
  try {
    const emailTransporter = await createTransporter();
    
    const statusMessages = {
      pending: 'Your application is pending review.',
      reviewed: 'Your application has been reviewed by the employer.',
      shortlisted: 'Congratulations! You have been shortlisted for this position.',
      rejected: 'Unfortunately, your application was not selected this time.',
      accepted: 'Congratulations! Your application has been accepted!'
    };

    const statusColors = {
      pending: '#ffc107',
      reviewed: '#17a2b8',
      shortlisted: '#28a745',
      rejected: '#dc3545',
      accepted: '#007bff'
    };

    const mailOptions = {
      from: '"Job Board" <noreply@jobboard.com>',
      to: candidateEmail,
      subject: `Application Status Update: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #667eea; text-align: center;">📢 Application Status Update</h2>
          <p style="font-size: 16px;">Dear Applicant,</p>
          <p style="font-size: 16px;">Your application for <strong>${jobTitle}</strong> has been updated.</p>
          <div style="background-color: ${statusColors[status]}; color: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0; font-size: 24px;">Status: ${status.toUpperCase()}</h3>
          </div>
          <p style="font-size: 16px;">${statusMessages[status]}</p>
          <p style="font-size: 16px;">Log in to your dashboard for more details.</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br><strong>Job Board Team</strong></p>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Status update email sent to:', candidateEmail);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

// NEW: Password reset email
const sendPasswordResetEmail = async (toEmail, userName, resetURL) => {
  try {
    const emailTransporter = await createTransporter();

    const mailOptions = {
      from: '"Job Board" <noreply@jobboard.com>',
      to: toEmail,
      subject: '🔐 Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #667eea; text-align: center;">🔐 Password Reset Request</h2>
          <p style="font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 16px;">We received a request to reset your password. Click the button below to set a new one:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #667eea; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">This link expires in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email — your password will not change.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa; text-align: center;">Job Board · Secure Password Reset</p>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', toEmail);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Error sending reset email:', error.message);
    throw error;
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendApplicationNotification,
  sendStatusUpdate,
  sendPasswordResetEmail
};