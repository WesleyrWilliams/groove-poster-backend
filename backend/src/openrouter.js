import axios from 'axios';

export async function generateCaption(transcript) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: "You're a helpful, intelligent social media assistant. You make captions for Instagram, TikTok, YouTube Shorts, and Facebook.",
          },
          {
            role: 'user',
            content: `Your task is to generate high-quality, engaging captions for Instagram, TikTok, YouTube Shorts, and Facebook.

You'll be fed a transcript.

Return your captions in JSON using this format:

{"caption":""}

Rules:
- Keep captions to ~100 words.
- Use a spartan tone of voice, favoring the classic Western style (though still a fit for Instagram and TikTok).
- Write conversationally, i.e as if I were doing the writing myself (in first person).
- Use emojis, but sparingly.
- Ensure each sentence is over 5 words long. Write for a University reading level.

Transcript: ${transcript}`,
          },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.WEBHOOK_URL || 'http://localhost:3001',
          'X-Title': 'Social Media Caption Generator',
          'Content-Type': 'application/json',
        },
      }
    );
    
    const content = response.data.choices[0].message.content;
    
    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch {
      // If not JSON, wrap in object
      return { caption: content };
    }
  } catch (error) {
    console.error('Error generating caption:', error.response?.data || error.message);
    throw new Error('Failed to generate caption');
  }
}

/**
 * Generate title, timestamps, and hashtags for trending video
 * @param {object} videoDetails - Video details (title, views, etc.)
 * @param {Array} transcript - Transcript array with start, duration, text
 * @returns {Promise<object>} Analysis with title, timestamps, hashtags, reason
 */
export async function generateVideoAnalysis(videoDetails, transcript) {
  try {
    const transcriptText = transcript.map(t => 
      `[${Math.floor(t.start)}s] ${t.text}`
    ).join('\n');
    
    const prompt = `Analyze this video and provide the best content for a viral short.

Video Title: ${videoDetails.title || 'Unknown'}
Views: ${videoDetails.viewCount || 0}
Likes: ${videoDetails.likeCount || 0}
Channel: ${videoDetails.channelTitle || 'Unknown'}

Transcript:
${transcriptText}

Your task:
1. Explain why this video is trending (1-2 sentences)
2. Find the best 1-3 timestamp ranges for 15-30 second clips
3. Create a catchy top title (one line, 80-120 characters) with emojis
4. Suggest 3-5 relevant hashtags

Return ONLY valid JSON in this exact format:
{
  "reason": "Why this video is trending...",
  "clips": [
    {
      "start": "00:02",
      "end": "00:22",
      "startSeconds": 2,
      "endSeconds": 22,
      "reason": "Funny reaction moment"
    }
  ],
  "title": "Camilla Araujo reveals that her \"WILL\" for entire $50M net worth is going to her younger BROTHER 😢💖💰",
  "subtitle": "No way Camilla Araujo just EXPOSED N3on after she CAUGHT him 'DIPPING'",
  "hashtags": ["#viral", "#shorts", "#trending"]
}

Important:
- Title should be ALL-CAPS or sentence-case with strong hook
- Include emojis in title (😢💀💖💰🔥)
- Clips should be 15-30 seconds each
- Start/end times should be in "MM:SS" format AND include startSeconds/endSeconds as numbers
- Choose moments with emotional peaks, humor, or unexpected reactions`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media content analyst. You analyze viral videos and create engaging short-form content.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.WEBHOOK_URL || 'http://localhost:3001',
          'X-Title': 'Video Analysis Generator',
          'Content-Type': 'application/json',
        },
      }
    );
    
    const content = response.data.choices[0].message.content;
    
    // Parse JSON response
    try {
      const analysis = JSON.parse(content);
      
      // Validate and ensure clips have proper format
      if (analysis.clips && Array.isArray(analysis.clips)) {
        analysis.clips = analysis.clips.map(clip => {
          // Convert MM:SS to seconds if needed
          if (clip.start && !clip.startSeconds) {
            const [min, sec] = clip.start.split(':').map(Number);
            clip.startSeconds = (min || 0) * 60 + (sec || 0);
          }
          if (clip.end && !clip.endSeconds) {
            const [min, sec] = clip.end.split(':').map(Number);
            clip.endSeconds = (min || 0) * 60 + (sec || 0);
          }
          return clip;
        });
      }
      
      return analysis;
    } catch (parseError) {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error generating video analysis:', error.response?.data || error.message);
    throw new Error('Failed to generate video analysis');
  }
}

