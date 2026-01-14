/**
 * Email Sending API
 * Standalone service for sending emails via multiple providers
 * Deployable on Heroku and usable by multiple applications
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
// Port configuration - platforms like Render use PORT from env
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Email Sending API',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Email Sending API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      sendEmail: '/api/send-email',
      sendEmailWithAttachments: '/api/send-email-with-attachments',
      verifyConfig: '/api/verify-config'
    },
    documentation: 'See README.md for usage instructions'
  });
});

/**
 * Create email transporter based on configuration
 */
function createTransporter(config) {
  const {
    email,
    password,
    service = 'gmail',
    smtpHost,
    smtpPort,
    smtpSecure
  } = config;

  if (service === 'custom' && smtpHost) {
    // Custom SMTP configuration
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort) || 587,
      secure: smtpSecure === 'true' || smtpPort === '465',
      auth: {
        user: email,
        pass: password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Predefined service (gmail, outlook, yahoo, etc.)
    return nodemailer.createTransport({
      service: service,
      auth: {
        user: email,
        pass: password
      }
    });
  }
}

/**
 * Send email endpoint
 * POST /api/send-email
 */
app.post('/api/send-email', async (req, res) => {
  try {
    const {
      to,
      subject,
      text,
      html,
      from,
      replyTo,
      // Email configuration (can override env vars)
      email: configEmail,
      password: configPassword,
      service: configService,
      smtpHost,
      smtpPort,
      smtpSecure
    } = req.body;

    // Validation
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email (to) is required'
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Subject is required'
      });
    }

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        error: 'Either text or html content is required'
      });
    }

    // Get email configuration from request or environment
    const emailConfig = {
      email: configEmail || process.env.EMAIL,
      password: configPassword || process.env.EMAIL_PASSWORD,
      service: configService || process.env.EMAIL_SERVICE || 'gmail',
      smtpHost: smtpHost || process.env.SMTP_HOST,
      smtpPort: smtpPort || process.env.SMTP_PORT,
      smtpSecure: smtpSecure || process.env.SMTP_SECURE
    };

    if (!emailConfig.email || !emailConfig.password) {
      return res.status(400).json({
        success: false,
        error: 'Email credentials not provided. Set EMAIL and EMAIL_PASSWORD in environment variables or request body.'
      });
    }

    // Create transporter
    const transporter = createTransporter(emailConfig);

    // Prepare email options
    const mailOptions = {
      from: from || emailConfig.email,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      text: text,
      html: html,
      replyTo: replyTo
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      response: info.response
    });

  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Full error details:', {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    
    let errorMessage = error.message || 'Unknown error';
    let detailedHelp = '';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
      detailedHelp = 'For Gmail: Use an App Password (not your regular password). Generate one at https://myaccount.google.com/apppasswords. For Outlook: Use your regular password or App Password if 2FA is enabled.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your SMTP settings.';
      detailedHelp = 'Check your internet connection and verify SMTP_HOST and SMTP_PORT are correct.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Authentication failed. Invalid email or password.';
      detailedHelp = 'Verify your email and password are correct. For Gmail, use an App Password.';
    } else if (error.command === 'API') {
      errorMessage = 'Gmail API authentication failed.';
      detailedHelp = 'Gmail requires App Passwords when 2FA is enabled. Generate one at https://myaccount.google.com/apppasswords or use Outlook instead.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      help: detailedHelp,
      code: error.code,
      responseCode: error.responseCode
    });
  }
});

/**
 * Send email with attachments
 * POST /api/send-email-with-attachments
 */
