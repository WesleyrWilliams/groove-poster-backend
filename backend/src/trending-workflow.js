import axios from 'axios';
import { getAccessToken } from './oauth-tokens.js';
import { getVideoDetails, searchTrendingVideos } from './youtube-fetcher.js';
import { getTranscript } from './transcript-api.js';
import { generateCaption, generateVideoAnalysis } from './openrouter.js';
import { google } from 'googleapis';

// Popular creators to monitor
const POPULAR_CREATORS = [
  'IShowSpeed',
  'Kai Cenat',
  'Flensha',
  'xQc',
  'PewDiePie',
  'MrBeast',
  'Dude Perfect',
  'KSI'
];

/**
 * Calculate Trend Score based on multiple metrics
 */
function calculateTrendScore(video) {
  const views = parseInt(video.viewCount) || 0;
  const likes = parseInt(video.likeCount) || 0;
  const publishedAt = new Date(video.publishedAt);
  const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
  
  // Views per hour (recent spike indicator)
  const viewsPerHour = hoursSincePublished > 0 ? views / hoursSincePublished : 0;
  
  // Like ratio (engagement indicator)
  const likeRatio = views > 0 ? likes / views : 0;
  
  // Recency bonus (newer videos get higher score)
  const recencyBonus = Math.max(0, 168 - hoursSincePublished) / 168; // 7 days max
  
  // Channel popularity bonus
  const channelBonus = POPULAR_CREATORS.some(creator => 
    video.channelTitle?.toLowerCase().includes(creator.toLowerCase())
  ) ? 1.5 : 1.0;
  
  // Trend Score Formula
  const trendScore = (
    viewsPerHour * 0.4 +
    likeRatio * 1000 * 0.3 +
    recencyBonus * 100 * 0.2 +
    views / 10000 * 0.1
  ) * channelBonus;
  
  return {
    score: Math.round(trendScore * 100) / 100,
    viewsPerHour: Math.round(viewsPerHour),
    likeRatio: Math.round(likeRatio * 10000) / 100,
    recencyHours: Math.round(hoursSincePublished),
    channelBonus: channelBonus > 1 ? 'Popular Creator' : 'Standard'
  };
}

/**
 * Get trending videos from YouTube
 */
export async function fetchTrendingVideos(maxResults = 20) {
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔍 STEP 1: FETCHING TRENDING VIDEOS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const trendingVideos = [];
    
    // Search for popular creators and trending topics
    const searchQueries = [
      ...POPULAR_CREATORS.map(creator => `${creator} stream`),
      'gaming highlights',
      'viral moments',
      'funny reactions',
      'irl stream',
      'reacting to',
      'challenge'
    ];
    
    console.log(`📊 Searching ${searchQueries.slice(0, 5).length} queries...\n`);
    
    for (const query of searchQueries.slice(0, 5)) { // Limit to avoid rate limits
      try {
        console.log(`   🔎 Searching: "${query}"...`);
        const videos = await searchTrendingVideos(query, Math.ceil(maxResults / searchQueries.length));
        console.log(`   ✅ Found ${videos.length} videos for "${query}"`);
        
        // Log each video found
        videos.forEach((v, i) => {
          console.log(`      ${i + 1}. ${v.title || 'Untitled'}`);
          console.log(`         Channel: ${v.channelTitle || 'Unknown'}`);
          console.log(`         Video ID: ${v.videoId}`);
          console.log(`         URL: https://youtube.com/watch?v=${v.videoId}\n`);
        });
        
        trendingVideos.push(...videos);
      } catch (error) {
        console.error(`   ❌ Error searching "${query}":`, error.message);
      }
    }
    
    // Remove duplicates
    const uniqueVideos = Array.from(
      new Map(trendingVideos.map(v => [v.videoId, v])).values()
    );
    
    console.log(`\n✅ TOTAL: Found ${uniqueVideos.length} unique trending videos`);
    console.log(`📊 Limiting to top ${maxResults} videos\n`);
    
    return uniqueVideos.slice(0, maxResults);
  } catch (error) {
    console.error('❌ Error fetching trending videos:', error);
    throw error;
  }
}

