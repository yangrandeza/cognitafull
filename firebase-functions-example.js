// Firebase Cloud Function Example for Email Sending
// This file should be placed in your Firebase Functions directory
// Install dependencies: npm install nodemailer @google-cloud/firestore

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

admin.initializeApp();

// Configure your email service
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass,
  },
});

// Alternative: SendGrid configuration
// const transporter = nodemailer.createTransporter({
//   host: 'smtp.sendgrid.net',
//   port: 587,
//   auth: {
//     user: 'apikey',
//     pass: functions.config().sendgrid.key,
//   },
// });

// Cloud Function to send queued emails
exports.sendQueuedEmails = functions.firestore
  .document('emailQueue/{emailId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();
    const emailId = context.params.emailId;

    try {
      // Send email
      const mailOptions = {
        from: functions.config().email.from || 'noreply@mudeai.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);

      // Update email status
      await admin.firestore().collection('emailQueue').doc(emailId).update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        messageId: info.messageId,
        attempts: emailData.attempts + 1,
      });

      console.log(`Email sent successfully: ${info.messageId}`);
      return true;

    } catch (error) {
      console.error('Error sending email:', error);

      // Update email status with error
      await admin.firestore().collection('emailQueue').doc(emailId).update({
        status: 'failed',
        error: error.message,
        attempts: emailData.attempts + 1,
        lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // You could implement retry logic here
      return false;
    }
  });

// Cloud Function for immediate email sending
exports.sendEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated (optional)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, htmlContent } = data;

  if (!to || !subject || !htmlContent) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const mailOptions = {
      from: functions.config().email.from || 'noreply@mudeai.com',
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    };

  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Example usage from your frontend:
/*
// Using the API route (recommended)
const result = await sendEmailViaFirebase(
  'student@example.com',
  'Bem-vindo ao MUDEAI!',
  '<h1>Olá!</h1><p>Seu perfil foi criado!</p>'
);

// Using Firebase Extensions (Trigger Email)
// First, install the Trigger Email extension in Firebase Console
const result = await sendEmailViaExtension(
  'student@example.com',
  'welcome-template',
  {
    name: 'João Silva',
    className: 'Turma A',
    loginUrl: 'https://mudeai.com/login'
  }
);
*/
