# 🎬 Enhanced Shorts Generator - Complete Guide

## Overview

This system creates professional 9:16 vertical Shorts (1080×1920) with:
- **Top white title box** with black, bold text (emojis supported)
- **Main video area** scaled/cropped to 9:16 aspect ratio
- **Optional subtitle/caption** overlay below title box
- **Watermark** at bottom-right
- **Auto-generated SRT subtitles** (optional, using Whisper)

## 🎯 Visual Layout Spec

### Dimensions
- **Target Aspect**: Vertical 9:16 (1080 × 1920)
- **Top Title Box**: 
  - Y position: 48px from top
  - Height: 160px
  - Width: 1032px (full width minus 24px padding each side)
  - Background: White
  - Text: Black, bold, centered
- **Subtitle**: 
  - Position: Below title box + 20px
  - Font size: 34px
  - Background: Semi-transparent black box
- **Watermark**: 
  - Position: Bottom-right with 24px margins
- **Safe Zones**: 
  - Keep important faces in vertical center (y ≈ 400–1500px)

### Colors & Styling
- Title box: Solid white (`white@1`)
- Title text: Black (`black`)
- Subtitle: White text with semi-transparent black background (`black@0.5`)
- Watermark: Semi-transparent background for readability

## 📦 New Files Created

1. **`src/video-processor-enhanced.js`** - Enhanced video processor with 9:16 layout
2. **`src/whisper-api.js`** - Whisper API integration for subtitle generation
3. **Enhanced `src/openrouter.js`** - Added `generateVideoAnalysis()` function
4. **Updated `src/trending-workflow.js`** - Integrated enhanced video processor

## 🔧 Enhanced Features

### 1. Enhanced Video Processor (`video-processor-enhanced.js`)

**Main Functions:**
- `processShortVideo()` - Processes video to 9:16 format with title box
- `processVideoToShort()` - Complete workflow: download, clip, process
- `clipVideo()` - Clip video to specific time range
- `downloadVideo()` - Download YouTube video using yt-dlp

**Usage:**
```javascript
import { processVideoToShort } from './video-processor-enhanced.js';

const result = await processVideoToShort(
  videoUrl,
  startTime,
  duration,
  {
    title: "Camilla Araujo reveals that her \"WILL\" for entire $50M net worth is going to her younger BROTHER 😢💖💰",
    subtitle: "No way Camilla Araujo just EXPOSED N3on after she CAUGHT him 'DIPPING'",
    watermarkPath: "./logo.png", // Optional
    subtitleFile: "./captions.srt", // Optional
    titleFontSize: 56,
    subtitleFontSize: 34
  }
);
```

### 2. Enhanced AI Analysis (`openrouter.js`)

**New Function:**
- `generateVideoAnalysis()` - Generates title, timestamps, hashtags, and reason

**Returns:**
```json
{
  "reason": "Why this video is trending...",
  "clips": [
    {
      "start": "00:02",
      "end": "00:22",
      "startSeconds": 2,
      "endSeconds": 22,
      "reason": "Funny reaction moment"
    }
  ],
  "title": "Camilla Araujo reveals that her \"WILL\" for entire $50M net worth is going to her younger BROTHER 😢💖💰",
  "subtitle": "No way Camilla Araujo just EXPOSED N3on after she CAUGHT him 'DIPPING'",
  "hashtags": ["#viral", "#shorts", "#trending"]
}
```

### 3. Whisper Integration (`whisper-api.js`)

**Functions:**
- `generateSRTWithWhisperAPI()` - Uses OpenAI Whisper API (requires `OPENAI_API_KEY`)
- `generateSRTWithLocalWhisper()` - Uses local Whisper CLI
- `generateSRT()` - Auto-detects method
- `transcriptToSRT()` - Converts transcript array to SRT format

