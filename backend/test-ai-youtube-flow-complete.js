/**
 * Groove Poster – Complete AI YouTube Shorts Automation Test
 * -------------------------------------------------------------
 * Fixed and tested version that works with our infrastructure:
 * 1. Fetch trending YouTube Shorts
 * 2. Analyze & clip with free AI models (OpenRouter)
 * 3. Generate captions & overlay text
 * 4. Log to Google Sheets (using OAuth)
 * 5. Upload to YouTube Shorts (using OAuth)
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';
import { getAccessToken } from './src/oauth-tokens.js';
import { getVideoDetails, searchTrendingVideos } from './src/youtube-fetcher.js';
import { generateCaption } from './src/openrouter.js';
import { processVideo } from './src/video-processor.js';
import { uploadVideoToYouTube } from './src/youtube-upload.js';
import { saveToGoogleSheets } from './src/trending-workflow.js';
import axios from 'axios';

dotenv.config();

// Configuration
const CONFIG = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
  SHEET_ID: process.env.GOOGLE_SHEET_ID || process.env.SHEET_ID,
  MAX_RESULTS: parseInt(process.env.MAX_RESULTS) || 5,
  CLIP_DURATION: parseInt(process.env.CLIP_DURATION) || 30,
  UPLOAD_TO_YOUTUBE: process.env.UPLOAD_TO_YOUTUBE === 'true',
  EXTRACT_CLIP: process.env.EXTRACT_CLIP !== 'false' // Default to true unless explicitly false
};

// Validate configuration
function validateConfig() {
  const missing = [];
  if (!CONFIG.OPENROUTER_API_KEY) missing.push('OPENROUTER_API_KEY');
  if (!CONFIG.SHEET_ID) missing.push('GOOGLE_SHEET_ID or SHEET_ID');
  if (!process.env.YOUTUBE_API_KEY) missing.push('YOUTUBE_API_KEY');
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Configuration validated');
}

/**
 * Convert timestamp string (e.g., "0:30", "1:15") to seconds
 */
function timestampToSeconds(timestamp) {
  if (!timestamp) return 0;
  
  // Handle "0:30" format
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  // If already a number, assume seconds
  const num = parseInt(timestamp);
  return isNaN(num) ? 0 : num;
}

/**
 * STEP 1: Fetch trending YouTube videos
 */
async function getTrendingVideos() {
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('STEP 1: FETCHING TRENDING YOUTUBE VIDEOS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Use our existing YouTube fetcher
    const videos = await searchTrendingVideos('viral shorts', CONFIG.MAX_RESULTS);
    
    console.log(`✅ Found ${videos.length} trending videos\n`);
    
    // Get detailed stats for each video
    const detailedVideos = [];
    for (const video of videos) {
      try {
        const details = await getVideoDetails(video.videoId);
        detailedVideos.push({
          ...video,
          ...details,
          id: video.videoId
        });
        console.log(`   ✓ ${details.title}`);
        console.log(`     Views: ${parseInt(details.viewCount || 0).toLocaleString()}`);
      } catch (error) {
        console.warn(`   ⚠️ Skipped ${video.videoId}: ${error.message}`);
      }
    }
    
    return detailedVideos;
  } catch (error) {
    console.error('❌ Error fetching trending videos:', error.message);
    throw error;
  }
}

/**
 * STEP 2: Analyze video with OpenRouter AI
 */