/**
 * Analyze and rank videos by trend score
 */
export async function analyzeAndRankVideos(videos) {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 STEP 2: ANALYZING & RANKING VIDEOS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const analyzedVideos = [];
  
  console.log(`📈 Analyzing ${videos.length} videos for trend score...\n`);
  
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    try {
      console.log(`\n   [${i + 1}/${videos.length}] Analyzing: ${video.title || video.videoId}`);
      console.log(`   🔗 URL: https://youtube.com/watch?v=${video.videoId}`);
      
      // Get detailed video stats
      console.log(`   📊 Fetching video details...`);
      const details = await getVideoDetails(video.videoId);
      
      console.log(`   ✅ Video Details Retrieved:`);
      console.log(`      Title: ${details.title}`);
      console.log(`      Channel: ${details.channelTitle || 'Unknown'}`);
      console.log(`      Views: ${parseInt(details.viewCount || 0).toLocaleString()}`);
      console.log(`      Likes: ${parseInt(details.likeCount || 0).toLocaleString()}`);
      console.log(`      Published: ${details.publishedAt || 'Unknown'}`);
      
      const trendData = calculateTrendScore(details);
      
      console.log(`   📈 Trend Score Calculation:`);
      console.log(`      Views/Hour: ${trendData.viewsPerHour.toLocaleString()}`);
      console.log(`      Like Ratio: ${trendData.likeRatio}%`);
      console.log(`      Hours Since Published: ${trendData.recencyHours}`);
      console.log(`      Channel Bonus: ${trendData.channelBonus}`);
      console.log(`      🎯 FINAL TREND SCORE: ${trendData.score}`);
      
      // Determine reason for selection
      let reason = '';
      if (trendData.viewsPerHour > 1000) {
        reason = `Spike in views: ${trendData.viewsPerHour} views/hour`;
      } else if (trendData.likeRatio > 5) {
        reason = `High engagement: ${trendData.likeRatio}% like ratio`;
      } else if (trendData.recencyHours < 24) {
        reason = `Recent upload: ${trendData.recencyHours} hours ago`;
      } else if (trendData.channelBonus > 1) {
        reason = `Popular creator content`;
      } else {
        reason = `Trending content with ${parseInt(details.viewCount || 0).toLocaleString()} views`;
      }
      
      console.log(`   🎯 Reason: ${reason}`);
      
      analyzedVideos.push({
        ...details,
        ...video,
        trendScore: trendData.score,
        trendData,
        reason,
        channelName: details.channelTitle || video.channelTitle || 'Unknown'
      });
      
      console.log(`   ✅ Analysis complete\n`);
    } catch (error) {
      console.error(`   ❌ Error analyzing video ${video.videoId}:`, error.message);
    }
  }
  
  // Sort by trend score (highest first)
  analyzedVideos.sort((a, b) => b.trendScore - a.trendScore);
  
  console.log(`\n✅ RANKING COMPLETE: Ranked ${analyzedVideos.length} videos\n`);
  console.log('📊 TOP RANKED VIDEOS:');
  analyzedVideos.slice(0, 5).forEach((v, i) => {
    console.log(`   ${i + 1}. ${v.title}`);
    console.log(`      Score: ${v.trendScore} | Views: ${parseInt(v.viewCount || 0).toLocaleString()} | ${v.reason}`);
  });
  console.log('');
  
  return analyzedVideos;
}

/**
 * Save to Google Sheets using OAuth
 */
