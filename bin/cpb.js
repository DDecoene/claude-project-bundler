#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import { Bundler } from '../lib/bundler.js';
import { defaultConfig } from '../lib/config.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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
      console.log(chalk.blue('Creating Claude Project Bundle...'));
      console.log(chalk.gray(`Directory: ${projectPath}`));
      console.log(chalk.gray(`Output: ${options.output}`));
      console.log(chalk.gray(`Filename: ${options.filename}`));
      if (options.config) {
        console.log(chalk.gray(`Config: ${options.config}`));
      }
      console.log(chalk.gray(`Timestamp enabled: ${options.timestamp !== false}`));
      
      const bundler = new Bundler(projectPath, {
        configPath: options.config,
        output: {
          directory: options.output,
          filename: options.filename,
          timestamped: options.timestamp !== false
        }
      });
      
      const result = await bundler.bundle();
      
      // Log success and stats
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
      
      console.log(chalk.blue('Creating default configuration file...'));
      console.log(chalk.gray(`Target directory: ${targetPath}`));
      
      // Check if file exists and --force not used
      if (!options.force && existsSync(configPath)) {
        console.error(chalk.red('Configuration file already exists. Use --force to overwrite.'));
        process.exit(1);
      }
      
      // Write default config
      writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
      
      console.log(chalk.green('\n✨ Configuration file created successfully!'));
      console.log(chalk.gray(`Location: ${configPath}`));
      
    } catch (error) {
      console.error(chalk.red('Error creating configuration:'), error.message);
      process.exit(1);
    }
  });

program.parse();