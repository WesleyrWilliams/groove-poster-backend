# 🚀 Vercel Environment Variables Setup

## ✅ Important: One Refresh Token for Both!

**You only need ONE refresh token** - it works for both YouTube and Google Sheets because it has both scopes:

- ✅ `https://www.googleapis.com/auth/spreadsheets` (Google Sheets)
- ✅ `https://www.googleapis.com/auth/youtube.readonly` (YouTube read)
- ✅ `https://www.googleapis.com/auth/youtube.upload` (YouTube upload)

---

## 📋 Required Environment Variables for Vercel

Add these to your Vercel project (`groove-poster-backend`):

### 1. Google OAuth Credentials
```
GOOGLE_CLIENT_ID=11350076735-cob2brq009olskprupsdg91t0a33ipud.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://groove-poster-backend.vercel.app/oauth2callback
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
```

### 2. Google OAuth Refresh Token (ONE token for both YouTube & Sheets)
```
GOOGLE_REFRESH_TOKEN=1//05KpF1q7hEkGICgYIARAAGAUSNwF-L9IrGvFYjHTSfXgfNDp_dRyoOwDY-7LYbodfy7M-hkfpa4kN7BBQaM35EH2qxWDMvEwRjws
```

**⚠️ Important:** This ONE refresh token works for:
- ✅ YouTube API (read & upload)
- ✅ Google Sheets API (read & write)

You don't need separate tokens!

---

### 3. Google Sheets
```
GOOGLE_SHEET_ID=1wkkQa2SFHRpvZS8HJ9j3BVTIbnAWA0xKA_Gwysch2WQ
```

### 4. YouTube API
```
YOUTUBE_API_KEY=AIzaSyB9reFYgQNKDsMoQJMyhIozu9zcD9Ucgs4
```

### 5. OpenRouter AI
```
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

### 6. Other Config
```
WEBHOOK_URL=https://groove-poster-backend.vercel.app
PORT=3001
```

---

## 🔧 How to Add to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `groove-poster-backend`

2. **Navigate to Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"**

3. **Add Each Variable:**
   - Click **"Add New"** for each variable above
   - **Variable Name**: (e.g., `GOOGLE_CLIENT_ID`)
   - **Value**: (paste the value)
   - **Environment**: Select **"Production, Preview, Development"** (or just Production)
   - Click **"Save"**

4. **Redeploy:**
   - After adding all variables, go to **"Deployments"** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

---

## ✅ Verification

After adding variables and redeploying:

1. **Test OAuth connection:**
   ```
   https://groove-poster-backend.vercel.app/oauth2/test
   ```
   Should show: ✅ Automatic YouTube connection working!

2. **Test Google Sheets:**
   ```
   https://groove-poster-backend.vercel.app/api/sheets/check
   ```
   Should show: ✅ GOOGLE_SHEET_ID is set

3. **Test trending workflow:**
   ```bash
   curl -X POST https://groove-poster-backend.vercel.app/api/trending-workflow \
     -H "Content-Type: application/json" \
     -d '{"maxResults": 5, "topCount": 3}'
   ```

---

## 📝 Quick Checklist

- [ ] `GOOGLE_CLIENT_ID` added to Vercel
- [ ] `GOOGLE_CLIENT_SECRET` added to Vercel
- [ ] `GOOGLE_REDIRECT_URI` added to Vercel
- [ ] `GOOGLE_REFRESH_TOKEN` added to Vercel (ONE token for both YouTube & Sheets)
- [ ] `GOOGLE_SHEET_ID` added to Vercel
- [ ] `YOUTUBE_API_KEY` added to Vercel
- [ ] `OPENROUTER_API_KEY` added to Vercel
- [ ] `OPENROUTER_MODEL` added to Vercel
- [ ] All variables redeployed
- [ ] Tested OAuth connection
- [ ] Tested Google Sheets connection

---

## ⚠️ Important Notes

1. **ONE Refresh Token:** You only need `GOOGLE_REFRESH_TOKEN` - it works for both YouTube and Sheets because it has both scopes.

2. **If You Need Separate Tokens (Not Recommended):**
   If for some reason you want separate tokens:
   ```
   GOOGLE_REFRESH_TOKEN=your_token_for_both
   GOOGLE_SHEETS_REFRESH_TOKEN=your_sheets_token (optional, not needed)
   GOOGLE_YOUTUBE_REFRESH_TOKEN=your_youtube_token (optional, not needed)
   ```
   But you don't need this - one token works for both!

3. **Security:** Never commit `.env` files to Git. Always use Vercel environment variables for production.

---

**Your refresh token already has both scopes, so ONE token works for everything!** ✅

