// test/extractor.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Extractor } from '../lib/extractor.js';
import { join } from 'path';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Extractor', async () => {
  const testDir = join(__dirname, 'test-extract');
  const bundlePath = join(testDir, 'test-bundle.txt');
  const outputDir = join(testDir, 'output');

  const createValidBundle = () => {
    const bundle = `<?xml version="1.0" encoding="UTF-8"?>
<bundle>
  <metadata>
    <created>2025-01-05T12:00:00.000Z</created>
    <projectPath>/test/project</projectPath>
  </metadata>
  <files>
    <file path="src/index.js" type="code">
      <content>console.log("Hello World");</content>
    </file>
    <file path="README.md" type="docs">
      <content># Test Project</content>
    </file>
  </files>
</bundle>`;
    
    mkdirSync(dirname(bundlePath), { recursive: true });
    writeFileSync(bundlePath, bundle, 'utf8');
    return bundle;
  };

  test.beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  test.afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  test('extracts files correctly', () => {
    createValidBundle();
    const extractor = new Extractor(bundlePath, outputDir);
    const result = extractor.extract();

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.stats.totalFiles, 2);
    assert.strictEqual(result.stats.successful, 2);
    
    // Verify file contents
    const jsContent = readFileSync(join(outputDir, 'src/index.js'), 'utf8');
    const mdContent = readFileSync(join(outputDir, 'README.md'), 'utf8');
    
    assert.strictEqual(jsContent, 'console.log("Hello World");');
    assert.strictEqual(mdContent, '# Test Project');
  });

  test('handles empty bundle gracefully', () => {
    const emptyBundle = `<?xml version="1.0" encoding="UTF-8"?>
<bundle>
  <metadata>
    <created>2025-01-05T12:00:00.000Z</created>
  </metadata>
  <files>
  </files>
</bundle>`;
    
    writeFileSync(bundlePath, emptyBundle, 'utf8');
    
    const extractor = new Extractor(bundlePath, outputDir);
    const result = extractor.extract();

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.stats, {
      totalFiles: 0,
      successful: 0,
      failed: 0,
      fileTypes: {}
    });
  });

  test('handles invalid file paths gracefully', () => {
    const bundle = `<?xml version="1.0" encoding="UTF-8"?>
<bundle>
  <metadata>
    <created>2025-01-05T12:00:00.000Z</created>
  </metadata>
  <files>
    <file path="invalid/*/test.js" type="code">
      <content>test</content>
    </file>
    <file path="valid/test.txt" type="text">
      <content>valid file</content>
    </file>
  </files>
</bundle>`;
    
    writeFileSync(bundlePath, bundle, 'utf8');
    
    const extractor = new Extractor(bundlePath, outputDir);
    const result = extractor.extract();

    assert.strictEqual(result.stats.totalFiles, 2);
    assert.strictEqual(result.stats.failed, 1);
    assert.strictEqual(result.stats.successful, 1);
    assert.strictEqual(result.success, false);
  });

  test('respects output directory option', () => {
    createValidBundle();
    const customOutput = join(testDir, 'custom-output');
    const extractor = new Extractor(bundlePath, customOutput);
    const result = extractor.extract();

    assert.strictEqual(result.success, true);
    assert.ok(readFileSync(join(customOutput, 'src/index.js'), 'utf8'));
  });
});