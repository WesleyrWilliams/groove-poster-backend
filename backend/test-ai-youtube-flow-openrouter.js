/**
 * Groove Poster – Complete AI YouTube Shorts Automation Test
 * -------------------------------------------------------------
 * End-to-end test script for:
 * 1. Fetch trending YouTube Shorts
 * 2. Analyze & rank using OpenRouter AI
 * 3. Transcribe & detect viral moments
 * 4. Auto-clip + AI-generate captions (overlay text)
 * 5. Upload analytics & reason to Google Sheets
 * 6. Upload final clip to YouTube Shorts via API
 */

import dotenv from 'dotenv';
import { runTrendingWorkflow } from './src/trending-workflow.js';
import { extractBestClip } from './src/trending-workflow.js';
import { processVideo } from './src/video-processor.js';
import { uploadVideoToYouTube } from './src/youtube-upload.js';
import { saveToGoogleSheets } from './src/trending-workflow.js';

dotenv.config();

// Configuration
const CONFIG = {
  maxResults: parseInt(process.env.MAX_RESULTS) || 5,
  topCount: parseInt(process.env.TOP_COUNT) || 3,
  extractClip: process.env.EXTRACT_CLIP !== 'false',
  uploadToYouTube: process.env.UPLOAD_TO_YOUTUBE === 'true',
  clipDuration: parseInt(process.env.CLIP_DURATION) || 30,
  minClipDuration: 15,
  maxClipDuration: 60
};

/**
 * Main test function
 */
async function runCompleteTest() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🧪 COMPLETE AI YOUTUBE SHORTS AUTOMATION TEST           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n📋 Configuration:');
  console.log(`   Max Results: ${CONFIG.maxResults}`);
  console.log(`   Top Count: ${CONFIG.topCount}`);
  console.log(`   Extract Clip: ${CONFIG.extractClip ? 'Yes' : 'No'}`);
  console.log(`   Upload to YouTube: ${CONFIG.uploadToYouTube ? 'Yes' : 'No'}`);
  console.log(`   Clip Duration: ${CONFIG.clipDuration}s\n`);
  
  try {
    // Step 1: Run trending workflow
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('STEP 1: FETCH & ANALYZE TRENDING VIDEOS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const workflowResult = await runTrendingWorkflow({
      maxResults: CONFIG.maxResults,
      topCount: CONFIG.topCount,
      extractClip: false, // We'll extract clip manually for better control
      uploadToYouTube: false // We'll upload manually after processing
    });
    
    if (!workflowResult.success || !workflowResult.videos || workflowResult.videos.length === 0) {
      throw new Error('No videos found or workflow failed');
    }
    
    console.log(`\n✅ Found ${workflowResult.videos.length} trending videos`);
    
    // Step 2: Process top video (if extractClip is enabled)
    if (CONFIG.extractClip && workflowResult.videos.length > 0) {
      const topVideo = workflowResult.videos[0];
      
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('STEP 2: EXTRACT BEST CLIP FROM TOP VIDEO');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      console.log(`📹 Processing: ${topVideo.title}`);
      console.log(`   Video ID: ${topVideo.videoId}`);
      console.log(`   URL: ${topVideo.url}\n`);
      
      // Extract best clip using AI (with video processing)
      console.log(`   Extracting best clip with AI...\n`);
      const clipData = await extractBestClip(topVideo.videoId, true); // processVideo = true
      
      console.log(`\n✅ Best clip extracted and processed:`);
      console.log(`   Start: ${clipData.startTime}s`);
      console.log(`   End: ${clipData.endTime}s`);
      console.log(`   Duration: ${clipData.duration}s`);
      console.log(`   Reason: ${clipData.reason}`);
      console.log(`   Caption: ${clipData.caption}`);
      console.log(`   Video Path: ${clipData.videoPath}\n`);
      
      // Step 3: Upload to YouTube Shorts (if enabled)
      if (CONFIG.uploadToYouTube) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('STEP 3: UPLOAD TO YOUTUBE SHORTS');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        const title = clipData.caption || `${topVideo.title} - Best Moment`;
        const description = `🔥 Viral Moment from: ${topVideo.title}\n\n${clipData.reason}\n\nOriginal: ${topVideo.url}\n\n#shorts #viral #trending #highlights`;
        
        const uploadResult = await uploadVideoToYouTube(
          clipData.videoPath,
          title,
          description,
          {
            tags: ['shorts', 'viral', 'trending', 'highlights', 'bestmoments'],
            privacyStatus: 'public'
          }
        );
        
        console.log(`\n✅ Video uploaded successfully!`);
        console.log(`   Video ID: ${uploadResult.videoId}`);
        console.log(`   URL: ${uploadResult.videoUrl}\n`);
        
        // Cleanup temp files after successful upload
        if (clipData.cleanup) {
          clipData.cleanup();
        }
        
        // Step 4: Update Google Sheets with upload info
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('STEP 4: UPDATE GOOGLE SHEETS WITH UPLOAD INFO');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        const updatedVideos = workflowResult.videos.map(v => {
          if (v.videoId === topVideo.videoId) {
            return {
              ...v,
              youtubeUploadStatus: 'uploaded',
              uploadedVideoId: uploadResult.videoId,
              uploadedVideoUrl: uploadResult.videoUrl,
              clipStartTime: clipData.startTime,
              clipEndTime: clipData.endTime,
              clipCaption: clipData.caption
            };
          }
          return v;
        });
        
        await saveToGoogleSheets(updatedVideos);
        
        console.log(`✅ Google Sheets updated with upload information\n`);
        
        // Final summary
        console.log('\n');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║   ✅ COMPLETE TEST SUCCESSFUL!                            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Processed ${workflowResult.videos.length} trending videos`);
        console.log(`   ✅ Extracted best clip from top video`);
        console.log(`   ✅ Processed video (download, clip, captions)`);
        console.log(`   ✅ Uploaded to YouTube Shorts`);
        console.log(`   ✅ Updated Google Sheets`);
        console.log(`\n🔗 Uploaded Video: ${uploadResult.videoUrl}\n`);
      } else {
        console.log('\n⚠️ Upload to YouTube is disabled');
        console.log('   Set UPLOAD_TO_YOUTUBE=true in .env to enable\n');
        
        // Cleanup temp files
        if (clipData.cleanup) {
          clipData.cleanup();
        }
      }
    } else {
      console.log('\n⚠️ Clip extraction is disabled');
      console.log('   Set EXTRACT_CLIP=true in .env to enable\n');
    }
    
    return {
      success: true,
      videos: workflowResult.videos,
      message: 'Test completed successfully'
    };
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteTest()
    .then(() => {
      console.log('\n✅ Test script completed\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test script failed:', error);
      process.exit(1);
    });
}

export { runCompleteTest };

