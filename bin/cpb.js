#!/usr/bin/env node

// Load environment variables first, before any other imports
import '../lib/env.js';

import { program } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import { Bundler } from '../lib/bundler.js';
import { defaultConfig } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ROOT_DIR } from '../lib/env.js';

// Get package.json for version info
const packageJson = JSON.parse(
  readFileSync(join(ROOT_DIR, 'package.json'), 'utf8')
);

// Debug environment settings if enabled
if (process.env.CPB_DEBUG === 'true') {
  logger.debug('Environment Settings:');
  logger.debug('CPB_DEBUG:', process.env.CPB_DEBUG);
  logger.debug('CPB_LOG_LEVEL:', process.env.CPB_LOG_LEVEL);
  logger.debug('CPB_NO_COLOR:', process.env.CPB_NO_COLOR);
  logger.debug('Project Root:', ROOT_DIR);
}

program
  .name('cpb')
  .description('Create project knowledge bundles for Claude AI assistant')
  .version(packageJson.version);

// Default command (bundle)
program
  .command('bundle', { isDefault: true })
  .description('create a project bundle')
  .argument('[directory]', 'project directory to bundle', '.')
  .option('-o, --output <path>', 'output directory', './out')
  .option('-f, --filename <name>', 'output filename', 'project_bundle.txt')
  .option('--config <path>', 'path to config file')
  .option('--no-timestamp', 'disable timestamp in filename')
  .action(async (directory, options) => {
    try {
      const projectPath = resolve(directory);
      
      // Log initial settings
      logger.info('Creating Claude Project Bundle...');
      logger.debug(`Directory: ${projectPath}`);
      logger.debug(`Output: ${options.output}`);
      logger.debug(`Filename: ${options.filename}`);
      if (options.config) {
        logger.debug(`Config: ${options.config}`);
      }
      logger.debug(`Timestamp enabled: ${options.timestamp !== false}`);
      
      const bundler = new Bundler(projectPath, {
        configPath: options.config,
        output: {
          directory: options.output,
          filename: options.filename,
          timestamped: options.timestamp !== false
        }
      });
      
      const result = await bundler.bundle();
      
      // Success and stats messages that are always shown
      logger.success('\n✨ Bundle created successfully!');
      logger.stats(`\nLocation: ${result.outputPath}\n`);
      logger.stats('\nStats:');
      Object.entries(result.stats.fileTypes).forEach(([type, count]) => {
        logger.stats(`  ${type}: ${count} files`);
      });
      
    } catch (error) {
      logger.error('\nError creating bundle:', error.message);
      process.exit(1);
    }
  });

// Init command for creating config file
program
  .command('init')
  .description('create a default configuration file')
  .argument('[directory]', 'target directory', '.')
  .option('-f, --force', 'force overwrite if config exists')
  .action((directory, options) => {
    try {
      const targetPath = resolve(directory);
      const configPath = join(targetPath, 'cpb.config.json');
      
      logger.info('Creating default configuration file...');
      logger.debug(`Target directory: ${targetPath}`);
      
      // Check if file exists and --force not used
      if (!options.force && existsSync(configPath)) {
        logger.error('Configuration file already exists. Use --force to overwrite.');
        process.exit(1);
      }
      
      // Write default config
      writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
      
      // Success messages that are always shown
      logger.success('\n✨ Configuration file created successfully!');
      logger.stats(`\nLocation: ${configPath}\n`);
      
    } catch (error) {
      logger.error('\nError creating configuration:', error.message);
      process.exit(1);
    }
  });

program.parse();