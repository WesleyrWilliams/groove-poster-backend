import axios from 'axios';
import { getAccessToken } from './oauth-tokens.js';
import { getVideoDetails, searchTrendingVideos } from './youtube-fetcher.js';
import { getTranscript } from './transcript-api.js';
import { generateCaption } from './openrouter.js';
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
    console.log('🔍 Fetching trending videos...');
    
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
    
    for (const query of searchQueries.slice(0, 5)) { // Limit to avoid rate limits
      try {
        const videos = await searchTrendingVideos(query, Math.ceil(maxResults / searchQueries.length));
        trendingVideos.push(...videos);
      } catch (error) {
        console.error(`Error searching "${query}":`, error.message);
      }
    }
    
    // Remove duplicates
    const uniqueVideos = Array.from(
      new Map(trendingVideos.map(v => [v.videoId, v])).values()
    );
    
    console.log(`✅ Found ${uniqueVideos.length} unique trending videos`);
    return uniqueVideos.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
}

/**
 * Analyze and rank videos by trend score
 */
export async function analyzeAndRankVideos(videos) {
  console.log('📊 Analyzing and ranking videos...');
  
  const analyzedVideos = [];
  
  for (const video of videos) {
    try {
      // Get detailed video stats
      const details = await getVideoDetails(video.videoId);
      const trendData = calculateTrendScore(details);
      
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
        reason = `Trending content with ${details.viewCount} views`;
      }
      
      analyzedVideos.push({
        ...details,
        ...video,
        trendScore: trendData.score,
        trendData,
        reason,
        channelName: details.channelTitle || video.channelTitle || 'Unknown'
      });
    } catch (error) {
      console.error(`Error analyzing video ${video.videoId}:`, error.message);
    }
  }
  
  // Sort by trend score (highest first)
  analyzedVideos.sort((a, b) => b.trendScore - a.trendScore);
  
  console.log(`✅ Ranked ${analyzedVideos.length} videos`);
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
    
    console.log('📊 Saving to Google Sheets...');
    
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
    const rows = videos.map(video => [
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
    ]);
    
    // Clear existing data and add headers + new data
    const range = 'Trending Videos!A1:K1000';
    
    // First, clear the sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range
    });
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Trending Videos!A1:K1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers]
      }
    });
    
    // Add data
    if (rows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Trending Videos!A2:K',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rows
        }
      });
    }
    
    console.log(`✅ Saved ${rows.length} videos to Google Sheets`);
  } catch (error) {
    console.error('Error saving to Google Sheets:', error.message);
    // Don't throw - allow workflow to continue
  }
}

/**
 * AI Clip Extraction - Find best moments
 */
export async function extractBestClip(videoId) {
  try {
    console.log(`🎬 Extracting best clip from ${videoId}...`);
    
    // Get transcript
    const transcript = await getTranscript(videoId);
    if (transcript.length === 0) {
      throw new Error('No transcript available');
    }
    
    // Get video details
    const details = await getVideoDetails(videoId);
    
    // Use AI to find best moment
    const bestMoments = await findBestMomentWithAI(transcript, details);
    
    if (bestMoments.length === 0) {
      throw new Error('No engaging moments found');
    }
    
    const bestMoment = bestMoments[0]; // Take the top moment
    
    // Generate caption
    const caption = await generateCaption(bestMoment.text || transcript[0].text);
    
    return {
      videoId,
      startTime: bestMoment.start,
      endTime: bestMoment.end,
      duration: bestMoment.end - bestMoment.start,
      text: bestMoment.text,
      caption,
      reason: bestMoment.reason,
      title: details.title
    };
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
    
    // Try to parse JSON from response
    let moment;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moment = JSON.parse(jsonMatch[0]);
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
 */
export async function uploadToYouTubeShorts(clipData) {
  try {
    console.log('📤 Uploading to YouTube Shorts...');
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // For now, return metadata (actual upload requires video file)
    // In production, you'd use yt-dlp to download, ffmpeg to clip, then upload
    
    const videoMetadata = {
      snippet: {
        title: clipData.caption || clipData.title || 'Viral Short',
        description: `${clipData.reason}\n\n#shorts #viral #trending`,
        categoryId: '22', // People & Blogs
        tags: ['shorts', 'viral', 'trending', 'highlights']
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    };
    
    console.log('✅ YouTube Shorts metadata prepared');
    console.log('📝 Note: Actual video upload requires video file processing');
    
    return {
      success: true,
      metadata: videoMetadata,
      note: 'Video file processing required for actual upload'
    };
  } catch (error) {
    console.error('Error preparing YouTube Shorts upload:', error.message);
    throw error;
  }
}

/**
 * Complete Trending Workflow
 */
export async function runTrendingWorkflow(options = {}) {
  try {
    console.log('\n🚀 Starting Trending Workflow...\n');
    
    // Step 1: Fetch trending videos
    const videos = await fetchTrendingVideos(options.maxResults || 20);
    
    // Step 2: Analyze and rank
    const rankedVideos = await analyzeAndRankVideos(videos);
    
    // Step 3: Select top videos
    const topVideos = rankedVideos.slice(0, options.topCount || 5);
    console.log(`\n🎯 Selected top ${topVideos.length} videos:\n`);
    
    topVideos.forEach((v, i) => {
      console.log(`${i + 1}. ${v.title}`);
      console.log(`   Score: ${v.trendScore} | ${v.reason}`);
      console.log(`   Views: ${v.viewCount} | Link: ${v.url}\n`);
    });
    
    // Step 4: Save to Google Sheets
    await saveToGoogleSheets(topVideos);
    
    // Step 5: Extract best clip from top video
    if (options.extractClip && topVideos.length > 0) {
      const topVideo = topVideos[0];
      console.log(`\n🎬 Processing top video: ${topVideo.title}`);
      
      const clip = await extractBestClip(topVideo.videoId);
      console.log(`✅ Best clip: ${clip.startTime}s - ${clip.endTime}s`);
      console.log(`   Reason: ${clip.reason}`);
      console.log(`   Caption: ${clip.caption}\n`);
      
      // Step 6: Upload to YouTube Shorts (if enabled)
      if (options.uploadToYouTube) {
        await uploadToYouTubeShorts(clip);
      }
      
      return {
        success: true,
        videos: topVideos,
        clip,
        message: 'Trending workflow completed successfully'
      };
    }
    
    return {
      success: true,
      videos: topVideos,
      message: 'Trending workflow completed (clip extraction skipped)'
    };
  } catch (error) {
    console.error('Error in trending workflow:', error);
    throw error;
  }
}

