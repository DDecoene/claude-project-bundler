// lib/env.js
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import dotenv from 'dotenv';

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Try to load .env file, but don't fail if it doesn't exist
dotenv.config({ 
  path: join(projectRoot, '.env'),
  // Don't throw error if .env is missing
  silent: true 
});

// Set default environment values if not set
if (!process.env.CPB_DEBUG) {
  process.env.CPB_DEBUG = 'false';
}

if (!process.env.CPB_LOG_LEVEL) {
  process.env.CPB_LOG_LEVEL = 'error';
}

if (!process.env.CPB_NO_COLOR) {
  process.env.CPB_NO_COLOR = 'false';
}

// Export project root for reuse
export const ROOT_DIR = projectRoot;