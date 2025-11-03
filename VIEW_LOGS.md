# 📊 How to View Detailed Workflow Logs

## ✅ Enhanced Logging is Now Active!

The workflow now logs **every single step** with detailed information about each video found, analyzed, and saved.

---

## 🔍 How to View Logs in Real-Time

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `groove-poster-backend`

2. **View Runtime Logs:**
   - Click **"Deployments"** tab
   - Click on the **latest deployment**
   - Click **"Runtime Logs"** or **"View Function Logs"**
   - You'll see all logs in real-time!

3. **Or Use Observability:**
   - Click **"Observability"** tab
   - Click **"Logs"**
   - Filter by function: `api/index.js`
   - Watch logs stream in real-time!

---

## 📋 What You'll See in Logs

### Step 1: Fetching Trending Videos
```
═══════════════════════════════════════════════════════════
🔍 STEP 1: FETCHING TRENDING VIDEOS
═══════════════════════════════════════════════════════════

📊 Searching 5 queries...

   🔎 Searching: "IShowSpeed stream"...
   ✅ Found 3 videos for "IShowSpeed stream"
      1. Video Title
         Channel: IShowSpeed
         Video ID: abc123
         URL: https://youtube.com/watch?v=abc123

   🔎 Searching: "Kai Cenat stream"...
   ...
```

### Step 2: Analyzing & Ranking
```
═══════════════════════════════════════════════════════════
📊 STEP 2: ANALYZING & RANKING VIDEOS
═══════════════════════════════════════════════════════════

📈 Analyzing 5 videos for trend score...

   [1/5] Analyzing: Video Title
   🔗 URL: https://youtube.com/watch?v=abc123
   📊 Fetching video details...
   ✅ Video Details Retrieved:
      Title: Video Title
      Channel: Channel Name
      Views: 1,234,567
      Likes: 123,456
      Published: 2024-01-15T10:00:00Z
   📈 Trend Score Calculation:
      Views/Hour: 50,000
      Like Ratio: 10.0%
      Hours Since Published: 24
      Channel Bonus: Popular Creator
      🎯 FINAL TREND SCORE: 1250.50
   🎯 Reason: Spike in views: 50000 views/hour
   ✅ Analysis complete
```

### Step 3: Saving to Google Sheets
```
═══════════════════════════════════════════════════════════
📊 STEP 3: SAVING TO GOOGLE SHEETS
═══════════════════════════════════════════════════════════

📋 Sheet ID: 1wkkQa2SFHRpvZS8HJ9j3BVTIbnAWA0xKA_Gwysch2WQ
📊 Preparing to save 3 videos...

📝 Preparing data rows...
   [1/3] Video Title
      Channel: Channel Name
      Score: 1250.50 | Views: 1,234,567
   [2/3] Another Video
   ...

✅ SUCCESS: Saved 3 videos to Google Sheets
📊 Sheet URL: https://docs.google.com/spreadsheets/d/...
📋 Tab: "Trending Videos"
```

### Step 4: Selecting Top Videos
```
═══════════════════════════════════════════════════════════
🎯 STEP 4: SELECTING TOP 3 VIDEOS
═══════════════════════════════════════════════════════════

   1. Video Title
      Channel: Channel Name
      🎯 Trend Score: 1250.50
      📊 Views: 1,234,567
      👍 Likes: 123,456
      📈 Views/Hour: 50,000
      💚 Like Ratio: 10.0%
      ⏰ Published: 2024-01-15T10:00:00Z
      🎯 Reason: Spike in views: 50000 views/hour
      🔗 Link: https://youtube.com/watch?v=abc123
```

### Final Summary
```
╔═══════════════════════════════════════════════════════════╗
║   ✅ TRENDING WORKFLOW COMPLETED SUCCESSFULLY              ║
╚═══════════════════════════════════════════════════════════╝

📊 Summary:
   ✅ Processed 5 videos
   ✅ Selected top 3 videos
   ✅ Saved to Google Sheets
   ⏭️  Clip extraction skipped
```

---

## 🚀 Quick Test

Run this to start a workflow and see logs:

```bash
curl -X POST https://groove-poster-backend.vercel.app/api/trending-workflow \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 5, "topCount": 3, "extractClip": false}'
```

Then immediately check Vercel logs to see the detailed output!

---

## 📝 Log Format

Each log entry includes:
- ✅ **Step numbers** (1, 2, 3, 4, 5, 6)
- ✅ **Clear section headers** with borders
- ✅ **Video details** (title, channel, views, likes)
- ✅ **Trend score calculations** (views/hour, like ratio, etc.)
- ✅ **Progress indicators** ([1/5], [2/5], etc.)
- ✅ **Status messages** (✅ Success, ❌ Error, ⚠️ Warning)
- ✅ **Final summary** with all results

---

## 💡 Tips

1. **Keep Vercel logs open** while testing - logs stream in real-time
2. **Use filters** in Vercel to search for specific terms
3. **Check timestamp** - logs are timestamped automatically
4. **Watch for errors** - they're clearly marked with ❌

---

## 🎯 What to Look For

✅ **Successful Run:**
- All steps complete with ✅
- Videos found and analyzed
- Google Sheets updated
- Final summary shows success

❌ **If Errors:**
- Check error messages (clearly marked)
- Verify API keys in Vercel
- Check OAuth permissions
- Verify Google Sheet ID

---

**Happy monitoring!** 🎉

