/**
 * Puppeteer Configuration
 *
 * Configuration for Puppeteer browser instance used in web capture
 */

module.exports = {
  headless: process.env.PUPPETEER_HEADLESS !== 'false',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ],
  defaultViewport: {
    width: 1920,
    height: 1080
  },
  timeout: parseInt(process.env.PUPPETEER_TIMEOUT) || 120000
};
