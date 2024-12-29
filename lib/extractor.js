// lib/extractor.js
import { XMLParser } from 'fast-xml-parser';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { logger } from './logger.js';

export class Extractor {
  constructor(bundlePath, outputDir = './extracted') {
    this.bundlePath = resolve(bundlePath);
    this.outputDir = resolve(outputDir);
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '_text'
    });
  }

  extract() {
    try {
      logger.info('\nStarting Extraction Process:');
      logger.info(`Bundle: ${this.bundlePath}`);
      logger.info(`Output: ${this.outputDir}`);

      // Read and parse the bundle
      const bundleContent = readFileSync(this.bundlePath, 'utf8');
      const bundle = this.parser.parse(bundleContent);

      if (!bundle.bundle || !bundle.bundle.files || !bundle.bundle.files.file) {
        throw new Error('Invalid bundle format');
      }

      // Create output directory
      mkdirSync(this.outputDir, { recursive: true });

      // Extract files
      const files = Array.isArray(bundle.bundle.files.file) 
        ? bundle.bundle.files.file 
        : [bundle.bundle.files.file];

      const stats = {
        totalFiles: files.length,
        successful: 0,
        failed: 0,
        fileTypes: {}
      };

      for (const file of files) {
        try {
          this.extractFile(file);
          stats.successful++;
          stats.fileTypes[file.type] = (stats.fileTypes[file.type] || 0) + 1;
        } catch (error) {
          stats.failed++;
          logger.error(`Failed to extract ${file.path}: ${error.message}`);
        }
      }

      return {
        success: stats.failed === 0,
        stats
      };
    } catch (error) {
      logger.error('\nExtraction failed:', error.message);
      throw error;
    }
  }

  extractFile(file) {
    const { path: filePath, content } = file;
    const fullPath = join(this.outputDir, filePath);
    
    // Create directory structure
    mkdirSync(dirname(fullPath), { recursive: true });

    // Write file content
    const fileContent = content._text || content;
    writeFileSync(fullPath, fileContent, 'utf8');
    logger.debug(`Extracted: ${filePath}`);
  }
}