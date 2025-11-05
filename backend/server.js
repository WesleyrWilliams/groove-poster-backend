import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processVideoWithFreeTools, processChannelAutomatically } from './src/new-workflow.js';
import { logRefreshToken } from './src/oauth-tokens.js';
import { runTrendingWorkflow } from './src/trending-workflow.js';
import startWhisperPinger from './utils/pingWhisper.js';

dotenv.config();

// Start pinging Hugging Face Whisper Space every 5 minutes to keep it awake
startWhisperPinger();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
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
      terms: '/terms',
      oauth2: '/oauth2 (one-time setup)',
      oauth2Callback: '/oauth2callback',
      oauth2Test: '/oauth2/test (test auto-connection)',
      sheetsCheck: '/api/sheets/check (check Google Sheets config)',
      trendingWorkflow: '/api/trending-workflow (run full trending flow)'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GrooveSzn API is running - FREE VERSION',
    timestamp: new Date().toISOString()
  });
});

// Privacy Policy (required by TikTok/YouTube)
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

// Terms of Service (required by TikTok/YouTube)
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

    // Return immediately - process in background
    res.json({
      success: true,
      message: 'Video processing started (FREE AI-powered)',
      note: 'Processing in background - check logs for progress',
      videoUrl
    });
    
    // Process asynchronously after response is sent
    setImmediate(async () => {
      try {
        console.log(`\n🚀 Processing video in background: ${videoUrl}`);
        const result = await processVideoWithFreeTools(videoUrl);
        console.log('✅ Video processed successfully:', result);
      } catch (err) {
        console.error('❌ Video processing failed:', err.message);
        console.error(err.stack);
      }
    });
  } catch (error) {
    console.error('Error starting video processing:', error);
    // Only send error if response hasn't been sent
    if (!res.headersSent) {
      res.status(500).json({
        error: error.message || 'Failed to start video processing',
      });
    }
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

// Google OAuth Routes
app.get('/oauth2', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return res.status(500).json({ 
      error: 'GOOGLE_CLIENT_ID not configured',
      message: 'Please add GOOGLE_CLIENT_ID to your environment variables'
    });
  }
  
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://groove-poster-backend.vercel.app/oauth2callback';
  
  // Request scopes needed for YouTube and Sheets
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/spreadsheets'
  ].join(' ');
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline', // Required to get refresh token
    prompt: 'consent', // Force consent screen to always get refresh token
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://groove-poster-backend.vercel.app/oauth2callback';
    const tokenUrl = process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token';

    // Exchange code for tokens
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(400).json({ 
        error: 'Failed to exchange code for tokens',
        details: tokens 
      });
    }

    // Log refresh token to console (for one-time setup)
    if (tokens.refresh_token) {
      logRefreshToken(tokens.refresh_token);
    } else {
      console.warn('⚠️ WARNING: No refresh token received! You may need to revoke access and try again with prompt=consent');
    }

    // Success - return tokens with clear instructions
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Success - GrooveSzn</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; }
          h1 { color: #10b981; text-align: center; }
          .success { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .critical { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .token { background: #1f2937; color: #10b981; padding: 15px; border-radius: 4px; word-break: break-all; font-size: 13px; font-family: monospace; margin: 10px 0; overflow-x: auto; }
          .instruction { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .step { margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>✅ YouTube OAuth Authorization Successful!</h1>
        
        <div class="success">
          <p><strong>🎉 Your Google account has been successfully authorized!</strong></p>
          <p>You can now close this tab. The backend will automatically connect to YouTube forever.</p>
        </div>

        ${tokens.refresh_token ? `
          <div class="critical">
            <h3>⚠️ CRITICAL: Save Your Refresh Token</h3>
            <p><strong>This refresh token is permanent and lets your backend connect automatically forever.</strong></p>
            <p><strong>Copy this refresh token and add it to Vercel environment variables:</strong></p>
            <div class="token">${tokens.refresh_token}</div>
            <div class="instruction">
              <h4>📝 Steps to Complete Setup:</h4>
              <div class="step">
                <strong>1. Go to Vercel Dashboard:</strong><br>
                → Your <code>groove-poster-backend</code> project<br>
                → Settings → Environment Variables
              </div>
              <div class="step">
                <strong>2. Add New Variable:</strong><br>
                Variable Name: <code>GOOGLE_REFRESH_TOKEN</code><br>
                Value: <code>${tokens.refresh_token}</code>
              </div>
              <div class="step">
                <strong>3. Redeploy:</strong><br>
                After adding, redeploy your backend. That's it! 🎉
              </div>
            </div>
          </div>
        ` : `
          <div class="critical">
            <h3>⚠️ WARNING: No Refresh Token Received</h3>
            <p>You may need to revoke access and try again. Make sure:</p>
            <ul>
              <li>You used <code>prompt=consent</code> in the OAuth URL</li>
              <li>You clicked "Allow" on all permission screens</li>
            </ul>
            <p><a href="/oauth2" style="color: #2563eb;">Try Again →</a></p>
          </div>
        `}

        <div class="instruction">
          <h3>📊 Token Information:</h3>
          <p><strong>Access Token:</strong> <span style="color: #6b7280;">(expires in ${tokens.expires_in || 'N/A'} seconds)</span></p>
          <p><strong>Token Type:</strong> ${tokens.token_type || 'Bearer'}</p>
          <p><strong>Scope:</strong> ${tokens.scope || 'N/A'}</p>
        </div>

        <p style="text-align: center; margin-top: 30px;">
          <a href="/" style="color: #2563eb; text-decoration: none; font-weight: bold;">← Back to API</a>
        </p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'OAuth callback failed', 
      message: error.message 
    });
  }
});

// Check Google Sheets configuration
app.get('/api/sheets/check', async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;
    
    return res.json({
      configured: !!sheetId,
      sheetId: sheetId || 'NOT SET',
      expectedSheetId: '1wkkQa2SFHRpvZS8HJ9j3BVTIbnAWA0xKA_Gwysch2WQ',
      oauthConnected: hasRefreshToken,
      instructions: sheetId 
        ? '✅ GOOGLE_SHEET_ID is set. Check Vercel logs for errors.'
        : '⚠️ Add GOOGLE_SHEET_ID to Vercel environment variables',
      sheetUrl: sheetId 
        ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
        : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test OAuth connection (auto-refresh)
app.get('/oauth2/test', async (req, res) => {
  try {
    const { getAccessToken, hasRefreshToken } = await import('./src/oauth-tokens.js');
    
    if (!hasRefreshToken()) {
      return res.status(400).json({
        error: 'Refresh token not configured',
        message: 'Please complete the one-time OAuth setup first by visiting /oauth2',
        instructions: '1. Visit /oauth2 to authorize\n2. Copy the refresh token\n3. Add GOOGLE_REFRESH_TOKEN to environment variables\n4. Redeploy'
      });
    }

    const accessToken = await getAccessToken();
    
    res.json({
      success: true,
      message: '✅ Automatic YouTube connection working!',
      accessToken: accessToken.substring(0, 20) + '...',
      note: 'Access token refreshed automatically. You can now use YouTube APIs without manual authorization.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get access token',
      message: error.message,
      hint: 'Make sure GOOGLE_REFRESH_TOKEN is set correctly in environment variables'
    });
  }
});

// Process 5 Clips from Specific Video
app.post('/api/process-5-clips', async (req, res) => {
  try {
    const { 
      videoUrl,
      uploadToYouTube = false,
      watermarkPath = null
    } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }
    
    console.log(`\n🎬 Processing 5 clips from video...`);
    console.log(`   Video URL: ${videoUrl}`);
    console.log(`   Upload to YouTube: ${uploadToYouTube}\n`);
    
    // Import test script function
    const { process5ClipsFromVideo } = await import('./src/clip-processor.js');
    
    // Run processing asynchronously
    process5ClipsFromVideo(videoUrl, {
      uploadToYouTube,
      watermarkPath: watermarkPath || './logo.png'
    }).then(result => {
      console.log('\n✅ 5-clip processing completed');
      console.log(`   Processed: ${result.processedClips}/${result.totalClips} clips`);
      if (uploadToYouTube) {
        console.log(`   Uploaded: ${result.uploadedClips} clips to YouTube`);
      }
    }).catch(err => {
      console.error('❌ 5-clip processing failed:', err.message);
    });
    
    res.json({
      success: true,
      message: '5-clip processing started',
      note: 'Processing in background - check logs for progress',
      videoUrl
    });
  } catch (error) {
    console.error('Error starting 5-clip processing:', error);
    res.status(500).json({
      error: error.message || 'Failed to start 5-clip processing',
    });
  }
});

// Trending Workflow - Full AI Clip Fetcher Integration
app.post('/api/trending-workflow', async (req, res) => {
  try {
    const { 
      maxResults = 20,
      topCount = 5,
      extractClip = true,
      uploadToYouTube = false,
      videoUrl = null // Optional: process specific video instead of trending
    } = req.body;
    
    console.log(`\n🚀 Starting Trending Workflow...`);
    console.log(`   Max Results: ${maxResults}`);
    console.log(`   Top Count: ${topCount}`);
    console.log(`   Extract Clip: ${extractClip}`);
    console.log(`   Upload to YouTube: ${uploadToYouTube}`);
    if (videoUrl) {
      console.log(`   Specific Video: ${videoUrl}`);
    }
    console.log('');
    
    // If specific video URL provided, process that instead
    if (videoUrl) {
      const { process5ClipsFromVideo } = await import('./src/clip-processor.js');
      
      process5ClipsFromVideo(videoUrl, {
        uploadToYouTube,
        watermarkPath: './logo.png'
      }).then(result => {
        console.log('\n✅ 5-clip processing completed');
        console.log(`   Processed: ${result.processedClips}/${result.totalClips} clips`);
        if (uploadToYouTube) {
          console.log(`   Uploaded: ${result.uploadedClips} clips to YouTube`);
        }
      }).catch(err => {
        console.error('❌ 5-clip processing failed:', err.message);
      });
      
      return res.json({
        success: true,
        message: '5-clip processing started for specific video',
        note: 'Processing in background - check logs for progress',
        videoUrl
      });
    }
    
    // Run trending workflow asynchronously
    runTrendingWorkflow({
      maxResults,
      topCount,
      extractClip,
      uploadToYouTube
    }).then(result => {
      console.log('\n✅ Trending workflow completed successfully');
      console.log(`   Selected ${result.videos?.length || 0} top videos`);
      if (result.clip) {
        console.log(`   Best clip extracted: ${result.clip.startTime}s - ${result.clip.endTime}s`);
      }
    }).catch(err => {
      console.error('❌ Trending workflow failed:', err.message);
    });
    
    res.json({
      success: true,
      message: 'Trending workflow started',
      note: 'Processing in background - check logs for progress',
      options: {
        maxResults,
        topCount,
        extractClip,
        uploadToYouTube
      }
    });
  } catch (error) {
    console.error('Error starting trending workflow:', error);
    res.status(500).json({
      error: error.message || 'Failed to start trending workflow',
    });
  }
});

// Get Stats Endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { getAccessToken } = await import('./src/oauth-tokens.js');
    const { google } = await import('googleapis');
    
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return res.json({
        videosFound: 0,
        postedToday: 0,
        pendingQueue: 0,
        automationStatus: 'Active'
      });
    }
    
    try {
      const accessToken = await getAccessToken();
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      
      // Read from Trending Videos sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Trending Videos!A2:K1000'
      });
      
      const rows = response.data.values || [];
      const today = new Date().toDateString();
      
      const stats = {
        videosFound: rows.length,
        postedToday: rows.filter(row => {
          const status = row[10] || ''; // Status column
          const date = row[9] || ''; // Published Date column
          return status === 'Uploaded' && date.includes(today);
        }).length,
        pendingQueue: rows.filter(row => {
          const status = row[10] || '';
          return status === 'Selected' || status === 'Processing';
        }).length,
        automationStatus: 'Active'
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error.message);
      res.json({
        videosFound: 0,
        postedToday: 0,
        pendingQueue: 0,
        automationStatus: 'Active'
      });
    }
  } catch (error) {
    res.json({
      videosFound: 0,
      postedToday: 0,
      pendingQueue: 0,
      automationStatus: 'Active'
    });
  }
});

