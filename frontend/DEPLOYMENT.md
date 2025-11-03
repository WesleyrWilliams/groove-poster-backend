# 🚀 Deploy Frontend to Vercel - Step-by-Step Guide

## ✅ Current Status

✅ **Frontend Repository**: https://github.com/WesleyrWilliams/groove-poster-frontend  
✅ **Backend API**: https://groove-poster-backend.vercel.app  
✅ **Frontend Code**: Pushed to GitHub  
✅ **Configuration**: Updated for production backend URL

---

## 🎯 Deployment Steps

### Step 1: Go to Vercel Dashboard

1. Visit [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**

### Step 2: Import Repository

1. Search for `groove-poster-frontend` in your repositories
2. Click **"Import"** next to the repository

### Step 3: Configure Project

Vercel will auto-detect:
- ✅ **Framework**: Next.js
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `.next`

**No changes needed** - Vercel handles everything automatically!

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_BACKEND_URL = https://groove-poster-backend.vercel.app
```

This tells your frontend where to find the backend API.

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait ~2 minutes for the build to complete
3. Get your live URL: `https://groove-poster-frontend.vercel.app`

---

## 🎉 What You'll See

After deployment, visiting your frontend URL will show:

### Dashboard Tab
- 📊 Stats cards (Videos Found, Posted Today, etc.)
- 🎯 Quick Process form (Video URL / Channel ID)
- 📈 Flow progress animation
- 📝 Live activity logs

### Settings Tab
- ⚙️ Automation toggle
- ⏰ Posting interval selector
- 📦 Batch size input
- 🎯 Platform priority selector

### Library Tab
- 📚 Content library grid
- 🎬 Video cards with status badges

### Monitor Tab
- 📊 Flow step visualization
- 🔔 Real-time notifications

---

## 🔗 URLs After Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://groove-poster-frontend.vercel.app` | Your dashboard UI |
| **Backend API** | `https://groove-poster-backend.vercel.app` | API server |
| **Health Check** | `https://groove-poster-backend.vercel.app/health` | API status |

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify `NEXT_PUBLIC_BACKEND_URL` is set in Vercel environment variables
2. Check backend is live: https://groove-poster-backend.vercel.app/health
3. Open browser DevTools → Console tab to see error messages
4. Check for CORS errors (should be handled by backend)

### Issue: 404 or blank page

**Solution:**
1. Check Vercel deployment logs (Deployments → View Logs)
2. Ensure Next.js was auto-detected
3. Verify all files were pushed to GitHub

### Issue: Styles are missing

**Solution:**
1. Check Tailwind CSS is configured (already done ✅)
2. View build logs for CSS compilation errors
3. Ensure `tailwind.config.js` is in the repository

### Issue: Build fails

**Solution:**
1. Check deployment logs for specific error
2. Verify `package.json` has correct scripts:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start"
   }
   ```
3. Ensure all dependencies are listed in `package.json`

---

## 🔄 Updating the Frontend

### After pushing new code:

1. **Automatic**: Vercel auto-deploys on every push to `main` branch
2. **Manual**: Go to Vercel dashboard → Deployments → Redeploy

### After changing environment variables:

1. Go to Vercel dashboard → Settings → Environment Variables
2. Update the variable
3. Redeploy (Vercel will prompt you automatically)

---

## 📝 Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://groove-poster-backend.vercel.app` | ✅ Yes |

**Note**: Variables starting with `NEXT_PUBLIC_` are exposed to the browser.

---

## 🎯 Next Steps After Deployment

1. ✅ **Verify Frontend Works**: Visit your frontend URL
2. ✅ **Test Backend Connection**: Try processing a video
3. ✅ **Check Console**: Open browser DevTools → Console for errors
4. ✅ **Monitor Logs**: Check Vercel deployment logs

---

## 🔗 Related Documentation

- **Frontend README**: See `README.md`
- **Backend Repository**: https://github.com/WesleyrWilliams/groove-poster-backend
- **Full Stack Guide**: Check parent repository

---

## 💡 Pro Tips

1. **Custom Domain**: Add a custom domain in Vercel Settings → Domains
2. **Preview Deployments**: Every PR gets a preview URL automatically
3. **Analytics**: Enable Vercel Analytics to track usage
4. **Monitoring**: Check Vercel logs for API errors

---

## 🎉 You're All Set!

Your frontend is now live and connected to the backend. You can:

- ✅ View your beautiful dashboard
- ✅ Process videos and channels
- ✅ Monitor automation status
- ✅ Manage content library

**Live URLs:**
- Frontend: `https://groove-poster-frontend.vercel.app`
- Backend: `https://groove-poster-backend.vercel.app`

