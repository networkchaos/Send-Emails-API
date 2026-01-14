# Troubleshooting Email Authentication Issues

## 🔴 "Password is correct but being refused" - Common Solutions

### Issue 1: Gmail App Password Required

**Problem**: Gmail doesn't accept regular passwords if 2-Factor Authentication is enabled.

**Solution**: Use an App Password instead of your regular password.

#### Steps to Generate Gmail App Password:

1. **Enable 2-Factor Authentication** (if not already):
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Sign in with your Gmail account
   - Select "Mail" as the app
   - Select "Other (Custom name)" as device
   - Enter name: "Email API"
   - Click "Generate"
   - **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

3. **Use the App Password**:
   ```env
   EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # Use the 16-char password (no spaces)
   EMAIL_SERVICE=gmail
   ```

**Note**: If you can't access App Passwords (not available in your country), use Outlook or custom SMTP instead.

---

### Issue 2: Gmail "Less Secure App Access" (Deprecated)

**Problem**: Google removed "Less Secure App Access" in May 2022.

**Solution**: You MUST use App Passwords now. Regular passwords won't work.

---

### Issue 3: Outlook/Hotmail Authentication

**For Outlook/Hotmail:**

1. **Use your regular password** (if 2FA is disabled)
2. **OR use App Password** (if 2FA is enabled):
   - Go to: https://account.microsoft.com/security
   - Enable 2FA
   - Generate app password

**Configuration:**
```env
EMAIL=your_email@outlook.com
EMAIL_PASSWORD=your_password_or_app_password
EMAIL_SERVICE=outlook
```

---

### Issue 4: Special Characters in Password

**Problem**: Special characters like `#`, `$`, `%`, `&` might cause issues.

**Solution**: 
- Escape special characters in `.env` file
- OR use quotes: `EMAIL_PASSWORD="your#password"`
- OR use App Password (usually doesn't have special chars)

---

### Issue 5: Wrong Email Service Configuration

**Problem**: Using wrong `EMAIL_SERVICE` value.

**Check your configuration:**

```env
# Gmail
EMAIL_SERVICE=gmail

# Outlook
EMAIL_SERVICE=outlook

# Yahoo
EMAIL_SERVICE=yahoo

# Custom SMTP
EMAIL_SERVICE=custom
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

### Issue 6: Password Has Spaces or Extra Characters

**Problem**: Copy-paste might include hidden spaces.

**Solution**:
1. Type password manually
2. Check for leading/trailing spaces
3. Remove any quotes if you added them

---

## 🔍 How to Test Your Configuration

### Test Locally

1. **Create `.env` file** in `Send Email` folder:
   ```env
   EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_SERVICE=gmail
   ```

2. **Start the API**:
   ```bash
   cd "Send Email"
   npm install
   npm start
   ```

3. **Test configuration**:
   ```bash
   curl -X POST http://localhost:3001/api/verify-config \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your_email@gmail.com",
       "password": "your_app_password",
       "service": "gmail"
     }'
   ```

4. **Check the response**:
   - ✅ `"success": true` = Configuration is correct
   - ❌ `"error": "Email authentication failed"` = Wrong password or settings

---

## 🛠️ Step-by-Step Fix

### For Gmail:

1. ✅ **Verify 2FA is enabled**: https://myaccount.google.com/security
2. ✅ **Generate App Password**: https://myaccount.google.com/apppasswords
3. ✅ **Copy the 16-character password** (remove spaces)
4. ✅ **Update `.env`**:
   ```env
   EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # 16 chars, no spaces
   EMAIL_SERVICE=gmail
   ```
5. ✅ **Test** using verify-config endpoint
6. ✅ **If still fails**, try Outlook instead

### For Outlook:

1. ✅ **Use your regular password** (if 2FA disabled)
2. ✅ **OR generate App Password** (if 2FA enabled)
3. ✅ **Update `.env`**:
   ```env
   EMAIL=your_email@outlook.com
   EMAIL_PASSWORD=your_password
   EMAIL_SERVICE=outlook
   ```
4. ✅ **Test** using verify-config endpoint

---

## 🚨 Common Error Messages

### "Missing credentials for PLAIN"
- **Cause**: Password is empty or not set
- **Fix**: Check `EMAIL_PASSWORD` in `.env` file

### "Email authentication failed" (EAUTH)
- **Cause**: Wrong password or need App Password
- **Fix**: Use App Password for Gmail, or check password

### "Could not connect to email server" (ECONNECTION)
- **Cause**: Internet connection or SMTP settings
- **Fix**: Check internet, verify SMTP_HOST and SMTP_PORT

### "535 Authentication failed"
- **Cause**: Wrong credentials
- **Fix**: Double-check email and password

---

## 💡 Quick Fix Checklist

- [ ] Using App Password (not regular password) for Gmail?
- [ ] 2FA enabled on Gmail account?
- [ ] Password copied correctly (no extra spaces)?
- [ ] `EMAIL_SERVICE` matches your email provider?
- [ ] `.env` file exists and has correct values?
- [ ] Tried Outlook instead of Gmail?
- [ ] Tested with verify-config endpoint?

---

## 🔄 Alternative: Use Outlook (Easier)

If Gmail keeps giving issues, **switch to Outlook**:

1. **Create Outlook account** (if you don't have one): https://outlook.com
2. **Use regular password** (no App Password needed if 2FA disabled)
3. **Update `.env`**:
   ```env
   EMAIL=your_email@outlook.com
   EMAIL_PASSWORD=your_outlook_password
   EMAIL_SERVICE=outlook
   ```
4. **Test** - Usually works immediately!

---

## 📞 Still Not Working?

1. **Check server logs** for detailed error messages
2. **Test with verify-config endpoint** to see exact error
3. **Try different email provider** (Outlook, Yahoo)
4. **Verify email and password** work when logging into webmail
5. **Check if account is locked** (too many failed attempts)

---

**Most Common Issue**: Gmail requires App Passwords, not regular passwords! 🔑
