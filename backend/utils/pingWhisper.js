// utils/pingWhisper.js
// Keeps Hugging Face Whisper Space awake by pinging every 5 minutes

import axios from 'axios';

const WHISPER_URL = "https://wes22-linely-whisper-api.hf.space";

async function pingWhisper() {
  const random = Math.floor(Math.random() * 10000);
  const url = `${WHISPER_URL}?ping=${random}`;

  try {
    const response = await axios.get(url, {
      timeout: 5000, // 5 second timeout
      validateStatus: (status) => status < 500 // Don't throw on 404, etc.
    });

    if (response.status === 200 || response.status === 404) {
      // 404 is OK - it means the Space is awake, just the ping endpoint doesn't exist
      console.log("✅ Whisper Space pinged successfully:", new Date().toLocaleTimeString());
    } else {
      console.log("⚠️ Whisper ping failed:", response.status);
    }
  } catch (err) {
    // Don't log network errors as critical - Space might be sleeping
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      console.log("⚠️ Whisper Space ping timeout (Space may be sleeping):", err.message);
    } else {
      console.log("❌ Ping error:", err.message);
    }
  }
}

export default function startWhisperPinger() {
  // Run immediately
  pingWhisper();

  // Repeat every 5 minutes
  setInterval(pingWhisper, 5 * 60 * 1000);
  
  console.log("🔄 Whisper Space pinger started (pinging every 5 minutes)");
}

