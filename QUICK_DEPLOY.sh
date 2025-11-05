#!/bin/bash
# Quick Deploy Script - Commits and pushes changes to trigger Vercel deployment

echo "🚀 Starting deployment process..."
echo ""

# Check git status
echo "📋 Checking git status..."
git status --short

echo ""
echo "📦 Staging changes..."

# Add new files
git add backend/utils/pingWhisper.js
git add backend/src/video-processor-enhanced.js
git add backend/src/whisper-api.js
git add backend/server.js
git add api/index.js
git add backend/src/openrouter.js
git add backend/src/trending-workflow.js

# Add documentation
git add backend/*.md
git add UPDATE_VERCEL.md

echo "✅ Files staged"
echo ""

# Commit
echo "💾 Committing changes..."
git commit -m "feat: Enhanced video processor with 9:16 layout, HF Whisper API, and auto-ping

- Add 9:16 vertical video processor with title box and watermark
- Integrate Hugging Face Whisper API for subtitles
- Add auto-ping utility to keep HF Space awake every 5 minutes
- Update trending workflow to use enhanced processor
- Add comprehensive documentation"

echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Changes pushed! Vercel will automatically deploy in 1-2 minutes."
echo ""
echo "🔍 Check deployment status at: https://vercel.com/dashboard"
echo ""

