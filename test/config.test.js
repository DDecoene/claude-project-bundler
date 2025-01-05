// test/config.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { loadConfig, defaultConfig } from '../lib/config.js';
import { join } from 'path';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Config Loading', async () => {
  // Setup temporary test directory
  const tempDir = join(__dirname, 'temp');
  
  // Setup: Create temp directory before tests
  mkdirSync(tempDir, { recursive: true });
  
  // Cleanup: Remove temp directory after tests
  test.after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('returns default config when no config file exists', () => {
    const config = loadConfig(tempDir);
    assert.deepStrictEqual(config, defaultConfig);
  });

  test('loads and merges user config correctly', () => {
    const userConfig = {
      output: {
        directory: './custom-output',
        filename: 'custom-bundle.txt'
      }
    };

    const configPath = join(tempDir, 'cpb.config.json');
    writeFileSync(configPath, JSON.stringify(userConfig));

    const config = loadConfig(tempDir, configPath);

    // Check if user config is merged correctly
    assert.strictEqual(config.output.directory, './custom-output');
    assert.strictEqual(config.output.filename, 'custom-bundle.txt');
    
    // Check if default values are preserved
    assert.strictEqual(config.output.timestamped, defaultConfig.output.timestamped);
    assert.deepStrictEqual(config.files.include, defaultConfig.files.include);
  });

  test('handles invalid config file gracefully', () => {
    const configPath = join(tempDir, 'invalid.config.json');
    writeFileSync(configPath, 'invalid json content');

    const config = loadConfig(tempDir, configPath);
    assert.deepStrictEqual(config, defaultConfig);
  });

  test('merges arrays in config correctly', () => {
    const userConfig = {
      files: {
        exclude: {
          directories: ['custom-dir'],
          files: ['.custom-file']
        }
      }
    };

    const configPath = join(tempDir, 'cpb.config.json');
    writeFileSync(configPath, JSON.stringify(userConfig));

    const config = loadConfig(tempDir, configPath);

    // Check if arrays are merged correctly
    assert.ok(config.files.exclude.directories.includes('custom-dir'));
    assert.ok(config.files.exclude.directories.includes('node_modules')); // from default config
    assert.ok(config.files.exclude.files.includes('.custom-file'));
    assert.ok(config.files.exclude.files.includes('.env')); // from default config
  });
});