// Get Content Library Endpoint
app.get('/api/content-library', async (req, res) => {
  try {
    const { getAccessToken } = await import('./src/oauth-tokens.js');
    const { google } = await import('googleapis');
    
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return res.json([]);
    }
    
    try {
      const accessToken = await getAccessToken();
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      
      // Read from Trending Videos sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Trending Videos!A2:K100'
      });
      
      const rows = response.data.values || [];
      const contentLibrary = rows.map((row, idx) => {
        const title = row[1] || 'Untitled';
        const status = row[10] || 'Found';
        const link = row[2] || '';
        const channel = row[0] || '';
        
        // Determine platform from channel or defaults
        let platform = 'Both';
        if (channel.includes('TikTok') || title.toLowerCase().includes('tiktok')) {
          platform = 'TikTok';
        } else if (channel.includes('YouTube') || link.includes('youtube.com')) {
          platform = 'YouTube';
        }
        
        // Generate thumbnail emoji based on title
        const emojis = ['🎮', '💃', '💻', '🐕', '🍳', '👗', '🎬', '🔥', '⚡', '🎯'];
        const thumbnail = emojis[idx % emojis.length];
        
        return {
          id: idx + 1,
          title: title.substring(0, 50),
          status,
          platform,
          thumbnail,
          link,
          channel
        };
      }).slice(0, 20); // Limit to 20 most recent
      
      res.json(contentLibrary);
    } catch (error) {
      console.error('Error fetching content library:', error.message);
      res.json([]);
    }
  } catch (error) {
    res.json([]);
  }
});

