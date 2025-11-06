import axios from 'axios';

export async function getChannelVideos(channelId, maxResults = 5) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          key: apiKey,
          channelId: channelId,
          part: 'snippet',
          type: 'video',
          maxResults: maxResults,
          order: 'date',
        },
      }
    );
    
    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error.response?.data || error.message);
    throw new Error('Failed to fetch YouTube videos');
  }
}

export async function searchTrendingVideos(query, maxResults = 10) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          key: apiKey,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: maxResults,
          order: 'viewCount',
          publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }
    );
    
    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('Error searching YouTube videos:', error.response?.data || error.message);
    throw new Error('Failed to search YouTube videos');
  }
}

export async function getVideoDetails(videoId) {
  // Always return a valid result, never throw
  const minimalDetails = {
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

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ YOUTUBE_API_KEY not set, using minimal details');
      return minimalDetails;
    }
    
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          key: apiKey,
          id: videoId,
          part: 'snippet,statistics,contentDetails',
        },
        timeout: 8000, // 8 second timeout
      }
    );
    
    if (!response.data.items || response.data.items.length === 0) {
      console.warn('⚠️ Video not found in API response, using minimal details');
      return minimalDetails;
    }
    
    const video = response.data.items[0];
    return {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high?.url,
      publishedAt: video.snippet.publishedAt,
      duration: parseDuration(video.contentDetails.duration),
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      url: `https://www.youtube.com/watch?v=${video.id}`,
    };
  } catch (error) {
    // Log error but never throw - always return minimal details
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn('⚠️ YouTube API timeout, using minimal details');
    } else if (error.response?.status === 403) {
      console.warn('⚠️ YouTube API 403 (quota/access), using minimal details');
    } else if (error.response?.status === 404) {
      console.warn('⚠️ YouTube API 404 (video not found), using minimal details');
    } else {
      console.warn('⚠️ YouTube API error, using minimal details:', error.message || error.response?.statusText);
    }
    
    // Always return minimal details instead of throwing
    return minimalDetails;
  }
}

function parseDuration(isoDuration) {
  // Convert ISO 8601 duration to seconds
  const matches = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(matches[1]) || 0;
  const minutes = parseInt(matches[2]) || 0;
  const seconds = parseInt(matches[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

