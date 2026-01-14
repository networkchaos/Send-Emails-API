/**
 * Gmail OAuth2 Authentication
 * Allows Gmail authentication without App Passwords (works in Kenya!)
 * Uses Google OAuth2 which is available worldwide
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

let oauth2Client = null;
let gmailService = null;

/**
 * Initialize Gmail OAuth2 client
 */
function initializeOAuth2() {
  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, '..', 'credentials.json');
  const tokenPath = process.env.GOOGLE_TOKEN_PATH || path.join(__dirname, '..', 'token.json');

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Google credentials file not found at: ${credentialsPath}. Please download credentials.json from Google Cloud Console.`);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web || {};
  
  if (!client_id || !client_secret) {
    throw new Error('Invalid credentials.json file. Missing client_id or client_secret.');
  }

  oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris ? redirect_uris[0] : 'http://localhost:3000/oauth2callback'
  );

  // Load existing token if available
  if (fs.existsSync(tokenPath)) {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    oauth2Client.setCredentials(token);
    
    // Refresh token if expired
    if (token.expiry_date && Date.now() >= token.expiry_date) {
      oauth2Client.refreshAccessToken((err, tokens) => {
        if (!err && tokens) {
          oauth2Client.setCredentials(tokens);
          fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
        }
      });
    }
  }

  return oauth2Client;
}

/**
 * Get authorization URL for OAuth2 flow
 */
function getAuthUrl() {
  if (!oauth2Client) {
    initializeOAuth2();
  }

  const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
function getTokenFromCode(code) {
  return new Promise((resolve, reject) => {
    if (!oauth2Client) {
      initializeOAuth2();
    }

    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        reject(err);
        return;
      }

      oauth2Client.setCredentials(token);
      
      // Save token for future use
      const tokenPath = process.env.GOOGLE_TOKEN_PATH || path.join(__dirname, '..', 'token.json');
      fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));

      resolve(token);
    });
  });
}

/**
 * Check if OAuth2 is authenticated
 */
function isAuthenticated() {
  try {
    if (!oauth2Client) {
      initializeOAuth2();
    }
    
    const tokenPath = process.env.GOOGLE_TOKEN_PATH || path.join(__dirname, '..', 'token.json');
    if (!fs.existsSync(tokenPath)) {
      return false;
    }

    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    return token && token.access_token;
  } catch (error) {
    return false;
  }
}

/**
 * Get Gmail service instance
 */
function getGmailService() {
  if (!oauth2Client) {
    initializeOAuth2();
  }

  if (!gmailService) {
    gmailService = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  return gmailService;
}

/**
 * Send email using Gmail API (OAuth2)
 */
async function sendEmailViaGmailAPI(to, subject, text, html, attachments = []) {
  const gmail = getGmailService();
  
  // Create email message
  const messageParts = [];
  
  // Headers
  messageParts.push(`To: ${to}`);
  messageParts.push(`Subject: ${subject}`);
  messageParts.push('Content-Type: multipart/alternative; boundary="boundary123"');
  messageParts.push('');

  // Text part
  if (text) {
    messageParts.push('--boundary123');
    messageParts.push('Content-Type: text/plain; charset=utf-8');
    messageParts.push('');
    messageParts.push(text);
  }

  // HTML part
  if (html) {
    messageParts.push('--boundary123');
    messageParts.push('Content-Type: text/html; charset=utf-8');
    messageParts.push('');
    messageParts.push(html);
  }

  // Attachments (simplified - for full attachment support, need multipart/mixed)
  messageParts.push('--boundary123--');

  const rawMessage = Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage
      }
    });

    return {
      success: true,
      messageId: response.data.id,
      threadId: response.data.threadId
    };
  } catch (error) {
    throw new Error(`Gmail API error: ${error.message}`);
  }
}

module.exports = {
  initializeOAuth2,
  getAuthUrl,
  getTokenFromCode,
  isAuthenticated,
  sendEmailViaGmailAPI,
  getGmailService
};