**Usage:**
```javascript
import { generateSRT, transcriptToSRT } from './whisper-api.js';

// Option 1: Use Whisper API
const srtPath = await generateSRT(videoPath, './captions.srt', {
  preferLocal: false // Use API
});

// Option 2: Use local Whisper
const srtPath = await generateSRT(videoPath, './captions.srt', {
  preferLocal: true,
  model: 'small' // tiny, base, small, medium, large
});

// Option 3: Convert existing transcript
const srtPath = await transcriptToSRT(transcript, './captions.srt');
```

## 🚀 Usage Examples

### Example 1: Basic Workflow

```javascript
import { runTrendingWorkflow } from './trending-workflow.js';

const result = await runTrendingWorkflow({
  maxResults: 20,
  topCount: 5,
  extractClip: true,
  processVideo: true, // Process with 9:16 layout
  uploadToYouTube: false
});
```

### Example 2: Full Workflow with Watermark

```javascript
import { runTrendingWorkflow } from './trending-workflow.js';

const result = await runTrendingWorkflow({
  maxResults: 20,
  topCount: 5,
  extractClip: true,
  processVideo: true,
  uploadToYouTube: true,
  watermarkPath: './logo.png',
  titleFontSize: 56,
  subtitleFontSize: 34
});
```

### Example 3: With Whisper Subtitles

```javascript
import { extractBestClip } from './trending-workflow.js';
import { generateSRT } from './whisper-api.js';
import path from 'path';

// Extract clip
const clip = await extractBestClip(videoId, false, {
  watermarkPath: './logo.png'
});

// Generate SRT subtitles
const srtPath = path.join('./temp', `${clip.videoId}_captions.srt`);
await generateSRT(clip.videoPath, srtPath, { preferLocal: false });

// Process with subtitles
const { processVideoToShort } = await import('./video-processor-enhanced.js');
const processed = await processVideoToShort(
  clip.videoUrl,
  clip.startTime,
  clip.duration,
  {
    title: clip.title,
    subtitle: clip.subtitle,
    subtitleFile: srtPath,
    watermarkPath: './logo.png'
  }
);
```

## 📋 FFmpeg Command Structure

The enhanced processor builds FFmpeg commands like this:

```bash
ffmpeg -y -i input.mp4 \
  -i logo.png \
  -filter_complex "
    [0:v]scale='if(gt(a,9/16),1080,-2)':'if(gt(a,9/16),-2,1920)'[scaled];
    [scaled]pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black[padded];
    [padded]drawbox=x=24:y=48:w=1032:h=160:color=white@1:t=fill[boxed];
    [boxed]drawtext=text='TITLE':fontcolor=black:fontsize=56:x=(w-text_w)/2:y=88:box=0[titled];
    [titled]drawtext=text='SUBTITLE':fontcolor=white:fontsize=34:x=(w-text_w)/2:y=228:box=1:boxcolor=black@0.5:boxborderw=8[subtitled];
    [subtitled][1:v]overlay=W-w-24:H-h-24[watermarked];
    [watermarked]subtitles='captions.srt':force_style='FontName=Arial,Fontsize=36,PrimaryColour=&HFFFFFF,Outline=2,Shadow=1'[final]
  " \
  -map "[final]" -map 0:a? \
  -c:v libx264 -crf 18 -preset veryfast \
  -c:a aac -b:a 128k \
  output.mp4
```

## ⚙️ Configuration Options

### Video Processing Options

```javascript
{
  title: "Title text",           // Required: Top title
  subtitle: "Subtitle text",     // Optional: Subtitle below title
  watermarkPath: "./logo.png",    // Optional: Watermark image
  subtitleFile: "./captions.srt", // Optional: SRT subtitle file
  titleFontSize: 56,              // Default: 56
  subtitleFontSize: 34            // Default: 34
}
```

### Workflow Options

