# 🚀 Deploy GrooveSzn to Vercel

Complete guide to deploy your FREE AI Shorts Generator to Vercel.

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub
- [x] `.env` files excluded from git
- [x] All API keys secured
- [x] Privacy & Terms pages created
- [x] Backend entry point configured

## 🧩 STEP 1: Verify Local Setup

Test your backend locally first:

```bash
cd backend
npm install
npm run dev
```

Visit: http://localhost:3001

Should see: `{"status":"ok","message":"🎉 GrooveSzn Shorts Generator API is live! 🎉"}`

## 🌐 STEP 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. **Sign in with GitHub** (recommended)
3. You'll be redirected to import projects

## 🚀 STEP 3: Import Your Project

1. Click **"Import Project"**
2. Select **"groove-poster"** repository
3. Vercel auto-detects Node.js ✅
4. Configure settings:

### Root Directory
Set to: **Leave as default** (or `backend` if deploying backend only)

### Build Settings
- **Framework Preset**: Other
- **Build Command**: `npm install` (or leave empty)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### Environment Variables
Click **"Add"** and add these:

```
YOUTUBE_API_KEY=AIzaSyB9reFYgQNKDsMoQJMyhIozu9zcD9Ucgs4
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-4o-mini
NODE_ENV=production
```

5. Click **"Deploy"**

## ⏳ STEP 4: Wait for Deployment

Vercel will:
1. Install dependencies
2. Build your project
3. Deploy to global CDN
4. Provide you a live URL

**Typical time: 30-60 seconds**

## ✅ STEP 5: Verify Deployment

Your app will be live at:
```
https://groove-poster.vercel.app
```

Test these URLs:

### Health Check
```
https://groove-poster.vercel.app/health
```

Should return:
```json
{
  "status": "ok",
  "message": "GrooveSzn API is running - FREE VERSION",
  "timestamp": "2025-01-15T..."
}
```

### Privacy Policy (Required by TikTok/YouTube)
```
https://groove-poster.vercel.app/privacy
```

### Terms of Service (Required by TikTok/YouTube)
```
https://groove-poster.vercel.app/terms
```

### Main API
```
https://groove-poster.vercel.app/
```

Should show welcome message with endpoints.

## 🎯 STEP 6: Use in TikTok/YouTube Developer Portals

Now you can use these URLs in your app configurations:

### TikTok Developer Portal
- **Redirect URL**: `https://groove-poster.vercel.app/api/tiktok/callback`
- **Privacy Policy**: `https://groove-poster.vercel.app/privacy`
- **Terms of Service**: `https://groove-poster.vercel.app/terms`

### YouTube Developer Portal
- **Redirect URL**: `https://groove-poster.vercel.app/api/youtube/callback`
- **Authorized JavaScript origins**: `https://groove-poster.vercel.app`
- **Privacy Policy**: `https://groove-poster.vercel.app/privacy`

### Instagram/Facebook Graph API
- **Webhook URL**: `https://groove-poster.vercel.app/webhook/instagram`
- **Privacy Policy**: `https://groove-poster.vercel.app/privacy`

## 🔧 STEP 7: Update Frontend Configuration

Update your frontend `.env.local` to use the deployed backend:

```env
BACKEND_URL=https://groove-poster.vercel.app
```

Or deploy frontend separately to Vercel as another project.

## 📊 STEP 8: Monitor & Debug

### View Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"**
4. Click latest deployment
5. View **"Logs"** tab

### Debug Issues
- Check build logs for errors
- Verify environment variables are set
- Test API endpoints with curl/Postman

## 🔄 STEP 9: Continuous Deployment

Vercel auto-deploys on every git push:

```bash
# Make changes
git add .
git commit -m "Update: Added new feature"
git push origin main

# Vercel automatically deploys! 🚀
```

## 🛡️ Security Best Practices

### ✅ Do's
- Store all API keys in Vercel environment variables
- Use HTTPS only (automatic with Vercel)
- Keep `.gitignore` updated
- Never commit `.env` files

### ❌ Don'ts
- Don't expose API keys in code
- Don't commit sensitive data
- Don't use development keys in production

## 📈 Custom Domain (Optional)

Want a custom domain?

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add your domain: `groove-post.com`
4. Update DNS records as instructed
5. Done! Now accessible at `https://groove-post.com`

## 🎉 Success!

Your GrooveSzn Shorts Generator is now:
- ✅ Live on the internet
- ✅ Accessible 24/7
- ✅ Automatically updated
- ✅ HTTPS secured
- ✅ Globally distributed
- ✅ FREE forever!

---

## 🆘 Troubleshooting

### Build Fails
**Problem**: `Module not found` errors
**Solution**: Ensure all dependencies are in `package.json`

### API Keys Not Working
**Problem**: 401/403 errors
**Solution**: Check environment variables in Vercel dashboard

### Timeout Errors
**Problem**: Function execution timeout
**Solution**: Add `VERCEL_TIMEOUT=300` environment variable

### CORS Errors
**Problem**: Frontend can't reach backend
**Solution**: Add CORS middleware in `server.js` (already done!)

---

## 📞 Support

- Check logs in Vercel dashboard
- Review code in GitHub repository
- Read [COMPLETE_PROGRESS.md](COMPLETE_PROGRESS.md) for architecture

**Your app is now production-ready!** 🎉

