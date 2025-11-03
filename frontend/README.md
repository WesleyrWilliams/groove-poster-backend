# 🎨 GrooveSzn Frontend - Dashboard Interface

A beautiful Next.js dashboard interface for the GrooveSzn AI Shorts Generator.

## ✨ Features

- 📊 **Real-time Dashboard**: Monitor automation status, stats, and logs
- 🎯 **Quick Process**: Process videos or channels with one click
- ⚙️ **Automation Settings**: Configure posting intervals, batch sizes, platform priority
- 📚 **Content Library**: View all processed videos with status badges
- 📈 **Flow Monitor**: Visualize workflow progress in real-time
- 🎨 **Modern UI**: Beautiful Tailwind CSS design with smooth animations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://groove-poster-backend.vercel.app

# For local development:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to Vercel

### Step 1: Push to GitHub

This repository is already set up at:
**https://github.com/WesleyrWilliams/groove-poster-frontend**

### Step 2: Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import repository: `groove-poster-frontend`
4. Vercel will auto-detect Next.js ✅
5. Add environment variable:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://groove-poster-backend.vercel.app
   ```
6. Click **"Deploy"**

Your dashboard will be live at: `https://groove-poster-frontend.vercel.app`

## 🔗 Backend Connection

This frontend connects to the backend API at:
**https://groove-poster-backend.vercel.app**

### API Endpoints Used:

- `POST /api/process-video` - Process a single video
- `POST /api/process-channel` - Process a YouTube channel
- `GET /health` - Health check

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main dashboard component
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── api/
│       └── n8n-webhook/  # API route (legacy)
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Language**: TypeScript

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | ✅ Yes |

## 🐛 Troubleshooting

### Frontend can't connect to backend

1. Verify `NEXT_PUBLIC_BACKEND_URL` is set in Vercel
2. Check backend is live: https://groove-poster-backend.vercel.app/health
3. Check browser console for CORS errors

### Styles are missing

- Ensure Tailwind CSS is configured (already done ✅)
- Check build logs for CSS compilation errors

### Build fails on Vercel

- Ensure `package.json` has correct scripts
- Check Node.js version (Vercel auto-detects)

## 🔄 Updating Backend URL

If you change your backend URL:

1. Update `NEXT_PUBLIC_BACKEND_URL` in Vercel environment variables
2. Redeploy the frontend

## 📚 Related Repositories

- **Backend**: https://github.com/WesleyrWilliams/groove-poster-backend
- **Full Stack**: https://github.com/WesleyrWilliams/groove-poster

## 📄 License

MIT