async function analyzeVideo(video) {
  try {
    console.log(`\n📊 Analyzing: ${video.title}`);
    
    const prompt = `Analyze this YouTube video and provide the best clip recommendation:

Title: ${video.title}
Views: ${video.viewCount || 0}
Description: ${(video.description || '').substring(0, 200)}

Provide analysis in JSON format:
{
  "reason": "Why this video is trending or viral",
  "timestamp": "0:30" or "1:15" (start time for best clip),
  "caption": "Engaging caption for the clip",
  "hashtags": "#shorts #viral #trending"
}

Focus on:
1. Most engaging/viral moment
2. Best 15-60 second clip
3. Caption that will get views
4. Relevant hashtags`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: CONFIG.OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying viral moments in YouTube videos. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.WEBHOOK_URL || 'http://localhost:3001',
          'X-Title': 'AI YouTube Shorts Analyzer'
        }
      }
    );

    const content = response.data.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback
        analysis = {
          reason: 'Trending content',
          timestamp: '0:30',
          caption: video.title,
          hashtags: '#shorts #viral'
        };
      }
    }
    
    console.log(`   ✅ Analysis complete:`);
    console.log(`      Reason: ${analysis.reason}`);
    console.log(`      Timestamp: ${analysis.timestamp}`);
    console.log(`      Caption: ${analysis.caption}`);
    
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

/**
 * STEP 3: Clip video and add caption overlay
 */
async function clipAndCaption(videoUrl, startTimestamp, duration, caption) {
  try {
    console.log(`\n✂️ Processing video clip...`);
    console.log(`   URL: ${videoUrl}`);
    console.log(`   Start: ${startTimestamp}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Caption: ${caption}`);
    
    // Convert timestamp to seconds
    const startSeconds = timestampToSeconds(startTimestamp);
    
    // Use our video processor
    const processed = await processVideo(
      videoUrl,
      startSeconds,
      duration,
      caption,
      {
        fontSize: 48,
        position: 'bottom',
        fontColor: 'white',
        backgroundColor: 'black@0.6'
      }
    );
    
    console.log(`   ✅ Video processed: ${processed.videoPath}`);
    return processed;
  } catch (error) {
    console.error(`   ❌ Error processing video:`, error.message);
    throw error;
  }
}

/**
 * STEP 4: Log to Google Sheets
 */
async function logToSheet(video, aiAnalysis) {
  try {
    console.log(`\n📊 Logging to Google Sheets...`);
    
    // Format analysis text
    const analysisText = JSON.stringify(aiAnalysis, null, 2);
    
    // Use our existing sheets function
    await saveToGoogleSheets([{
      videoId: video.id || video.videoId,
      title: video.title,
      url: video.url || `https://www.youtube.com/watch?v=${video.id || video.videoId}`,
      viewCount: video.viewCount || 0,
      likeCount: video.likeCount || 0,
      trendScore: 0,
      reason: aiAnalysis.reason || 'AI Analysis',
      viralScore: 0,
      viralReason: aiAnalysis.reason,
      relatedTopic: aiAnalysis.hashtags || '',
      generatedCaption: aiAnalysis.caption || '',
      transcript: '',
      youtubeUploadStatus: 'pending',
      tiktokUploadStatus: 'pending',
      instagramUploadStatus: 'pending',
      facebookUploadStatus: 'pending',
      channelName: video.channelTitle || 'Unknown',
      publishedAt: video.publishedAt || new Date().toISOString(),
      trendData: {
        viewsPerHour: 0,
        likeRatio: 0
      }
    }]);
    
    console.log(`   ✅ Logged to Google Sheets`);
  } catch (error) {
    console.error(`   ❌ Error logging to sheets:`, error.message);
    // Don't throw - allow workflow to continue
  }
}

/**
 * STEP 5: Upload to YouTube Shorts
 */
async function uploadToYouTube(videoPath, title, description) {
  try {
    console.log(`\n📤 Uploading to YouTube Shorts...`);
    console.log(`   Title: ${title}`);
    
    const result = await uploadVideoToYouTube(
      videoPath,
      title.substring(0, 100), // YouTube title limit
      description.substring(0, 5000), // YouTube description limit
      {
        tags: ['shorts', 'viral', 'trending', 'highlights'],
        privacyStatus: 'public'
      }
    );
    
    console.log(`   ✅ Uploaded successfully!`);
    console.log(`   Video ID: ${result.videoId}`);
    console.log(`   URL: ${result.videoUrl}`);
    
    return result;
  } catch (error) {
    console.error(`   ❌ Error uploading:`, error.message);
    throw error;
  }
}

