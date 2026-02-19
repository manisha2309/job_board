//const nodemailer = require('nodemailer');



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
// const createTransporter = () => {
//   if (transporter) return transporter;

//   transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });

//   console.log('📧 Email service ready (Production Mode)');
//   return transporter;
// };
  
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
    console.log('👆 Click the link above to see the email in your browser!\n');
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
    console.log('👆 Click the link above to see the email in your browser!\n');
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
    console.log('👆 Click the link above to see the email in your browser!\n');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendApplicationNotification,
  sendStatusUpdate
};