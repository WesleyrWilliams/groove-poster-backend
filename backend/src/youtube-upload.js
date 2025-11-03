/**
 * YouTube Upload Module
 * Handles actual video file uploads to YouTube Shorts
 */

import { google } from 'googleapis';
import { getAccessToken } from './oauth-tokens.js';
import fs from 'fs';

/**
 * Upload video file to YouTube Shorts
 * @param {string} videoPath - Path to video file
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @param {object} options - Additional options (tags, privacy, etc.)
 * @returns {Promise<object>} Upload result
 */
export async function uploadVideoToYouTube(videoPath, title, description, options = {}) {
  try {
    console.log(`📤 Uploading video to YouTube Shorts...`);
    console.log(`   File: ${videoPath}`);
    console.log(`   Title: ${title}`);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // Create YouTube API client
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    // Check if video file exists
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }
    
    // Prepare video metadata
    const videoMetadata = {
      snippet: {
        title: title.substring(0, 100), // YouTube title limit
        description: description.substring(0, 5000), // YouTube description limit
        tags: options.tags || ['shorts', 'viral', 'trending', 'highlights'],
        categoryId: '22', // People & Blogs
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en'
      },
      status: {
        privacyStatus: options.privacyStatus || 'public',
        selfDeclaredMadeForKids: false,
        madeForKids: false
      }
    };
    
    console.log('📝 Video metadata prepared');
    console.log('⏳ Starting upload (this may take a few minutes)...');
    
    // Upload video
    const fileSize = fs.statSync(videoPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    console.log(`   File size: ${fileSizeMB} MB`);
    
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: fs.createReadStream(videoPath),
        mimeType: 'video/mp4'
      }
    });
    
    const videoId = response.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`✅ Video uploaded successfully!`);
    console.log(`   Video ID: ${videoId}`);
    console.log(`   URL: ${videoUrl}`);
    
    return {
      success: true,
      videoId,
      videoUrl,
      title: response.data.snippet.title,
      description: response.data.snippet.description,
      thumbnail: response.data.snippet.thumbnails?.default?.url,
      publishedAt: response.data.snippet.publishedAt
    };
  } catch (error) {
    console.error('❌ Error uploading video to YouTube:', error.message);
    
    // Check for specific error types
    if (error.response?.data?.error) {
      const errorDetails = error.response.data.error;
      console.error('   Error code:', errorDetails.code);
      console.error('   Error message:', errorDetails.message);
      
      if (errorDetails.errors) {
        errorDetails.errors.forEach((err, i) => {
          console.error(`   Error ${i + 1}:`, err.message, err.domain, err.reason);
        });
      }
    }
    
    throw error;
  }
}

/**
 * Upload video with retry logic
 * @param {string} videoPath - Path to video file
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @param {object} options - Additional options
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<object>} Upload result
 */
export async function uploadVideoWithRetry(videoPath, title, description, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Upload attempt ${attempt}/${maxRetries}...`);
      return await uploadVideoToYouTube(videoPath, title, description, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.response?.status === 400 || error.response?.status === 403) {
        console.error('❌ Non-retryable error, stopping attempts');
        throw error;
      }
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 10; // Exponential backoff
        console.log(`⏳ Waiting ${waitTime} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      }
    }
  }
  
  throw lastError;
}