/**
 * MASTER TEST RUN
 */
async function runCompleteTest() {
  try {
    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   🧪 COMPLETE AI YOUTUBE SHORTS AUTOMATION TEST           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    // Validate configuration
    validateConfig();
    
    console.log('\n📋 Configuration:');
    console.log(`   OpenRouter Model: ${CONFIG.OPENROUTER_MODEL}`);
    console.log(`   Max Results: ${CONFIG.MAX_RESULTS}`);
    console.log(`   Clip Duration: ${CONFIG.CLIP_DURATION}s`);
    console.log(`   Upload to YouTube: ${CONFIG.UPLOAD_TO_YOUTUBE ? 'Yes' : 'No'}\n`);
    
    // Step 1: Fetch trending videos
    const trending = await getTrendingVideos();
    
    if (trending.length === 0) {
      throw new Error('No trending videos found');
    }
    
    // Process each video
    const results = [];
    
    for (let i = 0; i < Math.min(trending.length, 3); i++) { // Limit to 3 videos for testing
      const video = trending[i];
      
      console.log(`\n\n═══════════════════════════════════════════════════════════`);
      console.log(`PROCESSING VIDEO ${i + 1}/${Math.min(trending.length, 3)}: ${video.title}`);
      console.log('═══════════════════════════════════════════════════════════\n');
      
      try {
        // Step 2: Analyze with AI
        const analysis = await analyzeVideo(video);
        
        // Step 3: Log to Google Sheets
        await logToSheet(video, analysis);
        
        // Step 4: Clip and add captions
        const processedVideo = await clipAndCaption(
          video.url || `https://www.youtube.com/watch?v=${video.id || video.videoId}`,
          analysis.timestamp || '0:30',
          CONFIG.CLIP_DURATION,
          `${analysis.caption || 'AI Highlight'} ${analysis.hashtags || ''}`
        );
        
        // Step 5: Upload to YouTube (if enabled)
        if (CONFIG.UPLOAD_TO_YOUTUBE) {
          const uploadResult = await uploadToYouTube(
            processedVideo.videoPath,
            analysis.caption || video.title,
            `Reason: ${analysis.reason}\n\n${analysis.hashtags || ''}\n\n#shorts #viral #trending`
          );
          
          results.push({
            video: video.title,
            uploadId: uploadResult.videoId,
            uploadUrl: uploadResult.videoUrl,
            success: true
          });
          
          // Cleanup temp files
          if (processedVideo.cleanup) {
            processedVideo.cleanup();
          }
        } else {
          console.log('\n⚠️ Upload to YouTube is disabled');
          console.log('   Set UPLOAD_TO_YOUTUBE=true in .env to enable');
          
          results.push({
            video: video.title,
            success: true,
            note: 'Upload disabled'
          });
          
          // Cleanup temp files
          if (processedVideo.cleanup) {
            processedVideo.cleanup();
          }
        }
        
      } catch (error) {
        console.error(`\n❌ Error processing video ${video.title}:`, error.message);
        results.push({
          video: video.title,
          success: false,
          error: error.message
        });
      }
    }
    
    // Final summary
    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ TEST COMPLETED                                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Results Summary:`);
    console.log(`   Total Videos Processed: ${results.length}`);
    console.log(`   Successful: ${results.filter(r => r.success).length}`);
    console.log(`   Failed: ${results.filter(r => !r.success).length}\n`);
    
    results.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.video}`);
      if (result.success) {
        if (result.uploadUrl) {
          console.log(`      ✅ Uploaded: ${result.uploadUrl}`);
        } else {
          console.log(`      ✅ Processed (upload disabled)`);
        }
      } else {
        console.log(`      ❌ Failed: ${result.error}`);
      }
    });
    
    console.log('');
    
    return results;
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteTest()
    .then(() => {
      console.log('✅ Test script completed\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

export { runCompleteTest };

