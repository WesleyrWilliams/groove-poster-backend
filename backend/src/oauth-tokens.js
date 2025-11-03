import axios from 'axios';

/**
 * Get a valid access token for Google APIs
 * Automatically refreshes if expired using refresh token
 * @returns {Promise<string>} Valid access token
 */
export async function getAccessToken() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  if (!refreshToken) {
    throw new Error('GOOGLE_REFRESH_TOKEN not set. Please complete the one-time OAuth authorization first.');
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const { access_token, expires_in } = response.data;
    
    console.log(`✅ Refreshed access token (expires in ${expires_in} seconds)`);
    
    return access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error.response?.data || error.message);
    throw new Error(`Failed to refresh access token: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Check if we have a refresh token configured
 * @returns {boolean}
 */
export function hasRefreshToken() {
  return !!process.env.GOOGLE_REFRESH_TOKEN;
}

/**
 * Store refresh token (for one-time setup)
 * In production, this should save to a database
 * For now, we'll log it and instruct user to add to .env
 */
export function logRefreshToken(refreshToken) {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ REFRESH TOKEN RECEIVED!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📋 IMPORTANT: Add this to your Vercel environment variables:');
  console.log('\nGOOGLE_REFRESH_TOKEN=' + refreshToken);
  console.log('\nOr add to your local .env file for testing.');
  console.log('\n═══════════════════════════════════════════════════════════\n');
}

