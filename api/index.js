// Import the main Express app from backend/server.js
// This includes all routes including OAuth endpoints
import app from '../backend/server.js';

// Export for Vercel Serverless Functions
export default app;

