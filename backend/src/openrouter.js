import axios from 'axios';

export async function generateCaption(transcript) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
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

