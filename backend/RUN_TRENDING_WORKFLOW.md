# 🚀 Run Trending Workflow - Complete Guide

## ✅ What This Does

The trending workflow automatically:
1. ✅ **Fetches trending videos** from YouTube (popular creators, gaming, reactions)
2. ✅ **Analyzes and ranks** videos using AI trend score
3. ✅ **Selects top videos** based on engagement metrics
4. ✅ **Saves to Google Sheets** with full analytics
5. ✅ **Extracts best clip** using AI moment detection
6. ✅ **Generates captions** for viral moments
7. ✅ **Prepares for YouTube Shorts** upload

---

## 📋 Prerequisites

### ✅ Already Done:
- ✅ YouTube OAuth connected
- ✅ OpenRouter AI configured
- ✅ Backend deployed

### 🔧 Need to Do:
- ⚠️ **Create Google Sheet** and add `GOOGLE_SHEET_ID` to Vercel
- ⚠️ **Add YouTube API Key** (if not already added)

---

## 🎯 Step 1: Set Up Google Sheet

### Create Sheet:
1. Go to https://sheets.google.com
2. Create new spreadsheet
3. Name it: "GrooveSzn Trending Videos"
4. Create a tab named: **"Trending Videos"**
5. Copy the **Spreadsheet ID** from URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
   ```

### Add to Vercel:
1. Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Add:
   - **Name**: `GOOGLE_SHEET_ID`
   - **Value**: Your spreadsheet ID
   - **Environment**: All
3. Redeploy

---

## 🚀 Step 2: Run Trending Workflow

### Option A: API Call (Recommended)

```bash
curl -X POST https://groove-poster-backend.vercel.app/api/trending-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "maxResults": 20,
    "topCount": 5,
    "extractClip": true,
    "uploadToYouTube": false
  }'
```

### Option B: Frontend Dashboard

1. Visit: `https://groove-poster-frontend.vercel.app`
2. Use the dashboard to trigger workflow (coming soon)

### Option C: Simple Request

```bash
curl -X POST https://groove-poster-backend.vercel.app/api/trending-workflow
```

Uses defaults:
- `maxResults`: 20
- `topCount`: 5
- `extractClip`: true
- `uploadToYouTube`: false

---

## 📊 What Happens

### Step 1: Fetch Trending Videos
- Searches for popular creators: IShowSpeed, Kai Cenat, Flensha, etc.
- Searches trending topics: gaming, reactions, viral moments
- Fetches up to 20 videos

### Step 2: Analyze & Rank
- Calculates **Trend Score** for each video:
  - Views per hour (recent spike)
  - Like ratio (engagement)
  - Recency bonus (newer = better)
  - Creator popularity bonus
- Ranks videos by score

### Step 3: Select Top Videos
- Selects top 5 videos (or custom `topCount`)
- Each video gets:
  - Trend Score
  - Reason for selection
  - Engagement stats

### Step 4: Save to Google Sheets
- Creates headers automatically
- Saves all top videos with:
  - Channel Name
  - Video Title
  - Link
  - Trend Score
  - Reason
  - View Count
  - Like Count
  - Views/Hour
  - Like Ratio %
  - Published Date
  - Status

### Step 5: Extract Best Clip (if enabled)
- Gets transcript from top video
- Uses AI to find most viral moment
- Generates caption for clip
- Returns clip metadata:
  - Start time
  - End time
  - Duration
  - Caption
  - Reason

### Step 6: Prepare YouTube Shorts Upload (if enabled)
- Prepares video metadata
- Generates title and description
- Ready for upload (requires video file processing)

---

## 📝 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Trending workflow started",
  "note": "Processing in background - check logs for progress",
  "options": {
    "maxResults": 20,
    "topCount": 5,
    "extractClip": true,
    "uploadToYouTube": false
  }
}
```

### Check Logs:
- View Vercel deployment logs for detailed progress
- Check Google Sheet for results

---

## 🎯 Example: First YouTube Short

### To Upload First Video:

1. **Run workflow with upload enabled:**
```bash
curl -X POST https://groove-poster-backend.vercel.app/api/trending-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "maxResults": 20,
    "topCount": 1,
    "extractClip": true,
    "uploadToYouTube": true
  }'
```

2. **Workflow will:**
   - Find top trending video
   - Extract best clip
   - Generate caption
   - Prepare metadata
   - **Note**: Actual video upload requires video file processing (ffmpeg)

---

## 📊 Google Sheet Format

After workflow runs, your sheet will have:

| Channel Name | Video Title | Link | Trend Score | Reason | View Count | Like Count | Views/Hour | Like Ratio % | Published Date | Status |
|-------------|-------------|------|-------------|--------|------------|------------|------------|--------------|----------------|--------|
| IShowSpeed | Epic Gaming Moment | URL | 95.5 | Spike: 5000 views/hour | 1000000 | 50000 | 5000 | 5.0 | 2025-11-02 | Selected |

---

## 🔧 Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `maxResults` | 20 | Max videos to fetch |
| `topCount` | 5 | Top videos to select |
| `extractClip` | true | Extract best clip from top video |
| `uploadToYouTube` | false | Prepare for YouTube upload |

---

## ✅ Checklist

- [ ] Google Sheet created
- [ ] `GOOGLE_SHEET_ID` added to Vercel
- [ ] Backend redeployed
- [ ] Run workflow via API
- [ ] Check Google Sheet for results
- [ ] Review extracted clips

---

## 🎉 You're Ready!

Once `GOOGLE_SHEET_ID` is set:
1. ✅ Run the workflow
2. ✅ Check Google Sheet for trending videos
3. ✅ Review AI-selected clips
4. ✅ Publish your first YouTube Short!

**Everything else is already configured!** 🚀

