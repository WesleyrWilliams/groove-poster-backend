// In-memory log storage for workflow logs
// In production, this could be replaced with Redis, database, or file storage
// Logs are cleared on server restart (Vercel serverless functions reset on each deployment)

const logs = [];
const MAX_LOGS = 500; // Keep last 500 logs (reduced to clear old logs faster)

// Clear logs on module load (server restart)
logs.length = 0;

/**
 * Add a log entry
 * @param {string} message - Log message
 * @param {string} type - Log type: 'success', 'processing', 'search', 'upload', 'trigger', 'error'
 * @param {string} workflowId - Optional workflow ID to group logs
 * @param {object} metadata - Optional metadata
 */
export function addLog(message, type = 'processing', workflowId = null, metadata = {}) {
  const logEntry = {
    id: Date.now() + Math.random(), // Unique ID
    message,
    type,
    workflowId,
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...metadata
  };
  
  logs.unshift(logEntry); // Add to beginning
  
  // Keep only last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS);
  }
  
  // Also log to console for Vercel logs
  const emoji = {
    success: '✅',
    processing: '⚙️',
    search: '🔍',
    upload: '📤',
    trigger: '🚀',
    error: '❌',
    clip: '✂️',
    transcribe: '📝',
    complete: '🎉'
  }[type] || '📋';
  
  console.log(`${emoji} ${message}`);
  
  return logEntry;
}

/**
 * Get logs
 * @param {object} options - Filter options
 * @returns {Array} Array of log entries
 */
export function getLogs(options = {}) {
  let filteredLogs = [...logs];
  
  // Filter by workflow ID if provided
  if (options.workflowId) {
    filteredLogs = filteredLogs.filter(log => log.workflowId === options.workflowId);
  }
  
  // Filter by type if provided
  if (options.type) {
    filteredLogs = filteredLogs.filter(log => log.type === options.type);
  }
  
  // Limit results
  const limit = options.limit || 100;
  filteredLogs = filteredLogs.slice(0, limit);
  
  return filteredLogs;
}

/**
 * Clear logs
 */
export function clearLogs() {
  logs.length = 0;
}

/**
 * Get logs for a specific workflow
 * @param {string} workflowId - Workflow ID
 * @returns {Array} Array of log entries
 */
export function getWorkflowLogs(workflowId) {
  return logs.filter(log => log.workflowId === workflowId);
}

export default {
  addLog,
  getLogs,
  clearLogs,
  getWorkflowLogs
};

