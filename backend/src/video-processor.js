/**
 * Video Processing Module
 * Downloads, clips, and adds caption overlays to YouTube videos
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
 * Download YouTube video using yt-dlp
 * @param {string} videoUrl - YouTube video URL
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Path to downloaded video
 */
export async function downloadVideo(videoUrl, outputPath) {
  try {
    console.log(`📥 Downloading video: ${videoUrl}`);
    
    // Check if yt-dlp is available, fallback to ytdl-core if needed
    try {
      await execAsync('which yt-dlp');
      
      // Use yt-dlp (best quality)
      const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${outputPath}" "${videoUrl}"`;
      await execAsync(command);
      
      console.log(`✅ Video downloaded: ${outputPath}`);
      return outputPath;
    } catch (error) {
      // Fallback: Use ytdl-core via npm package
      console.log('⚠️ yt-dlp not found, installing ytdl-core...');
      
      // Dynamic import for ytdl-core
      const ytdl = (await import('ytdl-core')).default;
      const writeStream = fs.createWriteStream(outputPath);
      
      return new Promise((resolve, reject) => {
        ytdl(videoUrl, { quality: 'highest' })
          .pipe(writeStream)
          .on('finish', () => {
            console.log(`✅ Video downloaded: ${outputPath}`);
            resolve(outputPath);
          })
          .on('error', reject);
      });
    }
  } catch (error) {
    console.error('❌ Error downloading video:', error.message);
    throw error;
  }
}

/**
 * Clip video using ffmpeg
 * @param {string} inputPath - Input video path
 * @param {string} outputPath - Output clip path
 * @param {number} startTime - Start time in seconds
 * @param {number} duration - Duration in seconds
 * @returns {Promise<string>} Path to clipped video
 */
export async function clipVideo(inputPath, outputPath, startTime, duration) {
  try {
    console.log(`✂️ Clipping video: ${startTime}s - ${startTime + duration}s`);
    
    // Check if ffmpeg is available
    try {
      await execAsync('which ffmpeg');
    } catch (error) {
      throw new Error('ffmpeg not found. Please install ffmpeg: https://ffmpeg.org/download.html');
    }
    
    const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -c:v libx264 -c:a aac -avoid_negative_ts make_zero "${outputPath}" -y`;
    
    await execAsync(command);
    console.log(`✅ Video clipped: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error clipping video:', error.message);
    throw error;
  }
}

/**
 * Add caption overlay to video using ffmpeg
 * @param {string} inputPath - Input video path
 * @param {string} outputPath - Output video path with captions
 * @param {string} caption - Caption text to overlay
 * @param {object} options - Overlay options (fontSize, position, etc.)
 * @returns {Promise<string>} Path to video with captions
 */
export async function addCaptionOverlay(inputPath, outputPath, caption, options = {}) {
  try {
    console.log(`📝 Adding caption overlay: "${caption}"`);
    
    const {
      fontSize = 48,
      position = 'bottom',
      fontColor = 'white',
      backgroundColor = 'black@0.6',
      borderColor = 'white@0.8',
      borderWidth = 2
    } = options;
    
    // Escape caption text for ffmpeg
    const escapedCaption = caption.replace(/:/g, '\\:').replace(/'/g, "\\'");
    
    // Determine position
    let yPosition;
    if (position === 'top') {
      yPosition = `text_h+10`; // Top with padding
    } else if (position === 'center') {
      yPosition = `(h-text_h)/2`; // Center
    } else {
      yPosition = `h-text_h-20`; // Bottom with padding
    }
    
    // Build ffmpeg filter for text overlay
    // Use drawtext filter with better styling
    const textFilter = `drawtext=text='${escapedCaption}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=${yPosition}:box=1:boxcolor=${backgroundColor}:boxborderw=${borderWidth}:fontfile=/System/Library/Fonts/Supplemental/Arial.ttf`;
    
    // Try to use system font, fallback to default if not available
    let command;
    try {
      // Try macOS font path first
      if (fs.existsSync('/System/Library/Fonts/Supplemental/Arial.ttf')) {
        command = `ffmpeg -i "${inputPath}" -vf "${textFilter}" -c:v libx264 -c:a copy "${outputPath}" -y`;
      } else {
        // Use default font
        const simpleFilter = `drawtext=text='${escapedCaption}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=${yPosition}:box=1:boxcolor=${backgroundColor}:boxborderw=${borderWidth}`;
        command = `ffmpeg -i "${inputPath}" -vf "${simpleFilter}" -c:v libx264 -c:a copy "${outputPath}" -y`;
      }
    } catch (error) {
      // Fallback without fontfile
      const simpleFilter = `drawtext=text='${escapedCaption}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=${yPosition}:box=1:boxcolor=${backgroundColor}:boxborderw=${borderWidth}`;
      command = `ffmpeg -i "${inputPath}" -vf "${simpleFilter}" -c:v libx264 -c:a copy "${outputPath}" -y`;
    }
    
    await execAsync(command);
    console.log(`✅ Caption overlay added: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error adding caption overlay:', error.message);
    // If caption overlay fails, return original video
    console.log('⚠️ Returning original video without captions');
    return inputPath;
  }
}

/**
 * Process video: download, clip, and add captions
 * @param {string} videoUrl - YouTube video URL
 * @param {number} startTime - Start time in seconds
 * @param {number} duration - Duration in seconds
 * @param {string} caption - Caption text to overlay
 * @param {object} options - Additional options
 * @returns {Promise<{videoPath: string, cleanup: Function}>} Processed video path and cleanup function
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
        // Keep finalPath for upload
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

