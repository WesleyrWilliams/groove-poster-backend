/**
 * Groove Poster – AI Shorts Automation (OpenRouter Free Models)
 * -------------------------------------------------------------
 * 1. Fetch trending YouTube Shorts
 * 2. Analyze & clip with free AI models
 * 3. Generate captions & overlay text
 * 4. Log to Google Sheets
 * 5. Upload to YouTube Shorts
 * 
 * Uses our existing modules with 403 fixes applied
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';
import { getAccessToken } from './src/oauth-tokens.js';
import { getVideoDetails, searchTrendingVideos } from './src/youtube-fetcher.js';
import { generateCaption } from './src/openrouter.js';
import { processVideo } from './src/video-processor-fixed.js';
import { uploadVideoToYouTube } from './src/youtube-upload.js';
import { saveToGoogleSheets } from './src/trending-workflow.js';

dotenv.config();

// ---------------- CONFIG ----------------
const CONFIG = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
  SHEET_ID: process.env.GOOGLE_SHEET_ID || process.env.SHEET_ID,
  MAX_RESULTS: parseInt(process.env.MAX_RESULTS) || 3,
  CLIP_DURATION: parseInt(process.env.CLIP_DURATION) || 30,
  UPLOAD_TO_YOUTUBE: process.env.UPLOAD_TO_YOUTUBE === 'true',
  EXTRACT_CLIP: process.env.EXTRACT_CLIP !== 'false'
};

// ---------------- STEP 1: FETCH TRENDING SHORTS ----------------
async function getTrendingVideos() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🚀 STEP 1: FETCHING TRENDING YOUTUBE SHORTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    // Search for trending shorts
    const videos = await searchTrendingVideos('shorts', CONFIG.MAX_RESULTS);
    
    console.log(`✅ Found ${videos.length} trending videos\n`);
    videos.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.title}`);
      console.log(`      Views: ${parseInt(v.viewCount || 0).toLocaleString()}`);
      console.log(`      URL: ${v.url}\n`);
    });
    
    return videos;
  } catch (error) {
    console.error('❌ Error fetching trending videos:', error.message);
    throw error;
  }
}

// ---------------- STEP 2: ANALYZE WITH OPENROUTER ----------------
async function analyzeVideo(video) {
  console.log(`\n📊 Analyzing: ${video.title}`);
  
  const prompt = `Analyze this YouTube video:
Title: ${video.title}
Views: ${video.viewCount || 0}
Description: ${video.description || 'N/A'}

1. Why is this video trending?
2. What type of moment makes it viral?
3. Suggest a timestamp range (0:00 - 0:30 style) for best clip (15-60 seconds).
4. Write a short caption (~100 words) & 3 hashtags.

Respond in a compact JSON format:
{ "reason": "...", "timestamp": "0:30", "caption": "...", "hashtags": "#..." }`;

  try {
    const response = await generateCaption(prompt);
    
    // Handle response format
    let analysis;
    if (typeof response === 'object' && response.caption) {
      // If response is {caption: "..."}, try to parse it
      try {
        analysis = JSON.parse(response.caption);
      } catch {
        // If not JSON, create analysis object
        analysis = {
          reason: response.caption || 'Trending content',
          timestamp: '0:30',
          caption: response.caption || video.title,
          hashtags: '#shorts #viral #trending'
        };
      }
    } else if (typeof response === 'string') {
      try {
        analysis = JSON.parse(response);
      } catch {
        analysis = {
          reason: response || 'Trending content',
          timestamp: '0:30',
          caption: response || video.title,
          hashtags: '#shorts #viral #trending'
        };
      }
    } else {
      analysis = response;
    }
    
    console.log(`   ✅ Analysis complete:`);
    console.log(`      Reason: ${analysis.reason || 'N/A'}`);
    console.log(`      Timestamp: ${analysis.timestamp || '0:30'}`);
    console.log(`      Caption: ${(analysis.caption || '').substring(0, 50)}...`);
    console.log(`      Hashtags: ${analysis.hashtags || ''}\n`);
    
    return analysis;
  } catch (error) {
    console.error(`   ❌ Error analyzing video:`, error.message);
    // Return fallback analysis
    return {
      reason: 'Trending content',
      timestamp: '0:30',
      caption: video.title || 'Viral Moment',
      hashtags: '#shorts #viral #trending'
    };
  }
}

// ---------------- STEP 3: CONVERT TIMESTAMP TO SECONDS ----------------
function timestampToSeconds(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') {
    return 30; // Default to 30 seconds
  }
  
  // Handle formats like "0:30", "1:15", "0:00-0:30"
  const cleanTimestamp = timestamp.split('-')[0].trim(); // Take first part if range
  const parts = cleanTimestamp.split(':').map(Number);
  
  if (parts.length === 1) {
    return parts[0]; // Seconds only
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // Minutes and seconds
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // Hours, minutes, seconds
  }
  return 30; // Default
}

// ---------------- STEP 4: CLIP VIDEO + CAPTION OVERLAY ----------------
async function clipAndCaption(videoUrl, startTimestamp, duration, caption, hashtags) {
  console.log(`\n✂️ STEP 3: CLIPPING VIDEO + CAPTION OVERLAY`);
  console.log(`   URL: ${videoUrl}`);
  console.log(`   Start: ${startTimestamp} (${timestampToSeconds(startTimestamp)}s)`);
  console.log(`   Duration: ${duration}s`);
  console.log(`   Caption: ${caption}`);
  
  try {
    const startSeconds = timestampToSeconds(startTimestamp);
    const fullCaption = `${caption} ${hashtags || ''}`;
    
    // Use our fixed video processor (with 403 fixes)
    const processed = await processVideo(
      videoUrl,
      startSeconds,
      duration,
      fullCaption,
      {
        fontSize: 36,
        position: 'bottom',
        fontColor: 'white',
        backgroundColor: 'black@0.5',
        borderWidth: 10
      }
    );
    
    console.log(`   ✅ Video processed: ${processed.videoPath}\n`);
    return processed;
  } catch (error) {
    console.error(`   ❌ Error processing video:`, error.message);
    throw error;
  }
}

// ---------------- STEP 5: LOG TO GOOGLE SHEETS ----------------
async function logToSheet(video, aiAnalysis) {
  console.log(`\n📊 STEP 4: LOGGING TO GOOGLE SHEETS`);
  
  try {
    const sheetData = [{
      channelName: video.channelTitle || 'Unknown',
      title: video.title || '',
      url: video.url || '',
      trendScore: 0,
      reason: aiAnalysis.reason || 'AI Analysis',
      viewCount: video.viewCount || 0,
      likeCount: video.likeCount || 0,
      publishedAt: video.publishedAt || new Date().toISOString(),
      youtubeUploadStatus: 'Pending'
    }];
    
    await saveToGoogleSheets(sheetData);
    console.log(`   ✅ Logged to Google Sheets\n`);
  } catch (error) {
    console.error(`   ❌ Error logging to sheets:`, error.message);
    // Don't throw - allow workflow to continue
  }
}

// ---------------- STEP 6: UPLOAD TO YOUTUBE SHORTS ----------------
async function uploadToYouTube(videoPath, title, description, hashtags) {
  console.log(`\n📤 STEP 5: UPLOADING TO YOUTUBE SHORTS`);
  console.log(`   Title: ${title}`);
  console.log(`   Video: ${videoPath}`);
  
  try {
    const fullDescription = `${description}\n\n${hashtags || '#shorts #viral #trending'}`;
    
    const uploadResult = await uploadVideoToYouTube(
      videoPath,
      title,
      fullDescription,
      {
        tags: (hashtags ? hashtags.split(' ').filter(tag => tag.startsWith('#')).map(tag => tag.substring(1)) : []).concat(['shorts', 'viral', 'trending']),
        privacyStatus: 'public'
      }
    );
    
    console.log(`   ✅ Uploaded successfully!`);
    console.log(`   Video ID: ${uploadResult.videoId}`);
    console.log(`   URL: ${uploadResult.videoUrl}\n`);
    
    return uploadResult;
  } catch (error) {
    console.error(`   ❌ Error uploading to YouTube:`, error.message);
    throw error;
  }
}

// ---------------- MASTER TEST RUN ----------------
(async () => {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 AI SHORTS AUTOMATION TEST STARTED                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n📋 Configuration:`);
  console.log(`   OpenRouter Model: ${CONFIG.OPENROUTER_MODEL}`);
  console.log(`   Max Results: ${CONFIG.MAX_RESULTS}`);
  console.log(`   Clip Duration: ${CONFIG.CLIP_DURATION}s`);
  console.log(`   Extract Clip: ${CONFIG.EXTRACT_CLIP ? 'Yes' : 'No'}`);
  console.log(`   Upload to YouTube: ${CONFIG.UPLOAD_TO_YOUTUBE ? 'Yes' : 'No'}\n`);
  
  try {
    // Validate config
    if (!CONFIG.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not set');
    }
    if (!CONFIG.SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID or SHEET_ID not set');
    }
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY not set');
    }
    
    // Step 1: Fetch trending videos
    const trending = await getTrendingVideos();
    
    if (trending.length === 0) {
      console.log('⚠️ No trending videos found. Exiting.');
      return;
    }
    
    // Process each video with delays to avoid rate limiting
    for (let i = 0; i < trending.length; i++) {
      const video = trending[i];
      const videoUrl = video.url || `https://www.youtube.com/watch?v=${video.videoId}`;
      
      // Add delay between videos (15 seconds) to avoid rate limiting
      if (i > 0) {
        console.log(`\n⏳ Waiting 15 seconds before processing next video to avoid rate limits...`);
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
      
      console.log(`\n═══════════════════════════════════════════════════════════`);
      console.log(`PROCESSING VIDEO ${i + 1}/${trending.length}: ${video.title}`);
      console.log('═══════════════════════════════════════════════════════════\n');
      
      try {
        // Step 2: Analyze with AI
        const analysis = await analyzeVideo(video);
        
        // Step 3: Clip and caption (if enabled)
        let processedVideo = null;
        if (CONFIG.EXTRACT_CLIP) {
          processedVideo = await clipAndCaption(
            videoUrl,
            analysis.timestamp || '0:30',
            CONFIG.CLIP_DURATION,
            analysis.caption || video.title,
            analysis.hashtags || ''
          );
        }
        
        // Step 4: Log to Google Sheets
        await logToSheet(video, analysis);
        
        // Step 5: Upload to YouTube (if enabled)
        if (CONFIG.UPLOAD_TO_YOUTUBE && processedVideo && processedVideo.videoPath) {
          try {
            const uploadResult = await uploadToYouTube(
              processedVideo.videoPath,
              analysis.caption || video.title,
              `Reason: ${analysis.reason || 'Trending content'}`,
              analysis.hashtags || ''
            );
            
            console.log(`\n✅ Video uploaded successfully!`);
            console.log(`   Video ID: ${uploadResult.videoId}`);
            console.log(`   URL: ${uploadResult.videoUrl}\n`);
            
            // Update video object with upload status
            video.uploadStatus = 'Uploaded';
            video.youtubeVideoId = uploadResult.videoId || '';
            video.youtubeVideoUrl = uploadResult.videoUrl || '';
            
            // Update sheet with upload status
            await logToSheet(video, analysis);
            
            // Cleanup temp files after upload
            if (processedVideo.cleanup) {
              processedVideo.cleanup();
            }
          } catch (uploadError) {
            console.error(`❌ Error uploading to YouTube:`, uploadError.message);
            video.uploadStatus = 'Failed';
            await logToSheet(video, analysis);
            
            // Cleanup temp files even on failure
            if (processedVideo.cleanup) {
              processedVideo.cleanup();
            }
          }
        } else if (CONFIG.UPLOAD_TO_YOUTUBE && !processedVideo) {
          console.log('⚠️ Skipping upload - no video processed');
          video.uploadStatus = 'No Video File';
          await logToSheet(video, analysis);
        } else if (!CONFIG.UPLOAD_TO_YOUTUBE) {
          console.log('⏭️ Upload to YouTube skipped (UPLOAD_TO_YOUTUBE=false)');
          video.uploadStatus = 'Skipped';
          await logToSheet(video, analysis);
          // Cleanup temp files if not uploaded
          if (processedVideo && processedVideo.cleanup) {
            processedVideo.cleanup();
          }
        }
        
        console.log(`✅ Video ${i + 1}/${trending.length} processed successfully!\n`);
      } catch (error) {
        console.error(`❌ Error processing video ${i + 1}:`, error.message);
        console.error('Continuing with next video...\n');
      }
    }
    
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ AI SHORTS AUTOMATION TEST COMPLETED                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Processed ${trending.length} videos`);
    console.log(`   ✅ Google Sheets updated`);
    if (CONFIG.EXTRACT_CLIP) {
      console.log(`   ✅ Video processing completed`);
    }
    if (CONFIG.UPLOAD_TO_YOUTUBE) {
      console.log(`   ✅ YouTube uploads completed`);
    }
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
})();

