import { getVideoDetails, getChannelVideos, searchTrendingVideos } from './youtube-fetcher.js';
import { getTranscript, getBestMoments } from './transcript-api.js';
import { generateCaption } from './openrouter.js';
import { uploadToTikTok, uploadToInstagram, uploadToYouTube, uploadToFacebook } from './social-uploads.js';

export async function processVideoWithFreeTools(videoUrl, options = {}) {
  try {
    console.log(`🎬 Processing video: ${videoUrl}`);
    
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // Step 1: Get video details (with timeout - don't block if slow)
    let videoDetails;
    try {
      console.log('📊 Fetching video details...');
      const detailsPromise = getVideoDetails(videoId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      videoDetails = await Promise.race([detailsPromise, timeoutPromise]);
      console.log(`✅ Found: "${videoDetails.title}"`);
    } catch (error) {
      console.warn('⚠️ Video details fetch timed out or failed, continuing with minimal details');
      videoDetails = {
        videoId,
        title: 'Video',
        description: '',
        thumbnail: '',
        publishedAt: new Date().toISOString(),
        duration: 0,
        viewCount: 0,
        likeCount: 0,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }
    
    // Step 2: Get transcript (free)
    console.log('📝 Getting transcript...');
    const transcript = await getTranscript(videoId);
    
    if (transcript.length === 0) {
      console.log('⚠️ No transcript available, skipping');
      return { success: false, message: 'No transcript available' };
    }
    
    console.log(`✅ Got ${transcript.length} transcript segments`);
    
    // Step 3: Find best moments using AI
    console.log('🎯 Finding best moments...');
    const bestMoments = await findBestMomentsWithAI(transcript, videoDetails);
    
    if (bestMoments.length === 0) {
      console.log('⚠️ No good moments found');
      return { success: false, message: 'No engaging moments found' };
    }
    
    console.log(`✅ Found ${bestMoments.length} viral moments`);
    
    // Step 4: Generate captions for each clip
    console.log('✍️ Generating captions...');
    const clipsWithCaptions = [];
    
    for (const moment of bestMoments) {
      const caption = await generateCaption(moment.text || transcript[0].text);
      clipsWithCaptions.push({
        ...moment,
        caption: caption.caption || moment.text,
      });
    }
    
    console.log('✅ Captions generated');
    
    // Step 5: Upload to social media platforms
    console.log('⏫ Uploading clips...');
    const uploadResults = [];
    
    for (const clip of clipsWithCaptions) {
      const results = await Promise.allSettled([
        process.env.TIKTOK_ACCESS_TOKEN ? uploadToTikTok(clip) : Promise.resolve({ skipped: true }),
        process.env.INSTAGRAM_ACCESS_TOKEN ? uploadToInstagram(clip) : Promise.resolve({ skipped: true }),
        process.env.YOUTUBE_ACCESS_TOKEN ? uploadToYouTube(clip, videoDetails) : Promise.resolve({ skipped: true }),
        process.env.FACEBOOK_ACCESS_TOKEN ? uploadToFacebook(clip) : Promise.resolve({ skipped: true }),
      ]);
      
      uploadResults.push({
        clip: clip.text,
        results: results.map(r => r.status),
      });
    }
    
    console.log('✅ Upload complete!');
    
    return {
      success: true,
      video: videoDetails,
      clips: clipsWithCaptions,
      uploadResults,
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}

export async function processChannelAutomatically(channelId, options = {}) {
  try {
    console.log(`📺 Processing channel: ${channelId}`);
    
    // Get latest videos
    const videos = await getChannelVideos(channelId, 5);
    console.log(`✅ Found ${videos.length} videos`);
    
    const results = [];
    
    for (const video of videos) {
      try {
        const result = await processVideoWithFreeTools(video.url, options);
        results.push({
          video: video.title,
          success: result.success,
          clips: result.clips?.length || 0,
        });
        
        // Wait between videos
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Error processing ${video.title}:`, error.message);
        results.push({
          video: video.title,
          success: false,
          error: error.message,
        });
      }
    }
    
    return {
      success: true,
      videosProcessed: results.length,
      results,
    };
  } catch (error) {
    console.error('Error processing channel:', error);
    throw error;
  }
}

async function findBestMomentsWithAI(transcript, videoDetails) {
  try {
    // Use OpenRouter AI to find best moments
    const fullTranscript = transcript
      .slice(0, 50)
      .map(t => `[${formatTime(t.start)}] ${t.text}`)
      .join('\n');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You analyze video transcripts and identify the 3 most viral-worthy moments for short-form content.',
          },
          {
            role: 'user',
            content: `Video title: "${videoDetails.title}"\n\nTranscript (with timestamps):\n${fullTranscript}\n\nFind the top 3 most engaging 30-60 second clips that would go viral on TikTok/Instagram. For each clip, provide:\n1. Start timestamp (seconds)\n2. End timestamp (seconds) \n3. Why it's viral-worthy\n\nReturn ONLY valid JSON array format:\n[{"start": 45, "end": 90, "reason": "emotional moment"}]`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    let moments;
    try {
      const parsed = JSON.parse(content);
      moments = parsed.moments || parsed.clips || [];
    } catch {
      // Fallback to simple heuristic
      moments = getBestMoments(transcript, 3);
    }
    
    // Map back to transcript segments
    return moments.map(moment => {
      const startSegment = findSegmentAtTime(transcript, moment.start);
      const endSegment = findSegmentAtTime(transcript, moment.end || moment.start + 60);
      
      return {
        start: moment.start,
        end: moment.end || moment.start + 60,
        reason: moment.reason || 'Engaging moment',
        text: startSegment?.text || '',
      };
    });
  } catch (error) {
    console.error('Error finding moments with AI:', error.message);
    // Fallback to simple heuristic
    return getBestMoments(transcript, 3);
  }
}

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function findSegmentAtTime(transcript, time) {
  return transcript.find(segment => 
    segment.start <= time && segment.start + segment.duration >= time
  ) || transcript[Math.floor(time / 30)];
}

export { getBestMoments } from './transcript-api.js';

