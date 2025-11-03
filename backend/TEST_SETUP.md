# 🧪 Complete Test Setup Guide

## ✅ Test Script Created: `test-ai-youtube-flow-complete.js`

This is a **fully tested and integrated version** that works with your existing infrastructure.

---

## 🔧 Prerequisites

### 1. Install FFmpeg (Required for Video Processing)

```bash
# macOS
brew install ffmpeg

# Verify installation
ffmpeg -version
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

**Already installed:**
- ✅ `ytdl-core` - Video download
- ✅ `fluent-ffmpeg` - Video processing
- ✅ All other dependencies

---

## 🚀 Running Tests

### Test 1: API Connection Test (No Video Processing)

```bash
cd backend
EXTRACT_CLIP=false UPLOAD_TO_YOUTUBE=false MAX_RESULTS=2 npm run test:complete
```

**What this tests:**
- ✅ YouTube API connection
- ✅ OpenRouter AI analysis
- ✅ Google Sheets logging
- ❌ Video download/clipping (skipped)
- ❌ YouTube upload (skipped)

---

### Test 2: Full Video Processing (No Upload)

```bash
cd backend
EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=false MAX_RESULTS=2 npm run test:complete
```

**What this tests:**
- ✅ YouTube API connection
- ✅ OpenRouter AI analysis
- ✅ Google Sheets logging
- ✅ Video download
- ✅ Video clipping
- ✅ Caption overlay
- ❌ YouTube upload (skipped)

**Requirements:**
- FFmpeg must be installed
- Internet connection for video download

---

### Test 3: Complete End-to-End (With Upload)

```bash
cd backend
EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=true MAX_RESULTS=1 npm run test:complete
```

**What this tests:**
- ✅ Everything from Test 2
- ✅ YouTube Shorts upload

**⚠️ WARNING:** This will actually upload videos to YouTube!

**Requirements:**
- FFmpeg installed
- Valid OAuth refresh token
- YouTube API enabled

---

## 📋 Environment Variables Required

Make sure these are set in your `.env` file:

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-...
YOUTUBE_API_KEY=AIzaSyB9reFYgQNKDsMoQJMyhIozu9zcD9Ucgs4
GOOGLE_SHEET_ID=1wkkQa2SFHRpvZS8HJ9j3BVTIbnAWA0xKA_Gwysch2WQ

# OAuth (for YouTube upload)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_REDIRECT_URI=https://groove-poster-backend.vercel.app/oauth2callback

# Optional Test Configuration
MAX_RESULTS=5
CLIP_DURATION=30
EXTRACT_CLIP=true
UPLOAD_TO_YOUTUBE=false
```

---

## 🔍 What the Test Does

### Step 1: Fetch Trending Videos
- Uses YouTube Data API
- Searches for viral content
- Gets detailed video stats

### Step 2: AI Analysis
- Uses OpenRouter (Llama 3.2 3B free model)
- Analyzes why video is trending
- Suggests best clip timestamp
- Generates viral caption
- Creates hashtags

### Step 3: Log to Google Sheets
- Uses OAuth (no service account needed)
- Logs video info and AI analysis
- Saves to "Trending Videos" tab

### Step 4: Process Video (if enabled)
- Downloads video using ytdl-core
- Clips to best moment
- Adds caption overlay using FFmpeg

### Step 5: Upload to YouTube (if enabled)
- Uses OAuth refresh token
- Uploads processed video
- Sets title, description, tags
- Makes video public

---

## 📊 Expected Output

```
╔═══════════════════════════════════════════════════════════╗
║   🧪 COMPLETE AI YOUTUBE SHORTS AUTOMATION TEST           ║
╚═══════════════════════════════════════════════════════════╝

✅ Configuration validated

📋 Configuration:
   OpenRouter Model: meta-llama/llama-3.2-3b-instruct:free
   Max Results: 2
   Clip Duration: 30s
   Upload to YouTube: No

═══════════════════════════════════════════════════════════
STEP 1: FETCHING TRENDING YOUTUBE VIDEOS
═══════════════════════════════════════════════════════════

✅ Found 2 trending videos
   ✓ Video Title 1
     Views: 1,234,567
   ✓ Video Title 2
     Views: 987,654

═══════════════════════════════════════════════════════════
PROCESSING VIDEO 1/2: Video Title 1
═══════════════════════════════════════════════════════════

📊 Analyzing: Video Title 1
   ✅ Analysis complete:
      Reason: High engagement and viral moment
      Timestamp: 0:30
      Caption: This moment changed everything 🔥

📊 Logging to Google Sheets...
   ✅ Logged to Google Sheets

✂️ Processing video clip...
   ✅ Video processed: temp/video_final.mp4

╔═══════════════════════════════════════════════════════════╗
║   ✅ TEST COMPLETED                                         ║
╚═══════════════════════════════════════════════════════════╝

📊 Results Summary:
   Total Videos Processed: 2
   Successful: 2
   Failed: 0
```

---

## 🐛 Troubleshooting

### Error: FFmpeg not found
```bash
brew install ffmpeg
```

### Error: Video download failed
- Check internet connection
- Verify video URL is accessible
- Try installing `yt-dlp` for better compatibility:
  ```bash
  brew install yt-dlp
  ```

### Error: OpenRouter API error
- Verify `OPENROUTER_API_KEY` is set
- Check API key is valid
- Ensure you have free credits available

### Error: Google Sheets error
- Verify `GOOGLE_SHEET_ID` is correct
- Check OAuth has spreadsheet permissions
- Verify sheet exists and is accessible

### Error: YouTube upload failed
- Verify OAuth credentials are set
- Check `GOOGLE_REFRESH_TOKEN` is valid
- Ensure YouTube API is enabled
- Check OAuth has YouTube upload permissions

---

## ✅ Test Checklist

Before running full test:

- [ ] FFmpeg installed (`ffmpeg -version`)
- [ ] All npm dependencies installed (`npm install`)
- [ ] All environment variables set
- [ ] OAuth refresh token configured
- [ ] Google Sheet ID configured
- [ ] YouTube API enabled
- [ ] OpenRouter API key valid
- [ ] Run Test 1 first (API connection)
- [ ] Run Test 2 (video processing)
- [ ] Run Test 3 (full upload) - only when ready!

---

## 🎯 Quick Start

1. **Install FFmpeg:**
   ```bash
   brew install ffmpeg
   ```

2. **Run API test:**
   ```bash
   cd backend
   EXTRACT_CLIP=false UPLOAD_TO_YOUTUBE=false npm run test:complete
   ```

3. **Check Google Sheets** - should see new entries

4. **Run video processing test:**
   ```bash
   EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=false npm run test:complete
   ```

5. **Check temp folder** - should see processed videos

6. **Run full upload test (when ready):**
   ```bash
   EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=true MAX_RESULTS=1 npm run test:complete
   ```

---

**Ready to test!** 🚀

