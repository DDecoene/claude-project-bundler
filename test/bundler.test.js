// test/bundler.test.js
import { test, describe } from "node:test";
import assert from "node:assert";
import { Bundler } from "../lib/bundler.js";
import { join } from "path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Bundler", async () => {
  // Setup test directory and files
  const testDir = join(__dirname, "test-project");
  const outputDir = join(testDir, "out");

  // Create test files and directories before each test
  test.beforeEach(() => {
    // Create test project structure
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, "src"), { recursive: true });
    mkdirSync(join(testDir, "docs"), { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    // Create test files
    writeFileSync(join(testDir, "README.md"), "# Test Project");
    writeFileSync(join(testDir, "src", "index.js"), 'console.log("Hello");');
    writeFileSync(join(testDir, "docs", "api.md"), "# API Documentation");
    writeFileSync(join(testDir, ".env"), "SECRET=test");
  });

  // Cleanup test directory after each test
  test.afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  test("creates correct metadata", () => {
    const bundler = new Bundler(testDir);
    const metadata = bundler.createMetadata();

    assert.ok(metadata.created);
    assert.strictEqual(metadata.projectPath, testDir);
    assert.ok(metadata.config);
  });

  test("generates correct glob patterns", () => {
    const bundler = new Bundler(testDir);
    const patterns = bundler.createGlobPatterns();

    // Check if common extensions are included
    assert.ok(patterns.includes("**/*.js"));
    assert.ok(patterns.includes("**/*.md"));
    assert.ok(patterns.includes("**/*.json"));
  });

  test("creates correct ignore patterns", () => {
    const bundler = new Bundler(testDir);
    const patterns = bundler.createIgnorePatterns();

    // Check if common exclusions are included
    assert.ok(patterns.includes("**/node_modules/**"));
    assert.ok(patterns.includes(".env"));
    assert.ok(patterns.includes("**/dist/**"));
  });

  test("detects file types correctly", () => {
    const bundler = new Bundler(testDir);

    assert.strictEqual(bundler.getFileType("test.js"), "code");
    assert.strictEqual(bundler.getFileType("doc.md"), "docs");
    assert.strictEqual(bundler.getFileType("package.json"), "config");
    assert.strictEqual(bundler.getFileType("docs/data.json"), "docs");
    assert.strictEqual(bundler.getFileType("unknown.xyz"), "text");
  });

  test("identifies binary files correctly", () => {
    const bundler = new Bundler(testDir);

    assert.strictEqual(bundler.isBinaryFile("image.png"), true);
    assert.strictEqual(bundler.isBinaryFile("image.jpg"), true);
    assert.strictEqual(bundler.isBinaryFile("document.pdf"), true);
    assert.strictEqual(bundler.isBinaryFile("script.js"), false);
  });

  test("generates valid XML output", async () => {
    const bundler = new Bundler(testDir, {
      output: {
        directory: outputDir,
        filename: "test-bundle.txt",
        timestamped: false,
      },
    });

    const result = await bundler.bundle();

    assert.ok(result.success);
    assert.ok(result.outputPath);
    assert.ok(result.stats.totalFiles > 0);

    // Read and validate the generated XML
    const outputContent = readFileSync(result.outputPath, "utf8");

    assert.ok(outputContent.startsWith("<?xml"));
    assert.ok(outputContent.includes("<bundle>"));
    assert.ok(outputContent.includes("</bundle>"));
    assert.ok(outputContent.includes("<metadata>"));
    assert.ok(outputContent.includes("<files>"));
  });

  test("escapes XML special characters", () => {
    const bundler = new Bundler(testDir);

    const testString = '<script>alert("test");</script>';
    const escaped = bundler.minimalEscape(testString);

    assert.ok(!escaped.includes("<script>"));
    assert.ok(escaped.includes("&lt;script&gt;"));
  });

  test("handles custom output directory", async () => {
    const customOutput = join(testDir, "custom-output");
    const bundler = new Bundler(testDir, {
      output: {
        directory: customOutput,
      },
    });

    const result = await bundler.bundle();
    assert.ok(result.outputPath.startsWith(customOutput));
  });

  test("respects file exclusions", async () => {
    // Create node_modules directory and a file that should be excluded
    const nodeModulesDir = join(testDir, "node_modules");
    mkdirSync(nodeModulesDir, { recursive: true });
    writeFileSync(join(nodeModulesDir, "test.js"), "test");

    const bundler = new Bundler(testDir);
    const files = await bundler.collectFiles();

    // Check if excluded files are not included
    const hasNodeModules = files.some((f) => f.path.includes("node_modules"));
    const hasEnvFile = files.some((f) => f.path.includes(".env"));

    assert.strictEqual(hasNodeModules, false);
    assert.strictEqual(hasEnvFile, false);
  });

  test("generates correct stats", async () => {
    const bundler = new Bundler(testDir);
    const result = await bundler.bundle();

    assert.ok(result.stats.totalFiles > 0);
    assert.ok(typeof result.stats.fileTypes === "object");
    assert.ok(result.stats.fileTypes.code !== undefined);
    assert.ok(result.stats.fileTypes.docs !== undefined);
  });
});
