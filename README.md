# Email Sending API

A standalone, production-ready email sending API service that can be deployed on **free platforms** (Render, Railway, Fly.io) and used by multiple applications.

## 🚀 Quick Deploy (Recommended: Render - FREE)

1. **Push to GitHub** (see below)
2. **Go to**: https://render.com
3. **Sign up** with GitHub
4. **New** → **Web Service**
5. **Connect** repository: `networkchaos/Send-Emails-API`
6. **Settings**:
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   - Plan: **Free**
7. **Add Environment Variables**:
   - `EMAIL=your_email@gmail.com`
   - `EMAIL_PASSWORD=your_password`
   - `EMAIL_SERVICE=gmail`
8. **Deploy!**

Your API will be live at: `https://your-app-name.onrender.com`

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Create `.env` file:

```env
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_password
EMAIL_SERVICE=gmail
PORT=3001
```

## 🌐 API Endpoints

### Send Email
```
POST /api/send-email
```

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "text": "Email content",
  "html": "<p>Email content</p>"
}
```

### Send Email with Attachments
```
POST /api/send-email-with-attachments
```

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email with Attachments",
  "text": "Please find attachments",
  "attachments": [
    {
      "filename": "document.pdf",
      "path": "/path/to/file.pdf"
    }
  ]
}
```

### Verify Configuration
```
POST /api/verify-config
```

### Health Check
```
GET /health
```

## 🆓 Free Deployment Options

### 1. Render (Recommended) ⭐
- **Free**: 750 hours/month
- **Auto-deploy** on git push
- **HTTPS** included
- **Setup**: 5 minutes

### 2. Railway
- **Free**: $5 credit/month
- **Always on** (no sleep)
- **Auto-deploy** on git push

### 3. Fly.io
- **Free**: 3 VMs, 160GB data
- **Global** edge network
- **Always on**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 💻 Usage Example

```javascript
const response = await fetch('https://your-api-url.com/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello',
    text: 'Email content'
  })
});

const result = await response.json();
console.log(result);
```

## 📚 Documentation

- [Full Documentation](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Usage Examples](./USAGE_EXAMPLES.md)

## 🔒 Security

- Rate limiting (100 requests/15 min per IP)
- CORS enabled
- Helmet.js security headers
- Environment variable configuration

## 📝 License

ISC

---

**Ready to deploy and use! 🚀**
