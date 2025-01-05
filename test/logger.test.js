// test/logger.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { logger } from '../lib/logger.js';

describe('Logger', async () => {
  // Store original console methods and env variables
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalEnv = { ...process.env };
  
  // Setup: Capture console output
  let consoleOutput;
  
  test.beforeEach(() => {
    // Reset console output
    consoleOutput = [];
    
    // Reset environment variables to known state
    delete process.env.CPB_DEBUG;
    delete process.env.CPB_LOG_LEVEL;
    delete process.env.CPB_NO_COLOR;
    
    // Mock console methods
    console.log = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    console.warn = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    console.error = (...args) => {
      consoleOutput.push(args.join(' '));
    };
    
    // Update logger settings for clean state
    logger.updateSettings();
  });

  // Cleanup: Restore console methods and env variables
  test.afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    process.env = { ...originalEnv };
  });

  test('respects debug flag', () => {
    // Debug disabled by default
    logger.debug('test message');
    assert.strictEqual(consoleOutput.length, 0);

    // Enable debug and update settings
    process.env.CPB_DEBUG = 'true';
    logger.updateSettings();
    
    logger.debug('test message');
    assert.strictEqual(consoleOutput.length, 1);
    assert.ok(consoleOutput[0].includes('test message'));
  });

  test('respects log level hierarchy', () => {
    process.env.CPB_LOG_LEVEL = 'warn';
    logger.updateSettings();
    
    // Info should not be logged
    logger.info('info message');
    assert.strictEqual(consoleOutput.length, 0);
    
    // Warning should be logged
    logger.warn('warning message');
    assert.strictEqual(consoleOutput.length, 1);
    assert.ok(consoleOutput[0].includes('warning message'));
    
    // Error should be logged
    logger.error('error message');
    assert.strictEqual(consoleOutput.length, 2);
    assert.ok(consoleOutput[1].includes('error message'));
  });

  test('always shows success messages regardless of log level', () => {
    process.env.CPB_LOG_LEVEL = 'error';
    logger.updateSettings();
    
    logger.success('success message');
    assert.strictEqual(consoleOutput.length, 1);
    assert.ok(consoleOutput[0].includes('success message'));
  });

  test('always shows stats messages regardless of log level', () => {
    process.env.CPB_LOG_LEVEL = 'error';
    logger.updateSettings();
    
    logger.stats('stats message');
    assert.strictEqual(consoleOutput.length, 1);
    assert.ok(consoleOutput[0].includes('stats message'));
  });

  test('handles invalid log level gracefully', () => {
    process.env.CPB_LOG_LEVEL = 'invalid';
    logger.updateSettings();
    
    // Should default to error level
    logger.info('info message');
    logger.warn('warning message');
    logger.error('error message');
    
    assert.strictEqual(consoleOutput.length, 1);
    assert.ok(consoleOutput[0].includes('error message'));
  });

  test('respects no-color flag', () => {
    process.env.CPB_NO_COLOR = 'true';
    logger.updateSettings();
    
    logger.error('test message');
    const containsAnsiCodes = consoleOutput[0].includes('\x1b[');
    assert.strictEqual(containsAnsiCodes, false);
  });
});