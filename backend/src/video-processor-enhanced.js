/**
 * Enhanced Video Processing Module
 * Creates 9:16 Shorts with top title box, watermark, and subtitle overlays
 * Target: 1080x1920 vertical format
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

// Output dimensions
const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1920;

/**
 * Find FFmpeg binary
 */
async function findFFmpeg() {
  try {
    await execAsync('which ffmpeg');
    return 'ffmpeg';
  } catch {
    try {
      const ffmpegStatic = await import('ffmpeg-static');
      return ffmpegStatic.default || ffmpegStatic;
    } catch {
      throw new Error('FFmpeg not found. Install via: brew install ffmpeg or npm install ffmpeg-static');
    }
  }
}

/**
 * Find yt-dlp binary
 */
async function findYtDlp() {
  try {
    await execAsync('which yt-dlp');
    return 'yt-dlp';
  } catch {
    try {
      await execAsync('which python3');
      const ytDlpPath = '/Users/mac/Library/Python/3.9/bin/yt-dlp';
      if (fs.existsSync(ytDlpPath)) {
        return ytDlpPath;
      }
      return 'python3 -m yt_dlp';
    } catch {
      throw new Error('yt-dlp not found. Install via: brew install yt-dlp or pip install yt-dlp');
    }
  }
}

/**
 * Find system font with emoji support
 */
function findFont() {
  const fontPaths = [
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/Library/Fonts/Arial.ttf',
    '/System/Library/Fonts/Supplemental/Helvetica.ttc',
  ];
  
  for (const fontPath of fontPaths) {
    if (fs.existsSync(fontPath)) {
      return fontPath;
    }
  }
  
  return null; // Use default font
}

/**
 * Download YouTube video using yt-dlp
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
 * Escape text for FFmpeg drawtext
 */
function escapeText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

/**
 * Process video to 9:16 format with title box, watermark, and subtitles
 * @param {string} inputPath - Input video path
 * @param {string} outputPath - Output video path
 * @param {object} options - Processing options
 * @param {string} options.title - Top title text (required)
 * @param {string} options.subtitle - Optional subtitle/caption text
 * @param {string} options.watermarkPath - Path to watermark image (optional)
 * @param {string} options.subtitleFile - Path to SRT subtitle file (optional)
 * @param {number} options.titleFontSize - Title font size (default: 56)
 * @param {number} options.subtitleFontSize - Subtitle font size (default: 34)
 * @returns {Promise<string>} Path to processed video
 */
