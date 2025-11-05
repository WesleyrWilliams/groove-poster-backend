/**
 * Whisper API Integration for Subtitle Generation
 * Uses Hugging Face Whisper Space API or local Whisper for transcription
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../../temp');

// Hugging Face Whisper Space URL
const HF_WHISPER_URL = process.env.HF_WHISPER_URL || "https://wes22-linely-whisper-api.hf.space";

/**
 * Generate SRT subtitle file using Hugging Face Whisper API
 * @param {string} videoPath - Path to video file
 * @param {string} outputSrtPath - Path to output SRT file
 * @returns {Promise<string>} Path to SRT file
 */
export async function generateSRTWithWhisperAPI(videoPath, outputSrtPath) {
  try {
    console.log(`🎤 Generating subtitles with Hugging Face Whisper API...`);
    console.log(`   Video: ${videoPath}`);
    console.log(`   Space: ${HF_WHISPER_URL}`);
    
    // Read video file as buffer
    const videoBuffer = fs.readFileSync(videoPath);
    
    // Create FormData for Hugging Face API
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('audio', videoBuffer, {
      filename: path.basename(videoPath),
      contentType: 'video/mp4'
    });
    
    // Call Hugging Face Whisper Space API
    // Try /api/predict first, then /predict as fallback
    let apiUrl = `${HF_WHISPER_URL}/api/predict`;
    
    let response;
    try {
      response = await axios.post(
        apiUrl,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 300000, // 5 minutes timeout for longer videos
        }
      );
    } catch (error) {
      // Try /predict endpoint if /api/predict fails
      if (error.response?.status === 404 || apiUrl.includes('/api/predict')) {
        console.log('⚠️ /api/predict failed, trying /predict endpoint...');
        apiUrl = `${HF_WHISPER_URL}/predict`;
        response = await axios.post(
          apiUrl,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
            timeout: 300000,
          }
        );
      } else {
        throw error;
      }
    }
    
    // Handle different response formats from HF Spaces
    let srtContent = '';
    
    if (response.data && typeof response.data === 'string') {
      // Direct SRT string
      srtContent = response.data;
    } else if (response.data && response.data.data) {
      // Nested data structure
      srtContent = Array.isArray(response.data.data) 
        ? response.data.data.join('\n') 
        : response.data.data;
    } else if (response.data && response.data.output) {
      // Output field
      srtContent = response.data.output;
    } else if (response.data && response.data.text) {
      // Text field (convert to SRT format)
      srtContent = response.data.text;
    } else {
      // Try to extract any text content
      const dataStr = JSON.stringify(response.data);
      srtContent = dataStr;
    }
    
    // If response is not SRT format, try to parse as JSON and convert
    if (!srtContent.includes('-->') && !srtContent.includes('WEBVTT')) {
      // Might be JSON response, try to extract transcript
      try {
        const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        if (jsonData.text || jsonData.transcript) {
          // Convert plain text to simple SRT
          const text = jsonData.text || jsonData.transcript || '';
          srtContent = convertTextToSRT(text);
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse response as JSON, using raw response');
      }
    }
    
    // Save SRT file
    fs.writeFileSync(outputSrtPath, srtContent);
    console.log(`✅ SRT subtitles generated: ${outputSrtPath}`);
    
    return outputSrtPath;
  } catch (error) {
    console.error('❌ Error generating SRT with Hugging Face Whisper API:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Convert plain text to basic SRT format
 * @param {string} text - Plain text transcript
 * @returns {string} SRT formatted content
 */
function convertTextToSRT(text) {
  // Simple conversion - split by sentences and create basic SRT
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let srtContent = '';
  
  sentences.forEach((sentence, index) => {
    const startTime = index * 3; // 3 seconds per sentence
    const endTime = startTime + 3;
    
    srtContent += `${index + 1}\n`;
    srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
    srtContent += `${sentence.trim()}\n\n`;
  });
  
  return srtContent;
}

/**
 * Generate SRT subtitle file using local Whisper (if installed)
 * @param {string} videoPath - Path to video file
 * @param {string} outputSrtPath - Path to output SRT file
 * @param {string} model - Whisper model (tiny, base, small, medium, large)
 * @returns {Promise<string>} Path to SRT file
 */
export async function generateSRTWithLocalWhisper(videoPath, outputSrtPath, model = 'small') {
  try {
    console.log(`🎤 Generating subtitles with local Whisper...`);
    console.log(`   Video: ${videoPath}`);
    console.log(`   Model: ${model}`);
    
    // Check if whisper is installed
    try {
      await execAsync('which whisper');
    } catch {
      throw new Error('Whisper CLI not found. Install via: pip install openai-whisper');
    }
    
    // Run whisper command
    const command = `whisper "${videoPath}" --model ${model} --output_format srt --output_dir "${path.dirname(outputSrtPath)}" --language en`;
    
    await execAsync(command);
    
    // Find the generated SRT file (whisper names it based on input filename)
    const videoBasename = path.basename(videoPath, path.extname(videoPath));
    const generatedSrtPath = path.join(path.dirname(outputSrtPath), `${videoBasename}.srt`);
    
    if (fs.existsSync(generatedSrtPath)) {
      // Move to desired output path if different
      if (generatedSrtPath !== outputSrtPath) {
        fs.copyFileSync(generatedSrtPath, outputSrtPath);
        fs.unlinkSync(generatedSrtPath);
      }
      console.log(`✅ SRT subtitles generated: ${outputSrtPath}`);
      return outputSrtPath;
    } else {
      throw new Error('Whisper did not generate SRT file');
    }
  } catch (error) {
    console.error('❌ Error generating SRT with local Whisper:', error.message);
    throw error;
  }
}

/**
 * Generate SRT subtitle file (auto-detect method)
 * @param {string} videoPath - Path to video file
 * @param {string} outputSrtPath - Path to output SRT file
 * @param {object} options - Options (preferLocal, model, useHF)
 * @returns {Promise<string>} Path to SRT file
 */
export async function generateSRT(videoPath, outputSrtPath, options = {}) {
  const { preferLocal = false, model = 'small', useHF = true } = options;
  
  // Try Hugging Face Whisper API first (default)
  if (useHF) {
    try {
      return await generateSRTWithWhisperAPI(videoPath, outputSrtPath);
    } catch (error) {
      console.warn('⚠️ Hugging Face Whisper API failed, trying local...');
      // Fall through to local
    }
  }
  
  // Try local Whisper if preferred or as fallback
  if (preferLocal || !useHF) {
    try {
      return await generateSRTWithLocalWhisper(videoPath, outputSrtPath, model);
    } catch (error) {
      if (useHF) {
        // If HF failed and local failed, throw error
        throw new Error('Both Hugging Face Whisper API and local Whisper failed. Check HF Space is running or install whisper CLI.');
      }
      throw error;
    }
  }
  
  // Final fallback to local
  try {
    return await generateSRTWithLocalWhisper(videoPath, outputSrtPath, model);
  } catch (error) {
    throw new Error('All Whisper methods failed. Check Hugging Face Space is running or install whisper CLI.');
  }
}

/**
 * Convert transcript array to SRT format
 * @param {Array} transcript - Transcript array with {start, duration, text}
 * @param {string} outputSrtPath - Path to output SRT file
 * @returns {Promise<string>} Path to SRT file
 */
export async function transcriptToSRT(transcript, outputSrtPath) {
  try {
    console.log(`📝 Converting transcript to SRT format...`);
    
    let srtContent = '';
    let index = 1;
    
    for (const segment of transcript) {
      const start = segment.start || 0;
      const duration = segment.duration || 0;
      const end = start + duration;
      const text = segment.text || '';
      
      // Format timestamps for SRT (HH:MM:SS,mmm)
      const startTime = formatSRTTime(start);
      const endTime = formatSRTTime(end);
      
      srtContent += `${index}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${text}\n\n`;
      
      index++;
    }
    
    fs.writeFileSync(outputSrtPath, srtContent);
    console.log(`✅ SRT file created: ${outputSrtPath}`);
    
    return outputSrtPath;
  } catch (error) {
    console.error('❌ Error converting transcript to SRT:', error.message);
    throw error;
  }
}

/**
 * Format time in seconds to SRT format (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

