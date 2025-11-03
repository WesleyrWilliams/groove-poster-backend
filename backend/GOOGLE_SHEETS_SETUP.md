# 📊 Google Sheets Setup Guide

## ✅ Quick Setup

### Step 1: Create Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Name it: "GrooveSzn Trending Videos" (or any name)
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   The `SPREADSHEET_ID_HERE` is what you need!

### Step 2: Create Sheet Tab

1. In your spreadsheet, create a new tab named: **"Trending Videos"**
2. The workflow will automatically add headers:
   - Channel Name
   - Video Title
   - Link
   - Trend Score
   - Reason for Selection
   - View Count
   - Like Count
   - Views/Hour
   - Like Ratio %
   - Published Date
   - Status

### Step 3: Add to Vercel Environment Variables

1. Go to Vercel Dashboard → Your Backend Project
2. Settings → Environment Variables
3. Add:
   - **Variable Name**: `GOOGLE_SHEET_ID`
   - **Value**: Your spreadsheet ID (from Step 1)
   - **Environment**: All
4. Save and redeploy

---

## ✅ That's It!

The workflow will automatically:
- ✅ Create headers if needed
- ✅ Save trending videos to the sheet
- ✅ Update with analysis data
- ✅ Use OAuth (already connected) ✅

---

## 🧪 Test It

After adding `GOOGLE_SHEET_ID`:

1. Visit: `https://groove-poster-backend.vercel.app/api/trending-workflow`
2. Or use frontend to trigger workflow
3. Check your Google Sheet - videos should appear!

---

## 📝 Sheet Format

The workflow creates this structure:

| Channel Name | Video Title | Link | Trend Score | Reason | View Count | Like Count | Views/Hour | Like Ratio % | Published Date | Status |
|-------------|-------------|------|-------------|--------|------------|------------|------------|--------------|----------------|--------|
| Creator Name | Video Title | URL | 85.5 | High engagement | 1000000 | 50000 | 5000 | 5.0 | 2025-11-02 | Selected |

---

## 🔒 Permissions

The OAuth connection already includes:
- ✅ `https://www.googleapis.com/auth/spreadsheets` scope

No additional setup needed! ✅

