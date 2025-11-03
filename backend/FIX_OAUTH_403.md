# 🔧 Fix OAuth 403 Error - Add Test User

## ❌ Problem

You're seeing:
```
Error 403: access_denied
groove-poster-backend.vercel.app has not completed the Google verification process
```

This happens because your Google OAuth app is in **"Testing"** mode and only approved test users can access it.

---

## ✅ Solution: Add Yourself as Test User

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project: **"auto-groove-poster"** (or the project where you created the OAuth credentials)

### Step 2: Navigate to OAuth Consent Screen

1. In the left menu, go to **"APIs & Services"** → **"OAuth consent screen"**
2. You should see your app is in **"Testing"** mode

### Step 3: Add Test Users

1. Scroll down to **"Test users"** section
2. Click **"+ ADD USERS"** button
3. Add your email address: **litloopy2005@gmail.com**
4. Click **"ADD"**
5. Wait a few seconds for it to save

### Step 4: Try OAuth Again

1. Go back to: `https://groove-poster-backend.vercel.app/oauth2`
2. Sign in with **litloopy2005@gmail.com**
3. It should now work! ✅

---

## 🎯 Alternative: Publish Your App (Optional)

If you want to allow ANY Google user to access (not just test users):

### Option A: Keep Testing Mode (Recommended for now)

- Just add test users (steps above)
- Works for personal use
- No verification needed

### Option B: Publish Your App

**⚠️ Warning**: Publishing requires Google verification which can take days/weeks.

1. In OAuth consent screen, click **"PUBLISH APP"**
2. Google will review your app
3. You'll need to provide:
   - Privacy Policy URL
   - Terms of Service URL
   - App description
   - Scopes justification
4. Wait for Google approval (can take 1-7 days)

**For personal use, just add test users instead!**

---

## 📝 Quick Steps Summary

1. ✅ Go to Google Cloud Console
2. ✅ APIs & Services → OAuth consent screen
3. ✅ Scroll to "Test users"
4. ✅ Click "+ ADD USERS"
5. ✅ Add: **litloopy2005@gmail.com**
6. ✅ Save
7. ✅ Try `/oauth2` again

---

## ✅ After Adding Test User

Once you're added as a test user:
- ✅ OAuth will work for your account
- ✅ You can complete the one-time authorization
- ✅ Get your refresh token
- ✅ Set up permanent connection

---

## 🚨 Still Not Working?

If it still doesn't work after adding test user:

1. **Clear browser cache** and try again
2. **Use incognito/private window**
3. **Make sure you're signed in with litloopy2005@gmail.com** in that browser
4. **Wait 1-2 minutes** after adding test user (takes time to propagate)

---

## 📚 Related

- OAuth Setup Guide: `OAUTH_SETUP.md`
- YouTube OAuth Guide: `YOUTUBE_OAUTH_SETUP.md`

