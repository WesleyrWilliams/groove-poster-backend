/**
 * Test Runner Script
 * Runs the complete test and captures all output
 */

import { runCompleteTest } from './test-ai-youtube-flow-complete.js';

console.log('🚀 Starting test runner...\n');

// Set environment variables from command line args
if (process.argv.includes('--no-clip')) {
  process.env.EXTRACT_CLIP = 'false';
}
if (process.argv.includes('--no-upload')) {
  process.env.UPLOAD_TO_YOUTUBE = 'false';
}
if (process.argv.includes('--upload')) {
  process.env.UPLOAD_TO_YOUTUBE = 'true';
}
if (process.argv.includes('--clip')) {
  process.env.EXTRACT_CLIP = 'true';
}

runCompleteTest()
  .then(results => {
    console.log('\n✅ Test completed successfully!');
    console.log(`Results: ${JSON.stringify(results, null, 2)}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });

