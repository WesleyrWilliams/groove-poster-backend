# 🧪 Complete AI YouTube Shorts Automation Test Guide

## ✅ Full End-to-End Test Script Created!

This guide shows you how to run the complete automation test that:
1. ✅ Fetches trending YouTube Shorts
2. ✅ Analyzes & ranks using OpenRouter AI
3. ✅ Transcribes & detects viral moments
4. ✅ Auto-clips + AI-generates captions (overlay text)
5. ✅ Uploads analytics & reason to Google Sheets
6. ✅ Uploads final clip to YouTube Shorts via API

---

## 📋 Prerequisites

### 1. Install Dependencies

```bash
cd backend
npm install
```

**New dependencies added:**
- `ytdl-core` - Download YouTube videos
- `fluent-ffmpeg` - Video processing (clipping, overlays)

### 2. Install System Tools

**FFmpeg** (required for video processing):
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

**yt-dlp** (optional, better than ytdl-core):
```bash
# macOS
brew install yt-dlp

# Ubuntu/Debian
sudo apt-get install yt-dlp

# Or via pip
pip install yt-dlp
```

### 3. Environment Variables

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
TOP_COUNT=3
EXTRACT_CLIP=true
UPLOAD_TO_YOUTUBE=false  # Set to true to enable actual upload
CLIP_DURATION=30
```

---

## 🚀 Running the Test

### Option 1: Run Full Test Script

```bash
cd backend
npm test
```

or

```bash
node test-ai-youtube-flow-openrouter.js
```

### Option 2: Run with Custom Configuration

```bash
MAX_RESULTS=10 TOP_COUNT=5 EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=false node test-ai-youtube-flow-openrouter.js
```

---

## 📊 What the Test Does

### Step 1: Fetch & Analyze Trending Videos
```
✅ Searches YouTube for trending content
✅ Fetches video details (views, likes, etc.)
✅ Calculates trend scores
✅ Ranks videos by viral potential
✅ Saves top videos to Google Sheets
```

### Step 2: Extract Best Clip (if enabled)
```
✅ Gets video transcript
✅ Uses AI to find most engaging moment
✅ Determines start/end timestamps
✅ Generates viral caption
✅ Downloads video (if EXTRACT_CLIP=true)
✅ Clips video to best moment
✅ Adds caption overlay
```

### Step 3: Upload to YouTube (if enabled)
```
✅ Uploads processed video to YouTube Shorts
✅ Sets title, description, tags
✅ Makes video public
✅ Returns video ID and URL
```

### Step 4: Update Google Sheets
```
✅ Logs all results to Google Sheets
✅ Includes upload status and URLs
```

---

## 🔍 Test Output

You'll see detailed logs like:

```
╔═══════════════════════════════════════════════════════════╗
║   🧪 COMPLETE AI YOUTUBE SHORTS AUTOMATION TEST           ║
╚═══════════════════════════════════════════════════════════╝

📋 Configuration:
   Max Results: 5
   Top Count: 3
   Extract Clip: Yes
   Upload to YouTube: No

═══════════════════════════════════════════════════════════
STEP 1: FETCH & ANALYZE TRENDING VIDEOS
═══════════════════════════════════════════════════════════

🔍 STEP 1: FETCHING TRENDING VIDEOS
   🔎 Searching: "IShowSpeed stream"...
   ✅ Found 3 videos...

📊 STEP 2: ANALYZING & RANKING VIDEOS
   [1/5] Analyzing: Video Title
   📈 Trend Score Calculation:
      Views/Hour: 50,000
      Like Ratio: 10.0%
      🎯 FINAL TREND SCORE: 1250.50

📊 STEP 3: SAVING TO GOOGLE SHEETS
   ✅ Saved 3 videos to Google Sheets

═══════════════════════════════════════════════════════════
STEP 2: EXTRACT BEST CLIP FROM TOP VIDEO
═══════════════════════════════════════════════════════════

🎬 Extracting best clip...
✅ Best clip extracted:
   Start: 120s
   End: 150s
   Duration: 30s
   Reason: Viral moment with high engagement
   Caption: This moment changed everything 🔥

📥 Downloading video...
✂️ Clipping: 120s - 150s
📝 Adding caption overlay...
✅ Video processed: temp/video_final.mp4

╔═══════════════════════════════════════════════════════════╗
║   ✅ COMPLETE TEST SUCCESSFUL!                            ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ⚙️ Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_RESULTS` | 5 | Number of videos to fetch |
| `TOP_COUNT` | 3 | Number of top videos to select |
| `EXTRACT_CLIP` | true | Whether to extract and process video clip |
| `UPLOAD_TO_YOUTUBE` | false | Whether to upload to YouTube Shorts |
| `CLIP_DURATION` | 30 | Default clip duration in seconds |

### Test Modes

**1. Analysis Only (Safe)**
```bash
EXTRACT_CLIP=false UPLOAD_TO_YOUTUBE=false npm test
```
- Fetches and analyzes videos
- Saves to Google Sheets
- No video processing or upload

**2. Full Processing (Test)**
```bash
EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=false npm test
```
- Fetches, analyzes, and processes videos
- Downloads and clips videos
- Adds captions
- Does NOT upload to YouTube

**3. Complete Upload (Production)**
```bash
EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=true npm test
```
- Full processing + upload to YouTube Shorts
- ⚠️ **WARNING**: This will actually upload videos to YouTube!

---

## 🐛 Troubleshooting

### Error: FFmpeg not found
```bash
# Install ffmpeg
brew install ffmpeg  # macOS
sudo apt-get install ffmpeg  # Linux
```

### Error: Video download failed
- Check internet connection
- Verify video URL is accessible
- Try installing `yt-dlp` for better compatibility

### Error: YouTube upload failed
- Verify OAuth credentials are set
- Check `GOOGLE_REFRESH_TOKEN` is valid
- Ensure YouTube API is enabled in Google Cloud Console

### Error: Google Sheets not updating
- Verify `GOOGLE_SHEET_ID` is correct
- Check OAuth has spreadsheet permissions
- Verify sheet exists and is accessible

---

## 📝 Test Checklist

Before running the full test:

- [ ] FFmpeg installed and working
- [ ] ytdl-core or yt-dlp installed
- [ ] All environment variables set
- [ ] OAuth refresh token configured
- [ ] Google Sheet ID configured
- [ ] YouTube API enabled
- [ ] OpenRouter API key valid
- [ ] Test mode (UPLOAD_TO_YOUTUBE=false) first!

---

## 🎯 Next Steps

1. **Run analysis-only test first:**
   ```bash
   EXTRACT_CLIP=false npm test
   ```

2. **Run video processing test:**
   ```bash
   EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=false npm test
   ```

3. **Run full upload test (when ready):**
   ```bash
   EXTRACT_CLIP=true UPLOAD_TO_YOUTUBE=true npm test
   ```

---

## 📚 Files Created

- `backend/test-ai-youtube-flow-openrouter.js` - Main test script
- `backend/src/video-processor.js` - Video download/clip/caption module
- `backend/src/youtube-upload.js` - YouTube upload module
- `backend/COMPLETE_TEST_GUIDE.md` - This guide

---

**Ready to test!** 🚀

Run `npm test` in the backend directory to start!

