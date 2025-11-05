/**
 * Test Script: Process 5 clips from YouTube video
 * Tests the enhanced 9:16 video processor with logo watermark
 */

import { processVideoToShort } from './src/video-processor-enhanced.js';
import { getVideoDetails } from './src/youtube-fetcher.js';
import { getTranscript } from './src/transcript-api.js';
import { generateVideoAnalysis } from './src/openrouter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEO_URL = 'https://youtu.be/oBXSvS2QKxU?si=ilI2pqSp_oabEp-R';
const LOGO_PATH = path.join(__dirname, 'logo.png');

async function testVideoClipping() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   🎬 TESTING VIDEO CLIPPING WITH ENHANCED PROCESSOR      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    // Extract video ID
    const videoId = VIDEO_URL.split('v=')[1]?.split('&')[0] || VIDEO_URL.split('/').pop()?.split('?')[0];
    console.log(`📹 Video ID: ${videoId}`);
    console.log(`🎨 Logo: ${LOGO_PATH}\n`);
    
    // Step 1: Get video details
    console.log('📊 Step 1: Fetching video details...');
    const details = await getVideoDetails(videoId);
    console.log(`✅ Video: "${details.title}"`);
    console.log(`   Views: ${parseInt(details.viewCount || 0).toLocaleString()}`);
    console.log(`   Duration: ${details.duration}s\n`);
    
    // Step 2: Get transcript
    console.log('📝 Step 2: Fetching transcript...');
    const transcript = await getTranscript(videoId);
    if (transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }
    console.log(`✅ Got ${transcript.length} transcript segments\n`);
    
    // Step 3: AI Analysis to find best clips
    console.log('🤖 Step 3: Analyzing video with AI for best clips...');
    const analysis = await generateVideoAnalysis(details, transcript);
    console.log(`✅ Analysis complete:`);
    console.log(`   Reason: ${analysis.reason || 'N/A'}`);
    console.log(`   Clips found: ${analysis.clips?.length || 0}\n`);
    
    // Step 4: Process top 5 clips (or all available if less than 5)
    const clipsToProcess = (analysis.clips || []).slice(0, 5);
    
    if (clipsToProcess.length === 0) {
      throw new Error('No clips found by AI analysis');
    }
    
    console.log(`🎬 Step 4: Processing ${clipsToProcess.length} clips...\n`);
    
    const processedClips = [];
    
    for (let i = 0; i < clipsToProcess.length; i++) {
      const clip = clipsToProcess[i];
      const clipNumber = i + 1;
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📹 CLIP ${clipNumber}/${clipsToProcess.length}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      const startTime = clip.startSeconds || clip.start || 0;
      const endTime = clip.endSeconds || clip.end || 30;
      const duration = Math.min(Math.max(endTime - startTime, 15), 60); // 15-60 seconds
      
      console.log(`   Start: ${startTime}s`);
      console.log(`   End: ${endTime}s`);
      console.log(`   Duration: ${duration}s`);
      console.log(`   Reason: ${clip.reason || 'N/A'}`);
      console.log(`   Title: ${analysis.title || 'Viral Moment'}`);
      console.log(`   Subtitle: ${analysis.subtitle || 'N/A'}\n`);
      
      try {
        // Process video with enhanced processor
        console.log(`   🎬 Processing clip ${clipNumber}...`);
        
        const result = await processVideoToShort(
          details.url,
          startTime,
          duration,
          {
            title: analysis.title || `Clip ${clipNumber}: ${clip.reason || 'Viral Moment'}`,
            subtitle: analysis.subtitle || '',
            watermarkPath: LOGO_PATH,
            titleFontSize: 56,
            subtitleFontSize: 34
          }
        );
        
        console.log(`   ✅ Clip ${clipNumber} processed successfully!`);
        console.log(`   📁 Output: ${result.videoPath}\n`);
        
        processedClips.push({
          clipNumber,
          startTime,
          endTime,
          duration,
          videoPath: result.videoPath,
          title: analysis.title,
          subtitle: analysis.subtitle,
          reason: clip.reason
        });
        
      } catch (error) {
        console.error(`   ❌ Error processing clip ${clipNumber}:`, error.message);
        console.error(`   ⏭️  Skipping clip ${clipNumber}...\n`);
      }
    }
    
    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ PROCESSING COMPLETE                                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successfully processed: ${processedClips.length}/${clipsToProcess.length} clips\n`);
    
    processedClips.forEach((clip, index) => {
      console.log(`   ${index + 1}. Clip ${clip.clipNumber}:`);
      console.log(`      Time: ${clip.startTime}s - ${clip.endTime}s`);
      console.log(`      Title: ${clip.title}`);
      console.log(`      Path: ${clip.videoPath}\n`);
    });
    
    console.log('🎉 All clips processed with 9:16 layout and logo watermark!\n');
    
    return {
      success: true,
      totalClips: clipsToProcess.length,
      processedClips: processedClips.length,
      clips: processedClips
    };
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Run test
testVideoClipping()
  .then(result => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });

