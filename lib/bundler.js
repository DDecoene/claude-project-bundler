import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative, dirname } from 'path';
import { glob } from 'glob';
import { loadConfig } from './config.js';

export class Bundler {
  constructor(projectPath, options = {}) {
    this.projectPath = projectPath;
    this.options = options;
    // Load and merge configuration
    this.config = loadConfig(projectPath, options.config);
  }

  async bundle() {
    try {
      // Initialize bundle structure
      const bundle = {
        metadata: this.createMetadata(),
        files: await this.collectFiles(),
        summary: {}
      };

      // Process collected files
      await this.processFiles(bundle);

      // Generate final output
      const output = this.generateOutput(bundle);

      // Save the bundle
      this.saveBundle(output);

      return {
        success: true,
        outputPath: this.getOutputPath(),
        stats: this.generateStats(bundle)
      };
    } catch (error) {
      throw new Error(`Bundling failed: ${error.message}`);
    }
  }

  createMetadata() {
    return {
      created: new Date().toISOString(),
      projectPath: this.projectPath,
      config: this.config
    };
  }

  async collectFiles() {
    // Create glob patterns from configuration
    const patterns = this.createGlobPatterns();
    const ignorePatterns = this.createIgnorePatterns();

    // Collect all matching files
    const files = await glob(patterns, {
      cwd: this.projectPath,
      ignore: ignorePatterns,
      dot: true
    });

    return files.map(file => ({
      path: file,
      fullPath: join(this.projectPath, file)
    }));
  }

  async processFiles(bundle) {
    for (const file of bundle.files) {
      try {
        const content = readFileSync(file.fullPath);
        const fileInfo = this.processFile(file.path, content);
        file.type = fileInfo.type;
        file.content = fileInfo.content;
      } catch (error) {
        console.warn(`Warning: Could not process ${file.path}: ${error.message}`);
      }
    }
  }

  processFile(filepath, content) {
    // Determine file type and process accordingly
    if (this.isBinaryFile(filepath)) {
      return {
        type: 'binary',
        content: '[Binary file]'
      };
    }

    return {
      type: this.getFileType(filepath),
      content: content.toString('utf8')
    };
  }

  generateOutput(bundle) {
    // Create XML structure
    const output = ['<?xml version="1.0" encoding="UTF-8"?>'];
    output.push('<bundle>');

    // Add metadata
    output.push('<metadata>');
    output.push(this.objectToXML(bundle.metadata));
    output.push('</metadata>');

    // Add files
    output.push('<files>');
    for (const file of bundle.files) {
      output.push(`  <file path="${file.path}" type="${file.type}">`);
      output.push(`    <content>${this.escapeXML(file.content)}</content>`);
      output.push('  </file>');
    }
    output.push('</files>');

    output.push('</bundle>');
    return output.join('\n');
  }

  saveBundle(content) {
    const outputPath = this.getOutputPath();
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, content, 'utf8');
  }

  // Utility methods
  getOutputPath() {
    const { directory, filename } = this.config.output;
    return join(this.projectPath, directory, filename);
  }

  isBinaryFile(filepath) {
    const ext = filepath.split('.').pop().toLowerCase();
    return this.config.files.binary.extensions.includes(`.${ext}`);
  }

  getFileType(filepath) {
    const ext = `.${filepath.split('.').pop().toLowerCase()}`;
    const { include } = this.config.files;

    if (include.code.includes(ext)) return 'code';
    if (include.docs.includes(ext)) return 'docs';
    if (include.text.includes(ext)) return 'text';
    return 'other';
  }

  generateStats(bundle) {
    return {
      totalFiles: bundle.files.length,
      fileTypes: bundle.files.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  objectToXML(obj, indent = '') {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
          return `${indent}<${key}>\n${this.objectToXML(value, indent + '  ')}${indent}</${key}>`;
        }
        return `${indent}<${key}>${this.escapeXML(String(value))}</${key}>`;
      })
      .join('\n');
  }
}