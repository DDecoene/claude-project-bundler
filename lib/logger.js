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

    // Initialize settings
    this.updateSettings();
    this.isSilent = false;
  }

  updateSettings() {
    // Parse environment variables with explicit boolean conversion
    this.debugEnabled = process.env.CPB_DEBUG === 'true';
    this.logLevel = process.env.CPB_LOG_LEVEL || 'error';
    this.noColor = process.env.CPB_NO_COLOR === 'true';
    
    // Validate log level and default to error if invalid
    if (!this.levels.hasOwnProperty(this.logLevel)) {
      this.logLevel = 'error';
    }

    // Configure chalk color level
    chalk.level = this.noColor ? 0 : 3;
  }

  // Method to temporarily silence the logger
  silence() {
    this.isSilent = true;
  }

  // Method to restore normal logging
  unsilence() {
    this.isSilent = false;
  }

  shouldLog(level) {
    if (this.isSilent) return false;
    if (level === 'debug' && this.debugEnabled) return true;
    return this.levels[level] >= this.levels[this.logLevel];
  }

  format(type, color, args) {
    const prefix = this.noColor ? `[${type}]` : color(`[${type}]`);
    return [prefix, ...args].join(' ');
  }

  debug(...args) {
    if (this.shouldLog('debug')) {
      console.log(this.format('DEBUG', chalk.gray, args));
    }
  }

  info(...args) {
    if (this.shouldLog('info')) {
      console.log(this.format('INFO', chalk.blue, args));
    }
  }

  warn(...args) {
    if (this.shouldLog('warn')) {
      console.warn(this.format('WARN', chalk.yellow, args));
    }
  }

  error(...args) {
    if (this.shouldLog('error')) {
      console.error(this.format('ERROR', chalk.red, args));
    }
  }

  success(...args) {
    // Success messages are shown unless logger is silenced
    if (!this.isSilent) {
      console.log(this.format('SUCCESS', chalk.green, args));
    }
  }

  stats(...args) {
    // Stats are shown unless logger is silenced
    if (!this.isSilent) {
      console.log(...args);
    }
  }
}

// Create and export a singleton instance
export const logger = new Logger();