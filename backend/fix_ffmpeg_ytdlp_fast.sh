#!/bin/bash
# =============================================
# 🚀 FAST FFmpeg + yt-dlp Fix Script (macOS)
# =============================================

echo "🔍 Killing stuck processes..."
killall -9 brew curl ruby 2>/dev/null
sleep 2

echo "🧹 Quick cleanup..."
rm -f /Users/$USER/Library/Caches/Homebrew/downloads/*incomplete 2>/dev/null

echo "📹 Installing yt-dlp (fast - no dependencies)..."
brew install yt-dlp --force 2>&1 | tail -10 &

echo "🎬 Installing FFmpeg (using prebuilt binary - fastest method)..."
cd /tmp
curl -L https://evermeet.cx/ffmpeg/ffmpeg-7.0.zip -o ffmpeg.zip 2>/dev/null
if [ -f ffmpeg.zip ]; then
  unzip -q ffmpeg.zip 2>/dev/null
  sudo mv ffmpeg /usr/local/bin/ 2>/dev/null
  rm ffmpeg.zip 2>/dev/null
  echo "✅ FFmpeg installed via prebuilt binary"
else
  echo "⚠️ Prebuilt download failed, trying Homebrew..."
  brew install ffmpeg --force 2>&1 | tail -10 &
fi

wait

echo "🔎 Verifying..."
if command -v ffmpeg >/dev/null 2>&1; then
  echo "✅ FFmpeg: $(ffmpeg -version 2>&1 | head -1)"
else
  echo "❌ FFmpeg not found"
fi

if command -v yt-dlp >/dev/null 2>&1; then
  echo "✅ yt-dlp: $(yt-dlp --version 2>&1)"
else
  echo "❌ yt-dlp not found"
fi

echo "🚀 Done!"

