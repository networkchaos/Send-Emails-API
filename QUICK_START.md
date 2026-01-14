# Quick Start Guide - Email Sending API

Get your Email Sending API up and running in 10 minutes! This guide covers everything from installation to sending your first email.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- A Gmail account (for Gmail OAuth2) OR Outlook/Yahoo account (for SMTP)

## 🚀 Option 1: Gmail OAuth2 (Recommended for Kenya)

Gmail OAuth2 works in Kenya and doesn't require App Passwords!

### Step 1: Install Dependencies

```bash
cd "Send Email"
npm install
```

This installs:
- Express (web server)
- Nodemailer (SMTP email)
- Google APIs (Gmail OAuth2)
- Security middleware

### Step 2: Set Up Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Sign in** with your Gmail account
3. **Create a new project**:
   - Click "Select a project" → "New Project"
   - Name: "Email API" (or any name)
   - Click "Create"
   - Wait 30 seconds for project creation

4. **Enable Gmail API**:
   - Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
   - Click "Enable"
   - Wait for API to enable

5. **Configure OAuth Consent Screen**:
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Click "Create"
   - **User Type**: Select "External" → "Create"
   - **App Information**:
     - App name: "Email Sending API"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
   - **Scopes**:
     - Click "Add or Remove Scopes"
     - Search: `gmail.send`
     - Check: `https://www.googleapis.com/auth/gmail.send`
     - Click "Update" → "Save and Continue"
   - **Test Users**:
     - Click "Add Users"
     - Add your Gmail address
     - Click "Add" → "Save and Continue"
   - **Summary**: Click "Back to Dashboard"

6. **Create OAuth 2.0 Credentials**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - **Application type**: "Web application"
   - **Name**: "Email API Client"
   - **Authorized redirect URIs**:
     - Add: `http://localhost:10000/api/oauth2/callback` (or your port)
     - (For deployment, also add your production URL)
   - Click "Create"
   - **Download credentials**:
     - Click the download icon (⬇️) next to your OAuth client
     - Save the file as `credentials.json`
     - **Move it to the `Send Email` folder**

### Step 3: Start the API

```bash
npm start
```

You should see:
```
📧 Email Sending API running on port 10000
🌐 Health check: http://localhost:10000/health
📖 API docs: http://localhost:10000/
✅ Email configured: your_email@gmail.com (gmail)
⚠️  Note: Gmail requires App Passwords (not available in all countries).
💡 If authentication fails, try: EMAIL_SERVICE=outlook or create a new Outlook account.
📖 See SOLUTIONS_FOR_KENYA.md for alternatives.
```

**Note**: The port may be different (3001, 10000, etc.) depending on your `PORT` environment variable. The default is 3001, but Render and other platforms may set it to 10000.

### Step 4: Authenticate with Gmail (One-Time)

1. **Get authorization URL**:
   ```bash
   # In browser, visit (replace 10000 with your actual port):
   http://localhost:10000/api/oauth2/auth
   
   # Or use curl:
   curl http://localhost:10000/api/oauth2/auth
   ```
   
   **Note**: Replace `10000` with your actual port (check the terminal output when you start the API).

2. **Copy the `authUrl`** from the response

3. **Open the URL** in your browser

4. **Sign in** with your Gmail account

5. **Click "Allow"** to grant permissions

6. **Copy the code** from the redirect URL:
   - The URL will look like: `http://localhost:10000/api/oauth2/callback?code=4/0A...`
   - Copy everything after `code=` (the long string)
   - **Note**: The port (10000) should match your API port

7. **Complete authentication**:
   ```bash
   # Replace YOUR_CODE with the code from step 6
   curl "http://localhost:3001/api/oauth2/callback?code=YOUR_CODE"
   ```

   You should see:
   ```json
   {
     "success": true,
     "message": "Gmail OAuth2 authentication successful! 🎉"
   }
   ```

8. **Verify authentication**:
   ```bash
   curl http://localhost:3001/api/oauth2/status
   ```

   Should show: `"authenticated": true`

### Step 5: Send Your First Email!

```bash
# Replace 10000 with your actual port
curl -X POST http://localhost:10000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email from Gmail API",
    "text": "This email was sent using Gmail OAuth2! Works in Kenya! 🇰🇪",
    "useGmailAPI": true
  }'
```

**Success response:**
```json
{
  "success": true,
  "message": "Email sent successfully via Gmail API",
  "messageId": "1234567890",
  "method": "gmail_api_oauth2"
}
```

---

## 🚀 Option 2: SMTP (Outlook/Yahoo/Zoho)

