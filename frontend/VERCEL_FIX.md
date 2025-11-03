# 🔧 Fix Vercel Deployment - Next.js Detection

## 🐛 Problem

Vercel is detecting your Next.js app as **Vite** instead of **Next.js**.

This causes build failures because:
- Wrong build command (Vite uses `vite build`, Next.js uses `next build`)
- Wrong output directory (Vite uses `dist`, Next.js uses `.next`)

---

## ✅ Solution: Manual Configuration in Vercel Dashboard

### Step 1: Go to Project Settings

1. Open your Vercel dashboard
2. Go to your `groove-poster-frontend` project
3. Click **Settings** → **General**

### Step 2: Update Framework Preset

1. Find **Framework Preset** section
2. Click **Edit**
3. Select **Next.js** from the dropdown
4. Click **Save**

### Step 3: Update Build Settings

1. Go to **Build & Development Settings**
2. Verify these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `./` (leave empty) |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (auto-filled for Next.js) |
| **Install Command** | `npm install` |

### Step 4: Add Environment Variable

1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   NEXT_PUBLIC_BACKEND_URL = https://groove-poster-backend.vercel.app
   ```

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

---

## 🔍 Alternative: Delete vercel.json

If the above doesn't work:

1. Delete the `vercel.json` file (or leave it minimal)
2. Vercel should auto-detect Next.js based on:
   - `next.config.js` file
   - `next` dependency in `package.json`
   - `app/` or `pages/` directory

### Remove vercel.json:

```bash
git rm vercel.json
git commit -m "Remove vercel.json for auto-detection"
git push
```

Then follow Step 1-5 above to manually set Framework Preset.

---

## ✅ Verification

After fixing, verify:

1. **Framework Preset** shows: `Next.js` ✅
2. **Build Command** shows: `npm run build` ✅
3. **Output Directory** shows: `.next` ✅
4. Build completes successfully ✅

---

## 📝 Why This Happens

Vercel can misdetect frameworks if:
- No `next.config.js` is present (but you have one ✅)
- Package.json doesn't have Next.js (but it does ✅)
- Manual configuration was set incorrectly
- Cached detection from previous attempts

**Solution**: Manually set Framework Preset to Next.js in Vercel dashboard.

---

## 🎯 Quick Fix Checklist

- [ ] Go to Vercel Dashboard → Project Settings
- [ ] Change Framework Preset to **Next.js**
- [ ] Verify Build Command: `npm run build`
- [ ] Verify Output Directory: `.next`
- [ ] Add Environment Variable: `NEXT_PUBLIC_BACKEND_URL`
- [ ] Redeploy

---

## 💡 Pro Tip

After manually setting the Framework Preset, Vercel will remember it for future deployments. You won't need to set it again.

