// Import the main Express app from backend/server.js
// This includes all routes including OAuth endpoints
import app from '../backend/server.js';

// Note: The pingWhisper function is automatically started in server.js
// It will ping the Hugging Face Whisper Space every 5 minutes to keep it awake

// Export for Vercel Serverless Functions
export default app;