export async function saveToGoogleSheets(videos) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId) {
      console.warn('⚠️ GOOGLE_SHEET_ID not set, skipping Google Sheets upload');
      return;
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 STEP 3: SAVING TO GOOGLE SHEETS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`📋 Sheet ID: ${spreadsheetId}`);
    console.log(`📊 Preparing to save ${videos.length} videos...\n`);
    
    // Get access token using OAuth
    const accessToken = await getAccessToken();
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    // Prepare headers row if needed
    const headers = [
      'Channel Name',
      'Video Title',
      'Link',
      'Trend Score',
      'Reason for Selection',
      'View Count',
      'Like Count',
      'Views/Hour',
      'Like Ratio %',
      'Published Date',
      'Status'
    ];
    
    // Prepare data rows
    console.log('📝 Preparing data rows...');
    const rows = videos.map((video, i) => {
      console.log(`   [${i + 1}/${videos.length}] ${video.title}`);
      console.log(`      Channel: ${video.channelName}`);
      console.log(`      Score: ${video.trendScore} | Views: ${parseInt(video.viewCount || 0).toLocaleString()}`);
      return [
        video.channelName || '',
        video.title || '',
        video.url || '',
        video.trendScore || 0,
        video.reason || '',
        video.viewCount || 0,
        video.likeCount || 0,
        video.trendData?.viewsPerHour || 0,
        video.trendData?.likeRatio || 0,
        video.publishedAt || '',
        'Selected'
      ];
    });
    console.log('');
    
    // First, try to create the sheet if it doesn't exist
    try {
      // Try to read the sheet to check if it exists
      await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Trending Videos!A1'
      });
    } catch (error) {
      // Sheet doesn't exist, create it
      console.log('📝 Creating "Trending Videos" tab...');
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: 'Trending Videos'
                }
              }
            }]
          }
        });
        console.log('✅ Created "Trending Videos" tab');
      } catch (createError) {
        console.error('Error creating sheet tab:', createError.message);
      }
    }
    
    // Clear existing data and add headers + new data
    const range = 'Trending Videos!A1:K1000';
    
    try {
      // First, clear the sheet
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range
      });
      
      console.log('✅ Cleared existing data');
    } catch (clearError) {
      console.warn('⚠️ Could not clear sheet (might be empty):', clearError.message);
    }
    
    // Add headers
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Trending Videos!A1:K1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers]
        }
      });
      console.log('✅ Added headers');
    } catch (headerError) {
      console.error('❌ Error adding headers:', headerError.message);
      throw headerError;
    }
    
    // Add data
    if (rows.length > 0) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Trending Videos!A2:K',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: rows
          }
        });
        console.log(`✅ Saved ${rows.length} videos to Google Sheets`);
      } catch (dataError) {
        console.error('❌ Error saving data:', dataError.message);
        console.error('Error details:', dataError.response?.data || dataError);
        throw dataError;
      }
    } else {
      console.warn('⚠️ No rows to save');
    }
    console.log(`\n✅ SUCCESS: Saved ${rows.length} videos to Google Sheets`);
    console.log(`📊 Sheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log(`📋 Tab: "Trending Videos"\n`);
  } catch (error) {
    console.error('❌ Error saving to Google Sheets:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    // Check specific error types
    if (!spreadsheetId) {
      console.error('⚠️ GOOGLE_SHEET_ID environment variable not set in Vercel!');
      console.error('⚠️ Add GOOGLE_SHEET_ID=1wkkQa2SFHRpvZS8HJ9j3BVTIbnAWA0xKA_Gwysch2WQ to Vercel environment variables');
    }
    if (error.message?.includes('permission') || error.response?.status === 403) {
      console.error('⚠️ Permission denied - check OAuth scopes include spreadsheets');
      console.error('⚠️ Make sure you authorized with spreadsheets scope');
    }
    if (error.message?.includes('not found') || error.response?.status === 404) {
      console.error('⚠️ Sheet not found - check GOOGLE_SHEET_ID is correct');
      console.error(`⚠️ Current ID: ${spreadsheetId}`);
      console.error('⚠️ Expected ID: 1wkkQa2SFHRpvZS8HJ9j3BVTIbnAWA0xKA_Gwysch2WQ');
    }
    
    // Don't throw - allow workflow to continue
  }
}

/**
 * AI Clip Extraction - Find best moments using enhanced analysis
 * @param {string} videoId - YouTube video ID
 * @param {boolean} processVideo - Whether to actually download and clip the video
 * @param {object} options - Processing options
 * @returns {Promise<object>} Clip data with timestamps and optionally videoPath
 */
export async function extractBestClip(videoId, processVideo = false, options = {}) {
  try {
    console.log(`🎬 Extracting best clip from ${videoId}...`);
    
    // Get transcript
    const transcript = await getTranscript(videoId);
    if (transcript.length === 0) {
      throw new Error('No transcript available');
    }
    
    // Get video details
    const details = await getVideoDetails(videoId);
    
    // Use enhanced AI analysis to get title, timestamps, and hashtags
    console.log(`🤖 Analyzing video with AI for best clip...`);
    let analysis;
    try {
      analysis = await generateVideoAnalysis(details, transcript);
      console.log(`✅ AI Analysis complete:`);
      console.log(`   Reason: ${analysis.reason || 'N/A'}`);
      console.log(`   Title: ${analysis.title || 'N/A'}`);
      console.log(`   Clips found: ${analysis.clips?.length || 0}`);
    } catch (analysisError) {
      console.warn(`⚠️ Enhanced analysis failed, falling back to basic analysis:`, analysisError.message);
      // Fallback to basic analysis
      const bestMoments = await findBestMomentWithAI(transcript, details);
      if (bestMoments.length === 0) {
        throw new Error('No engaging moments found');
      }
      const bestMoment = bestMoments[0];
      analysis = {
        reason: bestMoment.reason || 'AI-selected engaging moment',
        clips: [{
          startSeconds: bestMoment.start,
          endSeconds: bestMoment.end,
          reason: bestMoment.reason
        }],
        title: bestMoment.text?.substring(0, 100) || details.title || 'Viral Moment',
        subtitle: '',
        hashtags: ['#viral', '#shorts', '#trending']
      };
    }
    
    // Get best clip from analysis
    const bestClip = analysis.clips && analysis.clips.length > 0 
      ? analysis.clips[0] 
      : { startSeconds: 0, endSeconds: 30, reason: 'Default clip' };
    
    const clipData = {
      videoId,
      videoUrl: details.url,
      startTime: bestClip.startSeconds || bestClip.start || 0,
      endTime: bestClip.endSeconds || bestClip.end || 30,
      duration: (bestClip.endSeconds || bestClip.end || 30) - (bestClip.startSeconds || bestClip.start || 0),
      text: bestClip.text || transcript[0]?.text || '',
      caption: analysis.title || 'Viral Moment 🔥',
      subtitle: analysis.subtitle || '',
      reason: analysis.reason || bestClip.reason || 'AI-selected engaging moment',
      title: analysis.title || details.title || 'Viral Moment',
      hashtags: analysis.hashtags || ['#viral', '#shorts', '#trending']
    };
    
    // If processVideo is true, process with enhanced video processor
    if (processVideo) {
      const { processVideoToShort } = await import('./video-processor-enhanced.js');
      
      const duration = Math.min(Math.max(clipData.duration, 15), 60);
      
      // Process video with 9:16 layout
      const processed = await processVideoToShort(
        details.url,
        clipData.startTime,
        duration,
        {
          title: clipData.title || clipData.caption,
          subtitle: clipData.subtitle,
          watermarkPath: options.watermarkPath || null,
          subtitleFile: options.subtitleFile || null,
          titleFontSize: options.titleFontSize || 56,
          subtitleFontSize: options.subtitleFontSize || 34
        }
      );
      
      clipData.videoPath = processed.videoPath;
      clipData.cleanup = processed.cleanup;
    }
    
    return clipData;
  } catch (error) {
    console.error('Error extracting clip:', error.message);
    throw error;
  }
}

/**
 * Find best moment using AI
 */
async function findBestMomentWithAI(transcript, videoDetails) {
  try {
    const transcriptText = transcript.map(t => `[${Math.floor(t.start)}s] ${t.text}`).join('\n');
    
    const prompt = `Analyze this video transcript and find the most engaging/viral moment (15-60 seconds).

Video Title: ${videoDetails.title}
Views: ${videoDetails.viewCount}
Likes: ${videoDetails.likeCount}

Transcript:
${transcriptText}

Find the single best moment that would make a viral short. Consider:
- Emotional peaks (surprise, excitement, shock)
- Humor or funny moments
- Unexpected reactions
- High energy moments
- Catchy phrases or quotes

Return ONLY valid JSON in this exact format:
{
  "start": <start_time_in_seconds>,
  "end": <end_time_in_seconds>,
  "text": "<transcript_text_for_this_moment>",
  "reason": "<why_this_moment_is_viral>"
}`;

    const response = await generateCaption(prompt);
    
    // Handle response - generateCaption returns {caption: "..."} or parsed JSON
    let moment;
    try {
      let responseText = '';
      if (typeof response === 'object' && response.caption) {
        responseText = response.caption;
      } else if (typeof response === 'string') {
        responseText = response;
      } else {
        responseText = JSON.stringify(response);
      }
      
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moment = JSON.parse(jsonMatch[0]);
        // Validate moment has required fields
        if (!moment.start || !moment.end) {
          throw new Error('Invalid moment format');
        }
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // Fallback: find most interesting segment
      const midPoint = Math.floor(transcript.length / 2);
      const segment = transcript[midPoint] || transcript[0];
      moment = {
        start: Math.floor(segment.start || 0),
        end: Math.floor((segment.start || 0) + 30),
        text: segment.text || '',
        reason: 'AI-selected engaging moment'
      };
    }
    
    return [moment];
  } catch (error) {
    console.error('Error finding best moment:', error);
    // Fallback: return first 30 seconds
    const firstSegment = transcript[0] || { start: 0, text: '' };
    return [{
      start: Math.floor(firstSegment.start || 0),
      end: Math.floor((firstSegment.start || 0) + 30),
      text: firstSegment.text || '',
      reason: 'Fallback: first 30 seconds'
    }];
  }
}

/**
 * Upload to YouTube Shorts
 * @param {object} clipData - Clip data with videoPath, title, description
 * @returns {Promise<object>} Upload result
 */
export async function uploadToYouTubeShorts(clipData) {
  try {
    console.log('📤 Uploading to YouTube Shorts...');
    
    // Import upload function
    const { uploadVideoToYouTube } = await import('./youtube-upload.js');
    
    // Check if videoPath is provided
    if (!clipData.videoPath) {
      throw new Error('videoPath is required for upload');
    }
    
    const title = clipData.title || clipData.caption || 'Viral Short';
    const hashtags = clipData.hashtags || ['#shorts', '#viral', '#trending'];
    const description = `${clipData.reason || 'Viral moment'}\n\n${hashtags.join(' ')}`;
    
    // Convert hashtags to tags (remove #)
    const tags = hashtags.map(tag => tag.replace('#', '')).filter(tag => tag.length > 0);
    
    const uploadResult = await uploadVideoToYouTube(
      clipData.videoPath,
      title,
      description,
      {
        tags: tags.length > 0 ? tags : ['shorts', 'viral', 'trending', 'highlights'],
        privacyStatus: 'public'
      }
    );
    
    return uploadResult;
  } catch (error) {
    console.error('Error uploading to YouTube Shorts:', error.message);
    throw error;
  }
}

/**
 * Complete Trending Workflow
 */
export async function runTrendingWorkflow(options = {}) {
  try {
    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   🚀 TRENDING WORKFLOW STARTED                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n📋 Configuration:`);
    console.log(`   Max Results: ${options.maxResults || 20}`);
    console.log(`   Top Count: ${options.topCount || 5}`);
    console.log(`   Extract Clip: ${options.extractClip ? 'Yes' : 'No'}`);
    console.log(`   Upload to YouTube: ${options.uploadToYouTube ? 'Yes' : 'No'}\n`);
    
    // Step 1: Fetch trending videos
    const videos = await fetchTrendingVideos(options.maxResults || 20);
    
    // Step 2: Analyze and rank
    const rankedVideos = await analyzeAndRankVideos(videos);
    
    // Step 3: Select top videos
    const topVideos = rankedVideos.slice(0, options.topCount || 5);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`🎯 STEP 4: SELECTING TOP ${topVideos.length} VIDEOS`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    topVideos.forEach((v, i) => {
      console.log(`\n   ${i + 1}. ${v.title}`);
      console.log(`      Channel: ${v.channelName}`);
      console.log(`      🎯 Trend Score: ${v.trendScore}`);
      console.log(`      📊 Views: ${parseInt(v.viewCount || 0).toLocaleString()}`);
      console.log(`      👍 Likes: ${parseInt(v.likeCount || 0).toLocaleString()}`);
      console.log(`      📈 Views/Hour: ${v.trendData?.viewsPerHour || 0}`);
      console.log(`      💚 Like Ratio: ${v.trendData?.likeRatio || 0}%`);
      console.log(`      ⏰ Published: ${v.publishedAt || 'Unknown'}`);
      console.log(`      🎯 Reason: ${v.reason}`);
      console.log(`      🔗 Link: ${v.url}\n`);
    });
    
    // Step 4: Save to Google Sheets
    try {
      await saveToGoogleSheets(topVideos);
    } catch (error) {
      console.error('\n❌ Google Sheets update failed:', error.message);
      console.error('Workflow continues, but data not saved to sheet');
    }
    
    // Step 5: Extract best clip from top video
    if (options.extractClip && topVideos.length > 0) {
      const topVideo = topVideos[0];
      
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('🎬 STEP 5: EXTRACTING BEST CLIP');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log(`📹 Processing top video: ${topVideo.title}`);
      console.log(`   Video ID: ${topVideo.videoId}`);
      console.log(`   URL: ${topVideo.url}\n`);
      
      // Extract clip with enhanced processing
      const clip = await extractBestClip(topVideo.videoId, options.processVideo, {
        watermarkPath: options.watermarkPath || null,
        subtitleFile: options.subtitleFile || null,
        titleFontSize: options.titleFontSize || 56,
        subtitleFontSize: options.subtitleFontSize || 34
      });
      
      console.log(`\n✅ BEST CLIP EXTRACTED:`);
      console.log(`   Start Time: ${clip.startTime}s`);
      console.log(`   End Time: ${clip.endTime}s`);
      console.log(`   Duration: ${clip.duration}s`);
      console.log(`   🎯 Reason: ${clip.reason}`);
      console.log(`   📝 Title: ${clip.title}`);
      console.log(`   📝 Subtitle: ${clip.subtitle || 'N/A'}`);
      console.log(`   🏷️  Hashtags: ${clip.hashtags?.join(' ') || 'N/A'}`);
      console.log(`   📄 Text: ${clip.text?.substring(0, 100)}...`);
      if (clip.videoPath) {
        console.log(`   📹 Video Path: ${clip.videoPath}\n`);
      } else {
        console.log(`   ⏭️  Video processing skipped\n`);
      }
      
      // Step 6: Upload to YouTube Shorts (if enabled)
      if (options.uploadToYouTube && clip.videoPath) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📤 STEP 6: UPLOADING TO YOUTUBE SHORTS');
        console.log('═══════════════════════════════════════════════════════════\n');
        await uploadToYouTubeShorts(clip);
      }
      
      console.log('\n');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║   ✅ TRENDING WORKFLOW COMPLETED SUCCESSFULLY              ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log(`\n📊 Summary:`);
      console.log(`   ✅ Processed ${videos.length} videos`);
      console.log(`   ✅ Selected top ${topVideos.length} videos`);
      console.log(`   ✅ Saved to Google Sheets`);
      console.log(`   ✅ Extracted best clip: ${clip.startTime}s - ${clip.endTime}s`);
      if (options.uploadToYouTube) {
        console.log(`   ✅ Uploaded to YouTube Shorts`);
      }
      console.log('');
      
      return {
        success: true,
        videos: topVideos,
        clip,
        message: 'Trending workflow completed successfully'
      };
    }
    
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ TRENDING WORKFLOW COMPLETED SUCCESSFULLY              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Processed ${videos.length} videos`);
    console.log(`   ✅ Selected top ${topVideos.length} videos`);
    console.log(`   ✅ Saved to Google Sheets`);
    console.log(`   ⏭️  Clip extraction skipped`);
    console.log('');
    
    return {
      success: true,
      videos: topVideos,
      message: 'Trending workflow completed (clip extraction skipped)'
    };
  } catch (error) {
    console.error('\n❌ ERROR IN TRENDING WORKFLOW:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

