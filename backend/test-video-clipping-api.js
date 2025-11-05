/**
 * Test Script: Process 5 clips via API endpoint
 * This uses the Vercel API where API keys are already configured
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'https://groove-poster-backend.vercel.app';
const VIDEO_URL = 'https://youtu.be/oBXSvS2QKxU?si=ilI2pqSp_oabEp-R';

async function testViaAPI() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   🎬 TESTING VIDEO CLIPPING VIA API ENDPOINT              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log(`🌐 API URL: ${API_URL}`);
    console.log(`📹 Video URL: ${VIDEO_URL}\n`);
    
    // Test health endpoint first
    console.log('📊 Step 1: Testing API health...');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      console.log(`✅ API is healthy: ${healthResponse.data.message}\n`);
    } catch (error) {
      console.error(`❌ API health check failed: ${error.message}`);
      throw error;
    }
    
    // Trigger trending workflow with video processing
    console.log('🚀 Step 2: Triggering trending workflow with video processing...');
    console.log('   This will:');
    console.log('   1. Find trending videos');
    console.log('   2. Analyze and select best videos');
    console.log('   3. Extract best clips');
    console.log('   4. Process with 9:16 layout + logo\n');
    
    const workflowResponse = await axios.post(
      `${API_URL}/api/trending-workflow`,
      {
        maxResults: 10,
        topCount: 1, // Process just 1 video for testing
        extractClip: true,
        processVideo: true, // Enable video processing with 9:16 layout
        uploadToYouTube: false // Don't upload, just process
      },
      {
        timeout: 300000 // 5 minutes timeout for video processing
      }
    );
    
    console.log('✅ Workflow started successfully!');
    console.log(`   Response: ${JSON.stringify(workflowResponse.data, null, 2)}\n`);
    
    console.log('📝 Note: Video processing runs in the background.');
    console.log('   Check Vercel logs for progress:');
    console.log(`   https://vercel.com/dashboard\n`);
    
    console.log('🎯 What to look for in logs:');
    console.log('   ✅ Video downloaded');
    console.log('   ✅ Best clip extracted');
    console.log('   ✅ Video processed with 9:16 layout');
    console.log('   ✅ Logo watermark added');
    console.log('   ✅ Output saved to temp/ directory\n');
    
    return {
      success: true,
      message: 'Workflow started successfully',
      note: 'Check Vercel logs for processing progress'
    };
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    throw error;
  }
}

// Run test
testViaAPI()
  .then(result => {
    console.log('\n✅ Test completed successfully!');
    console.log('   Check Vercel dashboard logs for video processing progress.\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });

