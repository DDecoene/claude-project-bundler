// lib/logger.js
import chalk from 'chalk';

class Logger {
  constructor() {
    // Log levels hierarchy
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    // Set defaults that work without .env
    this.debugEnabled = process.env.CPB_DEBUG === 'true';
    this.logLevel = process.env.CPB_LOG_LEVEL || 'error';  // Default to error-only
    this.noColor = process.env.CPB_NO_COLOR === 'true';
    
    // Validate log level and default to error if invalid
    if (!this.levels.hasOwnProperty(this.logLevel)) {
      this.logLevel = 'error';
    }

    // Disable chalk colors if requested
    if (this.noColor) {
      chalk.level = 0;
    }
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  debug(...args) {
    if (this.debugEnabled || this.shouldLog('debug')) {
      console.log(chalk.gray('[DEBUG]'), ...args);
    }
  }

  info(...args) {
    if (this.shouldLog('info')) {
      console.log(chalk.blue('[INFO]'), ...args);
    }
  }

  warn(...args) {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow('[WARN]'), ...args);
    }
  }

  error(...args) {
    if (this.shouldLog('error')) {
      console.error(chalk.red('[ERROR]'), ...args);
    }
  }

  // New method for success messages that are always shown
  success(...args) {
    console.log(chalk.green(...args));
  }

  // New method for stats that are always shown
  stats(...args) {
    console.log(...args);
  }
}

// Create and export a singleton instance
export const logger = new Logger();