export async function processShortVideo(inputPath, outputPath, options = {}) {
  try {
    console.log(`🎬 Processing short video with 9:16 layout...`);
    console.log(`   Title: ${options.title || 'No title'}`);
    console.log(`   Subtitle: ${options.subtitle || 'No subtitle'}`);
    
    const ffmpeg = await findFFmpeg();
    const fontPath = findFont();
    
    const {
      title = '',
      subtitle = '',
      watermarkPath = null,
      subtitleFile = null,
      titleFontSize = 56,
      subtitleFontSize = 34,
    } = options;
    
    // Escape text for FFmpeg (handle special characters)
    const escapedTitle = escapeText(title);
    const escapedSubtitle = escapeText(subtitle);
    
    // Build filter complex
    const filters = [];
    let hasWatermark = watermarkPath && fs.existsSync(watermarkPath);
    let hasSubtitleFile = subtitleFile && fs.existsSync(subtitleFile);
    
    // Step 1: Scale and crop to 9:16 (1080x1920)
    filters.push(
      `[0:v]scale='if(gt(a,9/16),${TARGET_WIDTH},-2)':'if(gt(a,9/16),-2,${TARGET_HEIGHT})'[scaled]`
    );
    filters.push(
      `[scaled]pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black[padded]`
    );
    
    // Step 2: Draw white title box at top
    const titleBoxY = 48; // ~40-90px from top (using 48px)
    const titleBoxHeight = 160; // ~120-180px height
    const titleBoxPadding = 24; // Side padding
    const titleBoxWidth = TARGET_WIDTH - (titleBoxPadding * 2);
    
    filters.push(
      `[padded]drawbox=x=${titleBoxPadding}:y=${titleBoxY}:w=${titleBoxWidth}:h=${titleBoxHeight}:color=white@1:t=fill[boxed]`
    );
    
    // Step 3: Add title text (centered in white box)
    const titleY = titleBoxY + 40; // Center vertically in box (approx)
    const fontParam = fontPath ? `:fontfile='${fontPath}'` : '';
    
    if (title) {
      filters.push(
        `[boxed]drawtext=text='${escapedTitle}':fontcolor=black:fontsize=${titleFontSize}:x=(w-text_w)/2:y=${titleY}:box=0${fontParam}[titled]`
      );
    } else {
      filters.push(`[boxed]copy[titled]`);
    }
    
    // Step 4: Add optional subtitle below title box
    let currentLabel = 'titled';
    if (subtitle) {
      const subtitleY = titleBoxY + titleBoxHeight + 20;
      filters.push(
        `[${currentLabel}]drawtext=text='${escapedSubtitle}':fontcolor=white:fontsize=${subtitleFontSize}:x=(w-text_w)/2:y=${subtitleY}:box=1:boxcolor=black@0.5:boxborderw=8${fontParam}[subtitled]`
      );
      currentLabel = 'subtitled';
    }
    
    // Step 5: Add watermark if provided
    if (hasWatermark) {
      filters.push(
        `[${currentLabel}][1:v]overlay=W-w-24:H-h-24[watermarked]`
      );
      currentLabel = 'watermarked';
    }
    
    // Build FFmpeg command
    let command = `"${ffmpeg}" -y -i "${inputPath}"`;
    
    // Add watermark input if provided
    if (hasWatermark) {
      command += ` -i "${watermarkPath}"`;
    }
    
    // Add subtitle file if provided (using separate -vf filter after main chain)
    if (hasSubtitleFile) {
      // For SRT subtitles, we add them after the main filter chain
      // We'll use a two-pass approach: first main filters, then subtitles
      filters.push(`[${currentLabel}]subtitles='${subtitleFile}':force_style='FontName=Arial,Fontsize=36,PrimaryColour=&HFFFFFF,Outline=2,Shadow=1'[final]`);
      currentLabel = 'final';
    }
    
    // Build filter_complex
    const filterComplex = filters.join(';');
    command += ` -filter_complex "${filterComplex}"`;
    
    // Map output
    command += ` -map "[${currentLabel}]" -map 0:a?`;
    
    // Encoding settings for high quality
    command += ` -c:v libx264 -crf 18 -preset veryfast -c:a aac -b:a 128k "${outputPath}"`;
    
    console.log(`🔧 Running FFmpeg command...`);
    console.log(`   Filter chain: ${filters.length} filters`);
    await execAsync(command);
    
    console.log(`✅ Short video processed: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error processing short video:', error.message);
    if (error.stderr) {
      console.error('FFmpeg error:', error.stderr);
    }
    throw error;
  }
}

/**
 * Clip video to specific time range
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
 * Complete workflow: Download, clip, and process to 9:16 short format
 * @param {string} videoUrl - YouTube video URL
 * @param {number} startTime - Start time in seconds
 * @param {number} duration - Duration in seconds (15-60 recommended)
 * @param {object} options - Processing options
 * @param {string} options.title - Top title text (required)
 * @param {string} options.subtitle - Optional subtitle text
 * @param {string} options.watermarkPath - Path to watermark image
 * @param {string} options.subtitleFile - Path to SRT subtitle file
 * @returns {Promise<{videoPath: string, cleanup: Function}>}
 */
export async function processVideoToShort(videoUrl, startTime, duration, options = {}) {
  const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 'video';
  const timestamp = `${startTime}-${startTime + duration}`;
  
  const downloadedPath = path.join(TEMP_DIR, `${videoId}_full.mp4`);
  const clippedPath = path.join(TEMP_DIR, `${videoId}_${timestamp}_clip.mp4`);
  const finalPath = path.join(TEMP_DIR, `${videoId}_${timestamp}_short.mp4`);
  
  try {
    // Step 1: Download video
    await downloadVideo(videoUrl, downloadedPath);
    
    // Step 2: Clip video
    await clipVideo(downloadedPath, clippedPath, startTime, duration);
    
    // Step 3: Process to 9:16 short format
    await processShortVideo(clippedPath, finalPath, options);
    
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
    console.error('❌ Error processing video to short:', error.message);
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

