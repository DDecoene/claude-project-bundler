#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import { Bundler } from '../lib/bundler.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

program
  .name('cpb')
  .description('Create project knowledge bundles for Claude AI assistant')
  .version(packageJson.version)
  .argument('[directory]', 'project directory to bundle', '.')
  .option('-o, --output <path>', 'output directory', './out')
  .option('-f, --filename <name>', 'output filename', 'project_bundle.txt')
  .option('--config <path>', 'path to config file')
  .action(async (directory, options) => {
    try {
      // Resolve paths
      const projectPath = resolve(directory);
      
      console.log(chalk.blue('Creating Claude Project Bundle...'));
      console.log(chalk.gray(`Directory: ${projectPath}`));
      
      if (options.config) {
        console.log(chalk.gray(`Config: ${options.config}`));
      }
      
      // Initialize bundler with options
      const bundler = new Bundler(projectPath, {
        configPath: options.config,
        output: {
          directory: options.output,
          filename: options.filename
        }
      });
      
      // Create the bundle
      const result = await bundler.bundle();
      
      // Success output
      console.log(chalk.green('\n✨ Bundle created successfully!'));
      console.log(chalk.gray(`Location: ${result.outputPath}`));
      console.log(chalk.gray('Stats:'));
      Object.entries(result.stats.fileTypes).forEach(([type, count]) => {
        console.log(chalk.gray(`  ${type}: ${count} files`));
      });
      
    } catch (error) {
      console.error(chalk.red('Error creating bundle:'), error.message);
      process.exit(1);
    }
  });

program.parse();