# Quick Gmail OAuth2 Setup (5 Minutes) - Works in Kenya! 🇰🇪

## Why This Works

✅ **Gmail OAuth2 works in Kenya** (unlike App Passwords)  
✅ **Free** (Google's free tier)  
✅ **Secure** (OAuth2 is more secure)  
✅ **No App Passwords needed**

## 🚀 Quick Setup

### Step 1: Install Dependencies

```bash
cd "Send Email"
npm install googleapis google-auth-library
```

### Step 2: Get Google Credentials (One-Time)

1. **Go to**: https://console.cloud.google.com
2. **Create project** (or select existing)
3. **Enable Gmail API**:
   - Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
   - Click "Enable"
4. **Create OAuth Credentials**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - **Configure OAuth consent screen** (if first time):
     - User Type: External
     - App name: "Email API"
     - Your email
     - Scopes: Add `https://www.googleapis.com/auth/gmail.send`
     - Test users: Add your Gmail
   - **Create OAuth Client**:
     - Type: Web application
     - Name: "Email API"
     - Redirect URI: `http://localhost:3001/api/oauth2/callback`
     - Click "Create"
   - **Download JSON**: Click download icon
   - **Save as**: `credentials.json` in `Send Email` folder

### Step 3: Authenticate

1. **Start API**:
   ```bash
   npm start
   ```

2. **Get auth URL**:
   ```bash
   # Visit in browser or use curl:
   curl http://localhost:3001/api/oauth2/auth
   ```

3. **Copy the `authUrl`** and open in browser

4. **Sign in** with Gmail and allow permissions

5. **Copy the code** from redirect URL (looks like: `?code=4/0A...`)

6. **Complete auth**:
   ```bash
   curl "http://localhost:3001/api/oauth2/callback?code=YOUR_CODE"
   ```

### Step 4: Send Email!

```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test from Gmail API",
    "text": "This works in Kenya!",
    "useGmailAPI": true
  }'
```

## ✅ Done!

Your Gmail account is now authenticated via OAuth2 and ready to send emails!

## 📝 Environment Variables (Optional)

```env
USE_GMAIL_API=true
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./token.json
```

## 🔍 Check Status

```bash
curl http://localhost:3001/api/oauth2/status
```

---

**This is the solution for Gmail in Kenya!** No App Passwords needed! 🎉
