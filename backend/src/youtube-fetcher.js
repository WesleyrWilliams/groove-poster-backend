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
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ YOUTUBE_API_KEY not set, skipping video details fetch');
      return {
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
    
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          key: apiKey,
          id: videoId,
          part: 'snippet,statistics,contentDetails',
        },
        timeout: 10000, // 10 second timeout
      }
    );
    
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
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
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn('⚠️ YouTube API timeout, using minimal details');
      return {
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
    console.error('Error fetching video details:', error.response?.data || error.message);
    // Return minimal details instead of throwing to avoid blocking
    return {
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
}

function parseDuration(isoDuration) {
  // Convert ISO 8601 duration to seconds
  const matches = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(matches[1]) || 0;
  const minutes = parseInt(matches[2]) || 0;
  const seconds = parseInt(matches[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