app.post('/api/send-email-with-attachments', async (req, res) => {
  try {
    const {
      to,
      subject,
      text,
      html,
      from,
      replyTo,
      attachments, // Array of { filename, path, content, contentType }
      // Email configuration
      email: configEmail,
      password: configPassword,
      service: configService,
      smtpHost,
      smtpPort,
      smtpSecure
    } = req.body;

    // Validation
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email (to) is required'
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Subject is required'
      });
    }

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        error: 'Either text or html content is required'
      });
    }

    // Get email configuration
    const emailConfig = {
      email: configEmail || process.env.EMAIL,
      password: configPassword || process.env.EMAIL_PASSWORD,
      service: configService || process.env.EMAIL_SERVICE || 'gmail',
      smtpHost: smtpHost || process.env.SMTP_HOST,
      smtpPort: smtpPort || process.env.SMTP_PORT,
      smtpSecure: smtpSecure || process.env.SMTP_SECURE
    };

    if (!emailConfig.email || !emailConfig.password) {
      return res.status(400).json({
        success: false,
        error: 'Email credentials not provided. Set EMAIL and EMAIL_PASSWORD in environment variables or request body.'
      });
    }

    // Create transporter
    const transporter = createTransporter(emailConfig);

    // Process attachments
    const processedAttachments = [];
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (attachment.path && fs.existsSync(attachment.path)) {
          // File path provided
          processedAttachments.push({
            filename: attachment.filename || path.basename(attachment.path),
            path: attachment.path
          });
        } else if (attachment.content) {
          // Base64 content provided
          processedAttachments.push({
            filename: attachment.filename || 'attachment',
            content: attachment.content,
            encoding: attachment.encoding || 'base64',
            contentType: attachment.contentType
          });
        }
      }
    }

    // Prepare email options
    const mailOptions = {
      from: from || emailConfig.email,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      text: text,
      html: html,
      replyTo: replyTo,
      attachments: processedAttachments
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully with attachments',
      messageId: info.messageId,
      response: info.response,
      attachmentsCount: processedAttachments.length
    });

  } catch (error) {
    console.error('Error sending email with attachments:', error);
    console.error('Full error details:', {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    
    let errorMessage = error.message || 'Unknown error';
    let detailedHelp = '';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
      detailedHelp = 'For Gmail: Use an App Password (not your regular password). Generate one at https://myaccount.google.com/apppasswords. For Outlook: Use your regular password or App Password if 2FA is enabled.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your SMTP settings.';
      detailedHelp = 'Check your internet connection and verify SMTP_HOST and SMTP_PORT are correct.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Authentication failed. Invalid email or password.';
      detailedHelp = 'Verify your email and password are correct. For Gmail, use an App Password.';
    } else if (error.command === 'API') {
      errorMessage = 'Gmail API authentication failed.';
      detailedHelp = 'Gmail requires App Passwords when 2FA is enabled. Generate one at https://myaccount.google.com/apppasswords or use Outlook instead.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      help: detailedHelp,
      code: error.code,
      responseCode: error.responseCode
    });
  }
});

/**
 * Verify email configuration
 * POST /api/verify-config
 */
app.post('/api/verify-config', async (req, res) => {
  try {
    const {
      email: configEmail,
      password: configPassword,
      service: configService,
      smtpHost,
      smtpPort,
      smtpSecure
    } = req.body;

    // Get email configuration
    const emailConfig = {
      email: configEmail || process.env.EMAIL,
      password: configPassword || process.env.EMAIL_PASSWORD,
      service: configService || process.env.EMAIL_SERVICE || 'gmail',
      smtpHost: smtpHost || process.env.SMTP_HOST,
      smtpPort: smtpPort || process.env.SMTP_PORT,
      smtpSecure: smtpSecure || process.env.SMTP_SECURE
    };

    if (!emailConfig.email || !emailConfig.password) {
      return res.status(400).json({
        success: false,
        error: 'Email credentials not provided'
      });
    }

    // Create transporter
    const transporter = createTransporter(emailConfig);

    // Verify connection
    await transporter.verify();

    res.json({
      success: true,
      message: 'Email configuration is valid',
      email: emailConfig.email,
      service: emailConfig.service
    });

  } catch (error) {
    console.error('Error verifying email config:', error);
    
    let errorMessage = error.message || 'Unknown error';
    let detailedHelp = '';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
      detailedHelp = 'For Gmail: Use an App Password (not your regular password). Generate one at https://myaccount.google.com/apppasswords. For Outlook: Use your regular password or App Password if 2FA is enabled.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your SMTP settings.';
      detailedHelp = 'Check your internet connection and verify SMTP_HOST and SMTP_PORT are correct.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Authentication failed. Invalid email or password.';
      detailedHelp = 'Verify your email and password are correct. For Gmail, use an App Password.';
    } else if (error.command === 'API') {
      errorMessage = 'Gmail API authentication failed.';
      detailedHelp = 'Gmail requires App Passwords when 2FA is enabled. Generate one at https://myaccount.google.com/apppasswords or use Outlook instead.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      help: detailedHelp,
      code: error.code,
      responseCode: error.responseCode
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📧 Email Sending API running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/`);
  
  if (process.env.EMAIL && process.env.EMAIL_PASSWORD) {
    console.log(`✅ Email configured: ${process.env.EMAIL}`);
  } else {
    console.log(`⚠️  Email credentials not set. Set EMAIL and EMAIL_PASSWORD environment variables.`);
  }
});

module.exports = app;
