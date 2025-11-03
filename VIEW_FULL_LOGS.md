# 📊 How to View Full Detailed Logs in Vercel

## ⚠️ Issue: Logs Are Truncated

The logs you're seeing are **truncated** (shortened). Vercel only shows the first few characters in the summary view.

## ✅ Solution: View Full Logs

### Option 1: Click on Individual Log Entries

1. **In Vercel Logs:**
   - Find the log entry you want to see (e.g., `🔎 Searching: "IShowSpeed stream"...`)
   - **Click on the log entry** to expand it
   - You'll see the **full message** with all details

2. **Or Use Function Logs:**
   - Go to **Deployments** → **Latest**
   - Click **"Function Logs"** or **"Runtime Logs"**
   - Click on any log entry to see full details

---

### Option 2: Use Vercel CLI (Best for Full Logs)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **View Logs in Real-Time:**
   ```bash
   vercel logs groove-poster-backend --follow
   ```
   
   This shows **all logs** in real-time, including full details!

---

### Option 3: Use Vercel Observability

1. **Go to Vercel Dashboard:**
   - Select your project: `groove-poster-backend`
   - Click **"Observability"** tab
   - Click **"Logs"**

2. **Filter Logs:**
   - Filter by: `Function: api/index.js`
   - Filter by: `Message contains: "TRENDING WORKFLOW"`
   - Click on any log entry to see **full message**

3. **View Full Message:**
   - Click on any log entry
   - Expand the message to see all details
   - Scroll to see the complete log output

---

## 🔍 What to Look For

The enhanced logs include:

### Step 1: Fetching Videos
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

### Step 2: Analyzing Videos
```
═══════════════════════════════════════════════════════════
📊 STEP 2: ANALYZING & RANKING VIDEOS
═══════════════════════════════════════════════════════════

📈 Analyzing 3 videos for trend score...

   [1/3] Analyzing: Video Title
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

### Step 3: Saving to Sheets
```
═══════════════════════════════════════════════════════════
📊 STEP 3: SAVING TO GOOGLE SHEETS
═══════════════════════════════════════════════════════════

📋 Sheet ID: 1wkkQa2SFHRpvZS8HJ9j3BVTIbnAWA0xKA_Gwysch2WQ
📊 Preparing to save 2 videos...

📝 Preparing data rows...
   [1/2] Video Title
      Channel: Channel Name
      Score: 1250.50 | Views: 1,234,567
   [2/2] Another Video
      ...

✅ SUCCESS: Saved 2 videos to Google Sheets
📊 Sheet URL: https://docs.google.com/spreadsheets/d/...
📋 Tab: "Trending Videos"
```

---

## 🚀 Quick Test

Run this to trigger the workflow:

```bash
curl -X POST https://groove-poster-backend.vercel.app/api/trending-workflow \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 3, "topCount": 2, "extractClip": false}'
```

Then:
1. **Go to Vercel Dashboard**
2. **Click "Observability" → "Logs"**
3. **Filter by:** `api/index.js` or `TRENDING`
4. **Click on log entries** to see full details
5. **Or use:** `vercel logs groove-poster-backend --follow`

---

## 💡 Pro Tips

1. **Use Vercel CLI** for best log viewing experience
2. **Filter logs** by function name or message content
3. **Click on log entries** to expand full messages
4. **Use "Follow" mode** to see logs in real-time
5. **Check "Function Logs"** instead of summary view

---

## ❓ If Logs Still Don't Show Full Details

The logs might be split across multiple log entries. Check:
- Multiple log entries around the same timestamp
- Function execution logs (not just summary)
- Error logs (if any)
- Runtime logs (more detailed than build logs)

---

**The workflow IS working!** The logs are just truncated in the summary view. Use the methods above to see the full detailed output! 🎉

