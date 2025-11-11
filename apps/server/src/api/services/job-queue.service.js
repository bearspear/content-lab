/**
 * Job Queue Service Alias
 *
 * Re-exports the batch job queue singleton for backward compatibility
 */

const { getInstance } = require('./batch-job-queue.service');

// Export the singleton instance directly
module.exports = getInstance();
