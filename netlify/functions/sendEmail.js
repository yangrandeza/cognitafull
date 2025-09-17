const nodemailer = require('nodemailer');
const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, collection, addDoc, updateDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Configure Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

exports.handler = async (event, context) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, subject, htmlContent, templateId, templateData } = JSON.parse(event.body);

    // Validate required fields
    if (!to) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required field: to'
        })
      };
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Email service not configured',
          details: 'EMAIL_USER and EMAIL_PASS environment variables are required'
        })
      };
    }

    // If using Firebase Extensions (Trigger Email) - fallback to direct sending
    if (templateId) {
      // For now, we'll send directly. In production, you could integrate with Firebase Extensions
      console.log('Template email requested, but sending directly:', templateId);
    }

    // Manual email sending
    if (!subject || !htmlContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: subject and htmlContent'
        })
      };
    }

    // Create transporter
    const transporter = createTransporter();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || `${process.env.EMAIL_USER}`,
      to,
      subject,
      html: htmlContent,
    };

    console.log('Sending email to:', to, 'Subject:', subject);

    // Save email log to Firestore (before sending)
    const emailLogData = {
      to,
      subject,
      template: templateId || 'custom',
      status: 'pending',
      createdAt: serverTimestamp(),
      sentAt: null,
      messageId: null,
      error: null,
    };

    const logRef = await addDoc(collection(db, 'emailLogs'), emailLogData);

    try {
      const info = await transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', info.messageId);

      // Update the same document with success
      await updateDoc(logRef, {
        status: 'sent',
        sentAt: serverTimestamp(),
        messageId: info.messageId,
      });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          messageId: info.messageId,
          message: 'Email sent successfully',
          method: 'direct',
        })
      };
    } catch (sendError) {
      console.error('Error sending email:', sendError);

      // Update the same document with failure
      await updateDoc(logRef, {
        status: 'failed',
        error: sendError.message,
      });

      throw sendError; // Re-throw to be handled by outer catch
    }

  } catch (error) {
    console.error('Error sending email:', error);

    // More specific error messages
    let errorMessage = 'Failed to send email';
    let statusCode = 500;

    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed - check EMAIL_USER and EMAIL_PASS';
      statusCode = 401;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error - check internet connection';
      statusCode = 503;
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid recipient email address';
      statusCode = 400;
    }

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: errorMessage,
        details: error.message,
        code: error.code
      })
    };
  }
};
