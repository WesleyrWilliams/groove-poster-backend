# 🚀 Deploy Frontend to Vercel (Preview Guide)

## ✅ Current Status

✅ **All code pushed to GitHub**: https://github.com/WesleyrWilliams/groove-poster.git  
✅ **Latest commit**: New GrooveSzn dashboard interface with tabs and real-time monitoring  
✅ **Frontend ready**: Next.js 14 with TypeScript and Tailwind CSS  
✅ **Backend ready**: Express API with OpenRouter integration

---

## 🎯 Option 1: Deploy Frontend Only (Recommended for Preview)

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**

### Step 2: Import GitHub Repository
1. Select `groove-poster` from your repositories
2. **IMPORTANT**: Set **Root Directory** to `frontend`
   - Click "Edit" next to "Root Directory"
   - Change from `.` to `frontend`
3. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables
Add these in Vercel's environment variables section:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
# OR for local testing:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Step 4: Deploy!
1. Click **"Deploy"**
2. Wait ~2 minutes
3. Get your live URL: `https://your-frontend.vercel.app`

**You'll now see your beautiful GrooveSzn dashboard!** 🎉

---

## 🎯 Option 2: Deploy Full Stack (Frontend + Backend)

### For Backend (API Server):
1. Create a **separate Vercel project** for the backend
2. Set Root Directory to `.` (root)
3. Vercel will use `api/index.js` (serverless function)

### For Frontend:
1. Create **another Vercel project** for the frontend
2. Set Root Directory to `frontend`
3. Add `NEXT_PUBLIC_BACKEND_URL` pointing to your backend URL

---

## 🎨 What You'll See After Deployment

Your frontend will show:

### Dashboard Tab
- ✅ Stats cards (Videos Found, Posted Today, etc.)
- ✅ Flow progress animation
- ✅ Live activity logs
- ✅ Quick process form (Video URL / Channel ID)

### Settings Tab
- ✅ Automation toggle
- ✅ Posting interval selector
- ✅ Batch size input
- ✅ Platform priority selector

### Library Tab
- ✅ Content library grid
- ✅ Video cards with status badges

### Monitor Tab
- ✅ Flow step visualization
- ✅ Real-time notifications

---

## 🔗 Important URLs

After deployment:

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.vercel.app`
- **Health Check**: `https://your-backend.vercel.app/health`

---

## 🐛 Troubleshooting

### If you see "404: NOT_FOUND"
- ✅ Make sure Root Directory is set to `frontend` (not `.`)
- ✅ Verify Next.js is auto-detected (check build logs)

### If frontend can't connect to backend
- ✅ Set `NEXT_PUBLIC_BACKEND_URL` in Vercel environment variables
- ✅ Check CORS settings in backend

### If styles are missing
- ✅ Ensure Tailwind CSS is configured (already done ✅)
- ✅ Check build logs for CSS compilation errors

---

## 📝 Next Steps

1. **Deploy frontend** → Preview the dashboard
2. **Deploy backend** → Enable API calls
3. **Add API keys** → Configure in Vercel environment variables:
   - `OPENROUTER_API_KEY`
   - `YOUTUBE_API_KEY`
   - Social media API keys (optional)

---

## 🎉 Ready to Deploy!

Everything is pushed to GitHub and ready for deployment. Choose **Option 1** to quickly preview your beautiful dashboard!

**GitHub Repository**: https://github.com/WesleyrWilliams/groove-poster

