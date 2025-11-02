import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import workflow functions
import { processVideoWithFreeTools, processChannelAutomatically } from '../backend/src/new-workflow.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '🎉 GrooveSzn Shorts Generator API is live! 🎉',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      processVideo: '/api/process-video',
      processChannel: '/api/process-channel',
      privacy: '/privacy',
      terms: '/terms'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GrooveSzn API is running - FREE VERSION',
    timestamp: new Date().toISOString()
  });
});

// Privacy Policy
app.get('/privacy', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Privacy Policy - GrooveSzn Shorts Generator</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #333; }
        p { line-height: 1.6; color: #666; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
      <h2>Overview</h2>
      <p>Your privacy is important to us. GrooveSzn Shorts Generator respects your data and privacy.</p>
      <h2>What We Collect</h2>
      <ul>
        <li>YouTube video URLs you provide for processing</li>
        <li>Usage statistics to improve our service</li>
      </ul>
      <h2>What We Don't Collect</h2>
      <ul>
        <li>We do NOT store personal information</li>
        <li>We do NOT share your data with third parties</li>
        <li>We do NOT track your activity outside our service</li>
      </ul>
      <h2>Security</h2>
      <p>All API communication is encrypted. Your data is processed securely and not stored permanently.</p>
      <h2>Contact</h2>
      <p>If you have questions about this privacy policy, please contact us through GitHub.</p>
    </body>
    </html>
  `);
});

// Terms of Service
app.get('/terms', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Terms of Service - GrooveSzn Shorts Generator</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #333; }
        p { line-height: 1.6; color: #666; }
      </style>
    </head>
    <body>
      <h1>Terms of Service</h1>
      <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
      <h2>Acceptance of Terms</h2>
      <p>By using GrooveSzn Shorts Generator, you agree to these terms of service.</p>
      <h2>Service Description</h2>
      <p>GrooveSzn is an AI-powered tool that automatically creates and uploads short-form videos to multiple social media platforms.</p>
      <h2>User Responsibilities</h2>
      <ul>
        <li>You must own or have rights to the content you process</li>
        <li>You must comply with TikTok, YouTube, Instagram, and Facebook's terms of service</li>
        <li>You are responsible for all content uploaded through our service</li>
      </ul>
      <h2>Limitation of Liability</h2>
      <p>GrooveSzn is provided "as is" without warranties. We are not responsible for content uploaded to social media platforms.</p>
      <h2>Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of new terms.</p>
    </body>
    </html>
  `);
});

// Process single video
app.post('/api/process-video', async (req, res) => {
  try {
    const { videoUrl, language = 'en' } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }

    console.log(`\n🚀 New request: Process video ${videoUrl}`);
    
    // Process asynchronously
    processVideoWithFreeTools(videoUrl).then(result => {
      console.log('✅ Video processed successfully');
    }).catch(err => {
      console.error('❌ Video processing failed:', err.message);
    });
    
    res.json({
      success: true,
      message: 'Video processing started (FREE AI-powered)',
      note: 'Processing in background',
    });
  } catch (error) {
    console.error('Error starting video processing:', error);
    res.status(500).json({
      error: error.message || 'Failed to start video processing',
    });
  }
});

// Process YouTube channel
app.post('/api/process-channel', async (req, res) => {
  try {
    const { channelId, language = 'en' } = req.body;
    
    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    console.log(`\n🚀 New request: Process channel ${channelId}`);
    
    // Process asynchronously
    processChannelAutomatically(channelId).then(result => {
      console.log('✅ Channel processed successfully');
    }).catch(err => {
      console.error('❌ Channel processing failed:', err.message);
    });
    
    res.json({
      success: true,
      message: 'Channel processing started (FREE AI-powered)',
      note: 'Processing in background',
    });
  } catch (error) {
    console.error('Error starting channel processing:', error);
    res.status(500).json({
      error: error.message || 'Failed to start channel processing',
    });
  }
});

// Export as default for Vercel
export default app;

