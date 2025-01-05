// test/cli.test.js
import { test, describe } from "node:test";
import assert from "node:assert";
import { join } from "path";
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("CLI", async () => {
  const testDir = join(__dirname, "test-cli");
  const binPath = join(__dirname, "..", "bin", "cpb.js");

  test.beforeEach(() => {
    // Reset test state
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });

    // Create test files
    writeFileSync(join(testDir, "test.js"), 'console.log("test");');
    writeFileSync(join(testDir, "README.md"), "# Test");
  });

  test.afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  async function runCommand(args) {
    try {
      const { stdout, stderr } = await execAsync(`node ${binPath} ${args}`);
      return { stdout, stderr, code: 0 };
    } catch (error) {
      return {
        stdout: error.stdout,
        stderr: error.stderr,
        code: error.code,
      };
    }
  }

  test("displays help information", async () => {
    const { stdout } = await runCommand("--help");
    assert.ok(stdout.includes("Options:"));
    assert.ok(stdout.includes("--version"));
    assert.ok(stdout.includes("--help"));
  });

  test("displays version number", async () => {
    const { stdout } = await runCommand("--version");
    const version = JSON.parse(
      readFileSync(join(__dirname, "..", "package.json")),
    ).version;
    assert.ok(stdout.includes(version));
  });

  test("creates bundle with default options", async () => {
    const { stdout, code } = await runCommand(`bundle ${testDir}`);
    assert.strictEqual(code, 0);
    assert.ok(stdout.includes("Bundle created successfully"));
    assert.ok(stdout.includes("Stats:"));
  });

  test("creates bundle with custom output", async () => {
    const customDir = join(testDir, "custom");
    const { stdout, code } = await runCommand(
      `bundle ${testDir} -o ${customDir} -f custom.txt`,
    );
    assert.strictEqual(code, 0);
    assert.ok(stdout.includes("Location:"));

    // Get the created bundle path
    const bundlePath = stdout
      .split("\n")
      .find((line) => line.includes("Location:"))
      ?.split("Location:")[1]
      ?.trim();

    assert.ok(bundlePath);
    assert.ok(bundlePath.includes("custom"));
  });

  test("handles init command", async () => {
    const { stdout, code } = await runCommand(`init ${testDir}`);
    assert.strictEqual(code, 0);
    assert.ok(stdout.includes("Configuration file created"));

    // Verify config file was created
    const configPath = join(testDir, "cpb.config.json");
    assert.ok(existsSync(configPath), "Config file should exist");
  });

  test("handles nonexistent directory error", async () => {
    const { stderr, code } = await runCommand("bundle /nonexistent");
    assert.notStrictEqual(code, 0);
    assert.ok(stderr.includes("Error"));
  });

  test("handles extract command", async () => {
    // First create a bundle
    const { stdout: bundleOutput, code: bundleCode } = await runCommand(
      `bundle ${testDir}`,
    );
    assert.strictEqual(bundleCode, 0);

    // Extract bundle path from output
    const bundlePath = bundleOutput
      .split("\n")
      .find((line) => line.includes("Location:"))
      ?.split("Location:")[1]
      ?.trim();

    assert.ok(bundlePath, "Bundle should be created");
    assert.ok(existsSync(bundlePath), "Bundle file should exist");

    // Test extraction
    const extractDir = join(testDir, "extracted");
    const { stdout: extractOutput, code: extractCode } = await runCommand(
      `extract ${bundlePath} -o ${extractDir}`,
    );

    assert.strictEqual(extractCode, 0);
    assert.ok(extractOutput.includes("extracted successfully"));
  });
});
