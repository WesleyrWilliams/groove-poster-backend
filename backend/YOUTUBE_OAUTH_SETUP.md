# 🎯 Permanent YouTube Connection Setup (One-Time Only)

This guide will help you set up **permanent, automatic connection** to your YouTube account. After the one-time setup, your backend will connect automatically forever - no more OAuth popups!

---

## ✅ Prerequisites

- ✅ YouTube Data API v3 enabled in Google Cloud Console
- ✅ OAuth Client ID and Secret created
- ✅ Backend deployed on Vercel with OAuth routes
- ✅ Environment variables configured (except `GOOGLE_REFRESH_TOKEN`)

---

## 🎯 Goal

Get a **refresh token** that lasts forever, so your backend can automatically generate new access tokens without human interaction.

---

## 📝 Step 1: Complete One-Time OAuth Authorization

### Option A: Use the Built-in Route (Recommended)

1. **Visit the OAuth initiation URL:**
   ```
   https://groove-poster-backend.vercel.app/oauth2
   ```

2. **Sign in to Google:**
   - You'll be redirected to Google's consent screen
   - **IMPORTANT**: Make sure you're signed in to the YouTube account you want to control
   - Click "Allow" on all permission requests

3. **Get redirected back:**
   - After authorization, you'll be redirected to `/oauth2callback`
   - You'll see a page with your **REFRESH TOKEN** displayed prominently
   - **COPY THIS REFRESH TOKEN** - you'll need it in Step 2

### Option B: Manual OAuth URL (If Option A doesn't work)

If the automatic route doesn't work, use this URL directly:

```
https://accounts.google.com/o/oauth2/v2/auth?
client_id=11350076735-cob2brq009olskprupsdg91t0a33ipud.apps.googleusercontent.com&
redirect_uri=https://groove-poster-backend.vercel.app/oauth2callback&
response_type=code&
scope=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/spreadsheets&
access_type=offline&
prompt=consent
```

**Key parameters:**
- `access_type=offline` - Required to get refresh token
- `prompt=consent` - Forces consent screen to always get refresh token

---

## 📋 Step 2: Save Refresh Token to Vercel

After completing OAuth, you'll see your refresh token on the success page.

### Add to Vercel Environment Variables:

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com
   - Open your `groove-poster-backend` project

2. **Navigate to Environment Variables:**
   - Click **Settings** → **Environment Variables**

3. **Add New Variable:**
   - Click **"Add New"**
   - **Variable Name**: `GOOGLE_REFRESH_TOKEN`
   - **Value**: Paste your refresh token (the long string from Step 1)
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

---

## ✅ Step 3: Verify Automatic Connection

After redeploying, test that automatic connection works:

1. **Visit test endpoint:**
   ```
   https://groove-poster-backend.vercel.app/oauth2/test
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "✅ Automatic YouTube connection working!",
     "accessToken": "ya29.a0AfH6SMBx...",
     "note": "Access token refreshed automatically..."
   }
   ```

If you see this ✅, your automatic connection is working!

---

## 🔧 How It Works

### Automatic Token Refresh

Once `GOOGLE_REFRESH_TOKEN` is set, your backend automatically:

1. **Checks if access token is expired**
2. **Uses refresh token to get new access token** (no user interaction needed)
3. **Uses new access token** for YouTube API calls

### Using the Helper Function

Anywhere in your backend code, you can get a valid access token:

```javascript
import { getAccessToken } from './src/oauth-tokens.js';

// Get a valid access token (automatically refreshes if expired)
const accessToken = await getAccessToken();

// Use it for YouTube API calls
const response = await fetch('https://www.googleapis.com/youtube/v3/videos', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 🚨 Troubleshooting

### ❌ "No Refresh Token Received"

**Problem**: After OAuth, you don't see a refresh token.

**Solution**:
1. Make sure you used `prompt=consent` in the OAuth URL
2. Revoke access: https://myaccount.google.com/permissions
3. Try the OAuth flow again
4. Make sure you clicked "Allow" on ALL permission screens

### ❌ "GOOGLE_REFRESH_TOKEN not set"

**Problem**: Test endpoint says refresh token not configured.

**Solution**:
1. Verify `GOOGLE_REFRESH_TOKEN` is set in Vercel environment variables
2. Make sure you selected all environments (Production, Preview, Development)
3. Redeploy after adding the variable

### ❌ "Failed to refresh access token"

**Problem**: Token refresh fails.

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Check that refresh token is correct (no extra spaces)
3. Try revoking and re-authorizing to get a new refresh token

### ❌ "Access Denied" or OAuth Errors

**Problem**: Google shows access denied.

**Solution**:
1. Make sure redirect URI matches exactly: `https://groove-poster-backend.vercel.app/oauth2callback`
2. Check OAuth credentials in Google Cloud Console
3. Verify YouTube API is enabled

---

## 📚 Quick Reference

### OAuth Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/oauth2` | Initiate one-time OAuth flow |
| `/oauth2callback` | Handle OAuth callback (shows refresh token) |
| `/oauth2/test` | Test automatic connection |

### Environment Variables Needed

```env
GOOGLE_CLIENT_ID=11350076735-cob2brq009olskprupsdg91t0a33ipud.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://groove-poster-backend.vercel.app/oauth2callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here  ← Add this after OAuth
```

---

## ✅ Checklist

- [ ] Visited `/oauth2` and completed OAuth authorization
- [ ] Copied refresh token from success page
- [ ] Added `GOOGLE_REFRESH_TOKEN` to Vercel environment variables
- [ ] Redeployed backend on Vercel
- [ ] Tested `/oauth2/test` endpoint (returns success)
- [ ] Automatic connection working ✅

---

## 🎉 Done!

After completing these steps, your backend will:
- ✅ Automatically connect to YouTube forever
- ✅ No more OAuth popups or manual authorization
- ✅ Automatically refresh expired tokens
- ✅ Ready to upload videos and use YouTube APIs

**You only need to do this setup ONCE. After that, it works automatically forever!**