// Get Automation Status Endpoint
app.get('/api/automation-status', async (req, res) => {
  try {
    // In a real app, this would be stored in database
    // For now, return default status
    res.json({
      active: true,
      postingInterval: 1, // hours
      batchSize: 5,
      platformPriority: 'both'
    });
  } catch (error) {
    res.json({
      active: true,
      postingInterval: 1,
      batchSize: 5,
      platformPriority: 'both'
    });
  }
});

// Save Automation Settings Endpoint
app.post('/api/automation-settings', async (req, res) => {
  try {
    const { active, postingInterval, batchSize, platformPriority } = req.body;
    
    // In a real app, save to database
    // For now, just acknowledge
    console.log('Automation settings saved:', { active, postingInterval, batchSize, platformPriority });
    
    res.json({
      success: true,
      message: 'Settings saved successfully',
      settings: {
        active,
        postingInterval,
        batchSize,
        platformPriority
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 GrooveSzn Shorts Generator running on http://localhost:${PORT}`);
    console.log(`📝 Health: http://localhost:${PORT}/health`);
    console.log(`🔒 Privacy: http://localhost:${PORT}/privacy`);
    console.log(`📋 Terms: http://localhost:${PORT}/terms`);
    console.log(`🔐 OAuth: http://localhost:${PORT}/oauth2`);
    console.log(`↪️  OAuth Callback: http://localhost:${PORT}/oauth2callback`);
  });
}

// Export for Vercel
export default app;