```javascript
{
  maxResults: 20,                 // Number of videos to fetch
  topCount: 5,                    // Number of top videos to select
  extractClip: true,              // Extract best clip
  processVideo: true,             // Process with 9:16 layout
  uploadToYouTube: false,        // Upload to YouTube
  watermarkPath: "./logo.png",    // Optional watermark
  subtitleFile: null,             // Optional SRT file
  titleFontSize: 56,              // Title font size
  subtitleFontSize: 34            // Subtitle font size
}
```

## 🔍 Font Handling

The system automatically detects fonts in this order:
1. `/System/Library/Fonts/Supplemental/Arial.ttf` (macOS)
2. `/System/Library/Fonts/Helvetica.ttc` (macOS)
3. `/Library/Fonts/Arial.ttf` (macOS)
4. Default system font (fallback)

**Emoji Support:**
- System fonts usually support basic emoji rendering
- For better emoji support, consider using NotoColorEmoji or pre-rendering emojis as PNG overlays

## 📝 Subtitle Generation

### Option 1: YouTube Transcript (Free)
```javascript
import { getTranscript } from './transcript-api.js';
import { transcriptToSRT } from './whisper-api.js';

const transcript = await getTranscript(videoId);
const srtPath = await transcriptToSRT(transcript, './captions.srt');
```

### Option 2: Whisper API (Paid)
```javascript
import { generateSRT } from './whisper-api.js';

// Requires OPENAI_API_KEY
const srtPath = await generateSRT(videoPath, './captions.srt', {
  preferLocal: false
});
```

### Option 3: Local Whisper (Free)
```bash
# Install Whisper CLI
pip install openai-whisper

# Use in code
const srtPath = await generateSRT(videoPath, './captions.srt', {
  preferLocal: true,
  model: 'small'
});
```

## 🚨 Troubleshooting

### Issue: FFmpeg not found
**Solution:** Install FFmpeg:
```bash
brew install ffmpeg
# or
npm install ffmpeg-static
```

### Issue: yt-dlp not found
**Solution:** Install yt-dlp:
```bash
brew install yt-dlp
# or
pip install yt-dlp
```

### Issue: Emojis not rendering
**Solution:** 
1. Use system fonts that support emojis
2. Pre-render emojis as PNG overlays
3. Install NotoColorEmoji font

### Issue: Subtitle file not found
**Solution:** Make sure SRT file path is correct and file exists:
```javascript
const srtPath = path.resolve('./captions.srt');
if (!fs.existsSync(srtPath)) {
  throw new Error('SRT file not found');
}
```

### Issue: Title text too long
**Solution:** Auto-truncate in code:
```javascript
const title = longTitle.substring(0, 100); // Limit to 100 chars
```

## 📊 Testing

### Test Enhanced Video Processor
```javascript
import { processVideoToShort } from './video-processor-enhanced.js';

const result = await processVideoToShort(
  'https://www.youtube.com/watch?v=VIDEO_ID',
  10, // start time
  30, // duration
  {
    title: "Test Title 😢💖💰",
    subtitle: "Test Subtitle"
  }
);

console.log('Video path:', result.videoPath);
```

### Test AI Analysis
```javascript
import { generateVideoAnalysis } from './openrouter.js';
import { getVideoDetails } from './youtube-fetcher.js';
import { getTranscript } from './transcript-api.js';

const details = await getVideoDetails(videoId);
const transcript = await getTranscript(videoId);
const analysis = await generateVideoAnalysis(details, transcript);

console.log('Analysis:', JSON.stringify(analysis, null, 2));
```

## 🎯 Next Steps

1. **Add watermark image** to project root (`logo.png`)
2. **Test with one video** to verify layout
3. **Adjust font sizes** if needed (titleFontSize, subtitleFontSize)
4. **Configure Whisper** if you want subtitles (set OPENAI_API_KEY or install local Whisper)
5. **Run full workflow** with `runTrendingWorkflow()`

## 📚 Additional Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [OpenRouter Documentation](https://openrouter.ai/docs)