If you prefer SMTP or don't want to use Gmail:

### Step 1: Install Dependencies

```bash
cd "Send Email"
npm install
```

### Step 2: Create `.env` File

Create a `.env` file in the `Send Email` folder:

```env
# Email Configuration
EMAIL=your_email@outlook.com
EMAIL_PASSWORD=your_password
EMAIL_SERVICE=outlook

# Port (optional)
PORT=3001
```

**Email Service Options:**
- `outlook` - For Outlook/Hotmail (works in Kenya!)
- `yahoo` - For Yahoo Mail
- `zoho` - For Zoho Mail
- `gmail` - For Gmail (requires App Password, not available in Kenya)
- `custom` - For custom SMTP (see below)

**For Custom SMTP:**
```env
EMAIL=your_email@yourdomain.com
EMAIL_PASSWORD=your_password
EMAIL_SERVICE=custom
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Step 3: Start the API

```bash
npm start
```

### Step 4: Send Your First Email!

```bash
# Replace 10000 with your actual port
curl -X POST http://localhost:10000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "Hello from Email API!"
  }'
```

---

## 🔧 Environment Variables

Create a `.env` file in the `Send Email` folder:

### For Gmail OAuth2:
```env
# Gmail OAuth2 (works in Kenya!)
USE_GMAIL_API=true
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./token.json
EMAIL=your_email@gmail.com
PORT=3001
```

### For SMTP:
```env
# SMTP Configuration
EMAIL=your_email@outlook.com
EMAIL_PASSWORD=your_password
EMAIL_SERVICE=outlook
PORT=10000
# Note: Port 10000 is common for Render. Use 3001 for local development.

# Optional: Custom SMTP
# SMTP_HOST=smtp.yourdomain.com
# SMTP_PORT=587
# SMTP_SECURE=false
```

---

## 📝 API Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Root (API Info)
```bash
curl http://localhost:3001/
```

### Send Email
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello",
    "text": "Email content"
  }'
```

### Send Email with Attachments
```bash
curl -X POST http://localhost:3001/api/send-email-with-attachments \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello",
    "text": "Email content",
    "attachments": [
      {
        "filename": "document.pdf",
        "content": "base64_encoded_content_here",
        "contentType": "application/pdf"
      }
    ]
  }'
```

### Verify Email Configuration
```bash
curl -X POST http://localhost:10000/api/verify-config \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@outlook.com",
    "password": "your_password",
    "service": "outlook"
  }'
```

### Gmail OAuth2 Endpoints (if using Gmail)
```bash
# Get auth URL
curl http://localhost:3001/api/oauth2/auth

# Check status
curl http://localhost:3001/api/oauth2/status

# Complete auth (use code from browser)
curl "http://localhost:3001/api/oauth2/callback?code=YOUR_CODE"
```

---

## 🐛 Troubleshooting

### "credentials.json not found"
- Make sure you downloaded it from Google Cloud Console
- Place it in the `Send Email` folder
- Check the file name is exactly `credentials.json`

### "Gmail OAuth2 not authenticated"
- Visit `/api/oauth2/auth` to get authorization URL
- Complete the OAuth flow in browser
- Use the code with `/api/oauth2/callback`

### "Email authentication failed" (SMTP)
- For Gmail: Use OAuth2 instead (App Passwords not available in Kenya)
- For Outlook: Use your regular password
- Check your email and password are correct

### Port already in use
- Change `PORT` in `.env` file
- Or kill the process using port 3001

### Dependencies not installed
```bash
npm install
```

---

## 🚀 Next Steps

1. **Test the API** - Send a test email to yourself
2. **Deploy** - See `DEPLOYMENT.md` for deployment guides
3. **Integrate** - Use the API in your applications
4. **Read Docs** - See `README.md` for full documentation

---

## 📚 More Documentation

- **Full README**: `README.md`
- **Gmail OAuth2 Setup**: `GMAIL_OAUTH_SETUP.md`
- **Quick OAuth Setup**: `QUICK_OAUTH_SETUP.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Usage Examples**: `USAGE_EXAMPLES.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Kenya Solutions**: `SOLUTIONS_FOR_KENYA.md`

---

## ✅ Quick Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Google Cloud project created (for Gmail OAuth2)
- [ ] Gmail API enabled
- [ ] OAuth credentials created and downloaded
- [ ] `credentials.json` in `Send Email` folder
- [ ] OAuth authentication completed
- [ ] API started (`npm start`)
- [ ] Test email sent successfully

---

**You're all set!** 🎉 Your Email Sending API is ready to use!
