/**
 * Video Processing Module - Fixed Version
 * Uses Node wrappers if system binaries not available
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory for video files
const TEMP_DIR = path.join(__dirname, '../../temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Find FFmpeg binary (try system first, then Node wrapper)
 */
async function findFFmpeg() {
  try {
    // Try system ffmpeg
    await execAsync('which ffmpeg');
    return 'ffmpeg';
  } catch {
    try {
      // Try Node wrapper
      const ffmpegStatic = await import('ffmpeg-static');
      return ffmpegStatic.default || ffmpegStatic;
    } catch {
      throw new Error('FFmpeg not found. Install via: brew install ffmpeg or npm install ffmpeg-static');
    }
  }
}

/**
 * Find yt-dlp binary (try system first, then Python)
 */
async function findYtDlp() {
  try {
    // Try system yt-dlp
    await execAsync('which yt-dlp');
    return 'yt-dlp';
  } catch {
    try {
      // Try Python yt-dlp
      await execAsync('which python3');
      const ytDlpPath = '/Users/mac/Library/Python/3.9/bin/yt-dlp';
      if (fs.existsSync(ytDlpPath)) {
        return ytDlpPath;
      }
      // Try python3 -m yt_dlp
      return 'python3 -m yt_dlp';
    } catch {
      throw new Error('yt-dlp not found. Install via: brew install yt-dlp or pip install yt-dlp');
    }
  }
}

/**
 * Download YouTube video
 */
export async function downloadVideo(videoUrl, outputPath) {
  try {
    console.log(`📥 Downloading video: ${videoUrl}`);
    
    const ytDlp = await findYtDlp();
    
    const command = `${ytDlp} -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${outputPath}" "${videoUrl}"`;
    
    await execAsync(command);
    
    console.log(`✅ Video downloaded: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error downloading video:', error.message);
    throw error;
  }
}

/**
 * Clip video using ffmpeg
 */
export async function clipVideo(inputPath, outputPath, startTime, duration) {
  try {
    console.log(`✂️ Clipping video: ${startTime}s - ${startTime + duration}s`);
    
    const ffmpeg = await findFFmpeg();
    
    const command = `"${ffmpeg}" -i "${inputPath}" -ss ${startTime} -t ${duration} -c:v libx264 -c:a aac -avoid_negative_ts make_zero "${outputPath}" -y`;
    
    await execAsync(command);
    console.log(`✅ Video clipped: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error clipping video:', error.message);
    throw error;
  }
}

/**
 * Add caption overlay to video
 */
export async function addCaptionOverlay(inputPath, outputPath, caption, options = {}) {
  try {
    console.log(`📝 Adding caption overlay: "${caption}"`);
    
    const ffmpeg = await findFFmpeg();
    
    const {
      fontSize = 48,
      position = 'bottom',
      fontColor = 'white',
      backgroundColor = 'black@0.6',
      borderWidth = 2
    } = options;
    
    const escapedCaption = caption.replace(/:/g, '\\:').replace(/'/g, "\\'");
    
    let yPosition;
    if (position === 'top') {
      yPosition = `text_h+10`;
    } else if (position === 'center') {
      yPosition = `(h-text_h)/2`;
    } else {
      yPosition = `h-text_h-20`;
    }
    
    const simpleFilter = `drawtext=text='${escapedCaption}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=${yPosition}:box=1:boxcolor=${backgroundColor}:boxborderw=${borderWidth}`;
    const command = `"${ffmpeg}" -i "${inputPath}" -vf "${simpleFilter}" -c:v libx264 -c:a copy "${outputPath}" -y`;
    
    await execAsync(command);
    console.log(`✅ Caption overlay added: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error adding caption overlay:', error.message);
    return inputPath; // Return original if overlay fails
  }
}

/**
 * Process video: download, clip, and add captions
 */
export async function processVideo(videoUrl, startTime, duration, caption, options = {}) {
  const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 'video';
  const timestamp = `${startTime}-${startTime + duration}`;
  
  const downloadedPath = path.join(TEMP_DIR, `${videoId}_full.mp4`);
  const clippedPath = path.join(TEMP_DIR, `${videoId}_${timestamp}_clip.mp4`);
  const finalPath = path.join(TEMP_DIR, `${videoId}_${timestamp}_final.mp4`);
  
  try {
    // Step 1: Download video
    await downloadVideo(videoUrl, downloadedPath);
    
    // Step 2: Clip video
    await clipVideo(downloadedPath, clippedPath, startTime, duration);
    
    // Step 3: Add caption overlay
    await addCaptionOverlay(clippedPath, finalPath, caption, options);
    
    // Cleanup function
    const cleanup = () => {
      try {
        if (fs.existsSync(downloadedPath)) fs.unlinkSync(downloadedPath);
        if (fs.existsSync(clippedPath)) fs.unlinkSync(clippedPath);
      } catch (error) {
        console.warn('⚠️ Error cleaning up temp files:', error.message);
      }
    };
    
    return {
      videoPath: finalPath,
      cleanup
    };
  } catch (error) {
    console.error('❌ Error processing video:', error.message);
    throw error;
  }
}

/**
 * Clean up all temp files
 */
export function cleanupTempFiles() {
  try {
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      files.forEach(file => {
        const filePath = path.join(TEMP_DIR, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.warn(`⚠️ Could not delete ${file}:`, error.message);
        }
      });
      console.log('✅ Cleaned up temp files');
    }
  } catch (error) {
    console.warn('⚠️ Error cleaning up temp directory:', error.message);
  }
}

