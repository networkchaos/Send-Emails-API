# Gmail OAuth2 Setup Guide (Works in Kenya!)

This guide shows you how to use Gmail API with OAuth2 authentication, which **works in Kenya** and doesn't require App Passwords!

## 🎯 Why Use Gmail OAuth2?

- ✅ **Works in Kenya** (no App Password restrictions)
- ✅ **Free** (Google's free tier)
- ✅ **Secure** (OAuth2 is more secure than passwords)
- ✅ **No App Passwords needed**
- ✅ **Unlimited usage** (within Google's free tier limits)

## 📋 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to**: https://console.cloud.google.com
2. **Sign in** with your Gmail account
3. **Click**: "Select a project" → "New Project"
4. **Enter project name**: "Email API" (or any name)
5. **Click**: "Create"
6. **Wait** for project creation (30 seconds)

### Step 2: Enable Gmail API

1. **Go to**: https://console.cloud.google.com/apis/library
2. **Search**: "Gmail API"
3. **Click**: "Gmail API"
4. **Click**: "Enable"
5. **Wait** for API to enable

### Step 3: Create OAuth 2.0 Credentials

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Click**: "Create Credentials" → "OAuth client ID"
3. **If prompted**, configure OAuth consent screen:
   - **User Type**: External
   - **App name**: "Email Sending API"
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **Click**: "Save and Continue"
   - **Scopes**: Click "Add or Remove Scopes"
     - Search for: `https://www.googleapis.com/auth/gmail.send`
     - Check it
     - Click "Update" → "Save and Continue"
   - **Test users**: Add your Gmail address
   - **Click**: "Save and Continue" → "Back to Dashboard"

4. **Create OAuth Client ID**:
   - **Application type**: "Web application"
   - **Name**: "Email API Client"
   - **Authorized redirect URIs**: 
     - Add: `http://localhost:3001/api/oauth2/callback`
     - Add: `http://localhost:3000/api/oauth2/callback` (if different port)
   - **Click**: "Create"
   - **Copy** the Client ID and Client Secret (you'll need these)

5. **Download credentials**:
   - **Click**: "Download JSON" (or the download icon)
   - **Save** the file as `credentials.json`
   - **Move** it to the `Send Email` folder

### Step 4: Install Dependencies

```bash
cd "Send Email"
npm install googleapis google-auth-library
```

### Step 5: Authenticate (One-Time Setup)

1. **Start the API**:
   ```bash
   npm start
   ```

2. **Get authorization URL**:
   ```bash
   # Visit in browser:
   http://localhost:3001/api/oauth2/auth
   ```
   
   Or use curl:
   ```bash
   curl http://localhost:3001/api/oauth2/auth
   ```

3. **Copy the `authUrl`** from the response

4. **Open the URL** in your browser

5. **Sign in** with your Gmail account

6. **Click**: "Allow" to grant permissions

7. **Copy the code** from the redirect URL (looks like: `?code=4/0A...`)

8. **Complete authentication**:
   ```bash
   # Replace YOUR_CODE with the code from step 7
   curl "http://localhost:3001/api/oauth2/callback?code=YOUR_CODE"
   ```

9. **Done!** A `token.json` file will be created (don't share this!)

### Step 6: Use Gmail API

Now you can send emails using Gmail API:

```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "This email was sent via Gmail API OAuth2!",
    "useGmailAPI": true
  }'
```

Or set in environment:
```env
USE_GMAIL_API=true
EMAIL=your_email@gmail.com
```

## 🔧 Environment Variables

Add to your `.env` file:

```env
# Gmail OAuth2 Configuration
USE_GMAIL_API=true
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./token.json
EMAIL=your_email@gmail.com
```

## 📁 File Structure

After setup, you should have:

```
Send Email/
├── credentials.json    # From Google Cloud Console (download once)
├── token.json         # Generated after authentication (auto-created)
├── src/
│   ├── index.js
│   └── gmailOAuth.js
└── ...
```

## 🔒 Security Notes

- ⚠️ **Never commit** `credentials.json` or `token.json` to Git
- ✅ They're already in `.gitignore`
- ✅ Keep them secure and private
- ✅ Don't share these files

## 🚀 Deployment

When deploying to Render/Railway/etc:

1. **Upload `credentials.json`** as a secret/environment file
2. **Set environment variable**: `GOOGLE_CREDENTIALS_PATH=/path/to/credentials.json`
3. **Authenticate once** using the deployed URL:
   - Visit: `https://your-app.onrender.com/api/oauth2/auth`
   - Complete OAuth flow
   - Token will be saved automatically

## ✅ Verify Setup

Check if OAuth2 is authenticated:

```bash
curl http://localhost:3001/api/oauth2/status
```

Response:
```json
{
  "success": true,
  "authenticated": true,
  "message": "Gmail OAuth2 is authenticated and ready to use"
}
```

## 🐛 Troubleshooting

### "credentials.json not found"
- Make sure you downloaded it from Google Cloud Console
- Place it in the `Send Email` folder
- Or set `GOOGLE_CREDENTIALS_PATH` environment variable

### "OAuth2 not authenticated"
- Visit `/api/oauth2/auth` to get authorization URL
- Complete the OAuth flow
- Use the code with `/api/oauth2/callback`

### "Token expired"
- The API automatically refreshes tokens
- If it fails, delete `token.json` and re-authenticate

### "Invalid redirect URI"
- Make sure the redirect URI in Google Cloud Console matches:
  - `http://localhost:3001/api/oauth2/callback` (for local)
  - `https://your-app.onrender.com/api/oauth2/callback` (for deployed)

## 🎉 Benefits

- ✅ **Works in Kenya** (no App Password restrictions)
- ✅ **More secure** than App Passwords
- ✅ **Free** to use
- ✅ **Unlimited** within Google's free tier
- ✅ **One-time setup** (token refreshes automatically)

---

**This is the best solution for Gmail in Kenya!** 🇰🇪
