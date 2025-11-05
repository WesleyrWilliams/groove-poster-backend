import 'dotenv/config';
import { google } from 'googleapis';
import { getAccessToken } from '../src/oauth-tokens.js';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function testGoogleSheetConnection() {
  try {
    console.log("🔍 Step 1: Loading credentials...");

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_SHEET_ID } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error("❌ Missing Google OAuth credentials in .env");
    }

    if (!GOOGLE_SHEET_ID) {
      throw new Error("❌ Missing GOOGLE_SHEET_ID in .env");
    }

    console.log("✅ Step 2: Credentials loaded.");
    console.log(`   Sheet ID: ${GOOGLE_SHEET_ID}`);

    // Use OAuth refresh token (same as workflow)
    const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

    if (!REFRESH_TOKEN) {
      console.log("⚠️ No refresh token found. Please authenticate manually once to get one.");
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
      );
      console.log(`👉 Visit this URL to authenticate:\n${oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      })}`);
      return;
    }

    console.log("✅ Step 3: Using refresh token for OAuth...");
    
    // Get access token using our OAuth function
    const accessToken = await getAccessToken();
    
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    console.log("📊 Step 4: Testing Sheet write...");

    // Test writing to "GrooveSzn Auto Clipper" tab
    const sheetTabName = 'GrooveSzn Auto Clipper';
    const testData = [
      ['Timestamp', 'Video Title', 'Reason Picked', 'Views'],
      [new Date().toISOString(), 'AI Test Clip', 'Trending - Test Case', 99999]
    ];

    try {
      // Try to create the tab if it doesn't exist
      try {
        await sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: `${sheetTabName}!A1`
        });
      } catch (getError) {
        // Tab doesn't exist, create it
        console.log(`📝 Creating "${sheetTabName}" tab...`);
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_SHEET_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetTabName
                }
              }
            }]
          }
        });
        console.log(`✅ Created "${sheetTabName}" tab`);
      }
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${sheetTabName}!A1:D2`,
        valueInputOption: 'RAW',
        requestBody: { values: testData },
      });
      console.log(`✅ Data written successfully to "${sheetTabName}" tab.`);
    } catch (error) {
      console.error(`❌ Error writing to "${sheetTabName}" tab:`, error.message);
      // Try Sheet1 as fallback
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: 'Sheet1!A1:D2',
          valueInputOption: 'RAW',
          requestBody: { values: testData },
        });
        console.log("✅ Data written successfully to 'Sheet1' tab (fallback).");
      } catch (error2) {
        console.error("❌ Error writing to 'Sheet1' tab:", error2.message);
        throw error2;
      }
    }

    console.log("🔄 Step 5: Reading back data...");

    // Try reading from "GrooveSzn Auto Clipper" tab
    let res;
    try {
      res = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${sheetTabName}!A1:D5`,
      });
      console.log(`📄 "${sheetTabName}" Tab Data:`);
    } catch (error) {
      // Try Sheet1 as fallback
      try {
        res = await sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: 'Sheet1!A1:D5',
        });
        console.log("📄 'Sheet1' Tab Data (fallback):");
      } catch (error2) {
        console.error("❌ Error reading from sheet:", error2.message);
        throw error2;
      }
    }

    if (res && res.data.values) {
      console.table(res.data.values);
    } else {
      console.log("⚠️ No data found in sheet");
    }

    console.log("🎉 All tests passed! Google Sheet connection verified.");
    console.log(`📊 Sheet URL: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`);

  } catch (error) {
    console.error("🚨 Test failed:", error.message);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
  }
}

testGoogleSheetConnection();

