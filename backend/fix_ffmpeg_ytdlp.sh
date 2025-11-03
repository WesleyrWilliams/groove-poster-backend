#!/bin/bash
# =============================================
# 🧩 FFmpeg + yt-dlp Fix Script (macOS / Homebrew)
# =============================================

echo "🔍 Checking for stuck brew / curl processes..."

# Step 1: Kill stuck processes
kill -9 21746 83441 2>/dev/null
killall -9 brew curl 2>/dev/null

echo "✅ Killed stuck processes."

# Step 2: Remove incomplete downloads
echo "🧹 Cleaning incomplete downloads and caches..."
rm -f /Users/$USER/Library/Caches/Homebrew/downloads/*incomplete 2>/dev/null
brew cleanup -s

# Step 3: Update Homebrew
echo "⬆️ Updating Homebrew..."
brew update

# Step 4: Attempt FFmpeg install
echo "🎬 Installing FFmpeg (this may take 5–10 minutes)..."
brew install ffmpeg || {
  echo "⚠️ FFmpeg install failed — trying minimal build..."
  brew install ffmpeg --without-libvpx --without-opus
}

# Step 5: Install yt-dlp
echo "📹 Installing yt-dlp..."
brew install yt-dlp

# Step 6: Verify installations
echo "🔎 Verifying installations..."
if command -v ffmpeg >/dev/null 2>&1; then
  echo "✅ FFmpeg Installed: $(ffmpeg -version | head -n 1)"
else
  echo "❌ FFmpeg not found!"
fi

if command -v yt-dlp >/dev/null 2>&1; then
  echo "✅ yt-dlp Installed: $(yt-dlp --version)"
else
  echo "❌ yt-dlp not found!"
fi

echo "🚀 All done!"

