# 🎤 Hugging Face Whisper Integration Setup

## Overview

This system now uses **Hugging Face Whisper Space** (`wes22-linely-whisper-api`) for subtitle generation instead of OpenAI Whisper API. The backend automatically pings the Space every 5 minutes to keep it awake.

## ✅ What Was Implemented

### 1. Ping Utility (`utils/pingWhisper.js`)
- ✅ Pings Hugging Face Space every 5 minutes
- ✅ Keeps the Space awake and prevents it from sleeping
- ✅ Logs ping status to console
- ✅ Handles errors gracefully

### 2. Updated Whisper API (`src/whisper-api.js`)
- ✅ Uses Hugging Face Whisper Space API
- ✅ Handles multiple response formats
- ✅ Falls back to local Whisper if HF Space fails
- ✅ Converts plain text responses to SRT format

### 3. Auto-Start Ping (`server.js`)
- ✅ Automatically starts pinger when backend starts
- ✅ Works on both local development and Vercel deployment

## 🔗 Hugging Face Space

**Space URL**: `https://wes22-linely-whisper-api.hf.space`

**Space Owner**: `wes22`

**Space Name**: `linely-whisper-api`

## 🚀 How It Works

### Ping Mechanism

The backend automatically:
1. Pings the Space immediately on startup
2. Continues pinging every 5 minutes
3. Logs success/failure to console

### API Integration

When generating subtitles:
1. Reads video file as buffer
2. Sends POST request to HF Space `/api/predict` or `/predict`
3. Handles various response formats
4. Converts response to SRT format if needed
5. Saves SRT file to disk

## 📋 Configuration

### Environment Variables

Optional (defaults to provided Space):
```bash
HF_WHISPER_URL=https://wes22-linely-whisper-api.hf.space
```

### Default Behavior

- **Default**: Uses Hugging Face Whisper Space
- **Fallback**: Uses local Whisper CLI (if installed)
- **Ping**: Automatic every 5 minutes

## 🔧 Usage Examples

### Basic Usage (Auto-detects HF Space)
```javascript
import { generateSRT } from './src/whisper-api.js';

const srtPath = await generateSRT(videoPath, './captions.srt');
```

### Explicitly Use HF Space
```javascript
const srtPath = await generateSRT(videoPath, './captions.srt', {
  useHF: true, // Default
  preferLocal: false
});
```

### Use Local Whisper (Fallback)
```javascript
const srtPath = await generateSRT(videoPath, './captions.srt', {
  useHF: false,
  preferLocal: true,
  model: 'small'
});
```

## 📊 Response Format Handling

The integration handles multiple response formats:

1. **Direct SRT string**: `response.data` is a string
2. **Nested data**: `response.data.data` contains the content
3. **Output field**: `response.data.output` contains the content
4. **Text field**: `response.data.text` contains transcript (converted to SRT)
5. **JSON response**: Parsed and converted to SRT format

## 🐛 Troubleshooting

### Issue: Space returns 404
**Solution**: The integration tries both `/api/predict` and `/predict` endpoints automatically.

### Issue: Space is sleeping
**Solution**: The ping mechanism should keep it awake. Check logs for ping status:
```
✅ Whisper Space pinged successfully: 9:15:03 PM
```

### Issue: Response format not recognized
**Solution**: The integration logs the response. Check logs and update the parsing logic if needed.

### Issue: Timeout errors
**Solution**: Timeout is set to 5 minutes (300000ms). For longer videos, increase timeout or use local Whisper.

## 📝 Logs

You'll see logs like:
```
🔄 Whisper Space pinger started (pinging every 5 minutes)
✅ Whisper Space pinged successfully: 9:15:03 PM
🎤 Generating subtitles with Hugging Face Whisper API...
   Video: ./temp/video.mp4
   Space: https://wes22-linely-whisper-api.hf.space
✅ SRT subtitles generated: ./captions.srt
```

## 🔄 Ping Schedule

- **Initial**: Immediately on backend startup
- **Interval**: Every 5 minutes (300,000 milliseconds)
- **Timeout**: 5 seconds per ping request
- **Logging**: Success/failure logged to console

## 🎯 Benefits

1. **Free**: No API costs (Hugging Face Spaces are free)
2. **Automatic**: No manual intervention needed
3. **Reliable**: Ping keeps Space awake
4. **Flexible**: Falls back to local Whisper if needed

## 📚 Additional Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Whisper Model Documentation](https://huggingface.co/docs/transformers/model_doc/whisper)

---

**Last Updated**: 2024-01-XX
**Status**: ✅ **ACTIVE**

