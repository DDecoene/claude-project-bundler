import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, relative, dirname, resolve, normalize } from "path";
import { glob } from "glob";
import { loadConfig } from "./config.js";
import { logger } from "./logger.js";

export class Bundler {
  constructor(projectPath, options = {}) {
    // Normalize and store the project path to ensure consistent path handling
    this.projectPath = normalize(projectPath);
    this.options = options;
    this.config = loadConfig(projectPath, options.configPath);

    // Determine output directory with proper precedence:
    // 1. Command line options (options.output.directory)
    // 2. Config file setting (this.config.output.directory)
    // 3. Default value from defaultConfig ('./out')
    const outputDir = options.output?.directory || this.config.output.directory;

    // Resolve the output directory path, handling both absolute and relative paths
    this.outputDir = normalize(resolve(this.projectPath, outputDir));

    // Store the relative path from project to output directory for glob patterns
    // Convert backslashes to forward slashes for consistent glob pattern matching
    this.relativeOutputDir = relative(this.projectPath, this.outputDir)
      .split("\\")
      .join("/");

    // Log path resolution for debugging
    logger.info("\nPath Resolution:");
    logger.info("Project Path:", this.projectPath);
    logger.info("Output Dir (absolute):", this.outputDir);
    logger.info("Output Dir (relative):", this.relativeOutputDir);
  }

  createMetadata() {
    const metadata = {
      created: new Date().toISOString(),
      projectPath: this.projectPath,
      config: this.config,
    };
    logger.debug("\nCreated Metadata:", JSON.stringify(metadata, null, 2));
    return metadata;
  }

  createGlobPatterns() {
    // Create patterns to match all configured file extensions
    const extensions = [...Object.values(this.config.files.include).flat()];
    const patterns = extensions.map((ext) => `**/*${ext}`);

    logger.debug("\nGlob Patterns:", patterns);
    return patterns;
  }

  createIgnorePatterns() {
    const { exclude } = this.config.files;

    // Create comprehensive patterns to exclude the output directory
    // We need multiple patterns to handle different path representations
    const outputPatterns = [
      // Match the exact output directory
      this.relativeOutputDir,
      // Match all files within the output directory
      `${this.relativeOutputDir}/**`,
      // Handle cases where path starts with ./
      `./${this.relativeOutputDir}`,
      `./${this.relativeOutputDir}/**`,
      // Include absolute path patterns for thoroughness
      this.outputDir,
      `${this.outputDir}/**`,
    ];

    // Combine all ignore patterns
    const ignorePatterns = [
      // Output directory patterns
      ...outputPatterns,
      // Directory exclusion patterns from config
      ...exclude.directories.map((dir) => {
        const pattern = dir.startsWith("/") ? dir.slice(1) : dir;
        return `**/${pattern}/**`;
      }),
      // Specific files to exclude
      ...exclude.files,
      // Custom patterns from config
      ...exclude.patterns.map((pattern) => {
        return pattern.includes("/") ? pattern : `**/${pattern}`;
      }),
    ].filter(Boolean); // Remove any empty patterns

    // Log patterns for debugging
    logger.debug("\nIgnore Patterns:");
    logger.debug("Output-specific patterns:");
    outputPatterns.forEach((pattern) => logger.debug(`  - ${pattern}`));
    logger.debug("All patterns:", JSON.stringify(ignorePatterns, null, 2));

    return ignorePatterns;
  }

  async collectFiles() {
    const patterns = this.createGlobPatterns();
    const ignorePatterns = this.createIgnorePatterns();

    logger.info("\nFile Collection:");
    logger.info("Working Directory:", this.projectPath);

    const globOptions = {
      cwd: this.projectPath,
      ignore: ignorePatterns,
      dot: true,
      nodir: true,
      absolute: false,
      followSymbolicLinks: false,
    };

    // Check output directory existence before glob operation
    logger.debug("Output directory status:");
    logger.debug(`- Path: ${this.outputDir}`);
    logger.debug(`- Exists: ${existsSync(this.outputDir)}`);

    const files = await glob(patterns, globOptions);

    // Validate that no output directory files were included
    const outputDirFiles = files.filter(
      (file) =>
        file.startsWith(this.relativeOutputDir) ||
        file.startsWith(`./${this.relativeOutputDir}`),
    );

    if (outputDirFiles.length > 0) {
      logger.warn(
        "\nWarning: Found files from output directory:",
        outputDirFiles,
      );
    }

    logger.info("\nFiles Found:", files.length);
    if (files.length > 0) {
      logger.debug("Sample Files:", files.slice(0, 3));
    }

    return files.map((file) => ({
      path: file,
      fullPath: join(this.projectPath, file),
    }));
  }

  async bundle() {
    try {
      logger.info("\nStarting Bundle Process:");

      const bundle = {
        metadata: this.createMetadata(),
        files: await this.collectFiles(),
        summary: {},
      };

      this.processFiles(bundle);
      const output = this.generateOutput(bundle);
      this.saveBundle(output);

      const stats = this.generateStats(bundle);
      logger.debug("\nBundle Stats:", JSON.stringify(stats, null, 2));

      return {
        success: true,
        outputPath: this.getOutputPath(),
        stats,
      };
    } catch (error) {
      logger.error("\nError Details:");
      logger.error("Message:", error.message);
      logger.error("Stack:", error.stack);
      throw error;
    }
  }

  processFiles(bundle) {
    logger.info("\nProcessing Files:");
    for (const file of bundle.files) {
      try {
        const content = readFileSync(file.fullPath);
        const fileInfo = this.processFile(file.path, content);
        file.type = fileInfo.type;
        file.content = fileInfo.content;
        logger.debug(`Processed: ${file.path} (${file.type})`);
      } catch (error) {
        logger.warn(
          `Warning: Could not process ${file.path}: ${error.message}`,
        );
      }
    }
  }

  processFile(filepath, content) {
    if (this.isBinaryFile(filepath)) {
      return {
        type: "binary",
        content: "[Binary file]",
      };
    }

    return {
      type: this.getFileType(filepath),
      content: content.toString("utf8"),
    };
  }

  generateOutput(bundle) {
    const output = ['<?xml version="1.0" encoding="UTF-8"?>'];
    output.push("<bundle>");

    output.push("<metadata>");
    output.push(this.objectToXML(bundle.metadata));
    output.push("</metadata>");

    output.push("<files>");
    for (const file of bundle.files) {
      // We only escape < and > in the path and type attributes to maintain XML structure
      const safePath = file.path.replace(/[<>]/g, "");
      const safeType = file.type.replace(/[<>]/g, "");

      output.push(`  <file path="${safePath}" type="${safeType}">`);
      // For content, we only escape < and > to maintain XML structure
      // This preserves quotes, apostrophes, and other characters as-is
      const safeContent = this.minimalEscape(file.content);
      output.push(`    <content>${safeContent}</content>`);
      output.push("  </file>");
    }
    output.push("</files>");

    output.push("</bundle>");
    return output.join("\n");
  }

  minimalEscape(str) {
    if (typeof str !== "string") return "";
    // Only escape < and > which are essential for XML structure
    // Leave all other characters as-is
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  getOutputPath() {
    let filename = this.options.output?.filename || this.config.output.filename;

    // Check if timestamping is enabled (default true unless explicitly disabled)
    const useTimestamp =
      this.options.output?.timestamped !== undefined
        ? this.options.output.timestamped
        : this.config.output.timestamped !== false;

    logger.debug("Timestamp option:", {
      optionsTimestamp: this.options.output?.timestamped,
      configTimestamp: this.config.output.timestamped,
      useTimestamp,
    });

    if (useTimestamp) {
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-") // Replace colons and dots with dashes
        .replace("T", "_") // Replace T with underscore
        .replace("Z", ""); // Remove Z suffix

      // Insert timestamp before file extension
      const parts = filename.split(".");
      const ext = parts.pop();
      filename = `${parts.join(".")}_${timestamp}.${ext}`;
    }

    return join(this.outputDir, filename);
  }

  saveBundle(content) {
    const outputPath = this.getOutputPath();
    logger.info("\nSaving bundle to:", outputPath);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, content, "utf8");
  }

  isBinaryFile(filepath) {
    const ext = "." + filepath.split(".").pop().toLowerCase();
    return this.config.files.binary.extensions.includes(ext);
  }

  getFileType(filepath) {
    const ext = "." + filepath.split(".").pop().toLowerCase();
    const filename = filepath.split("/").pop();
    const dirname = filepath.split("/").slice(0, -1).join("/");

    // Check configuration files first
    if (
      // Check if file is in config directory
      dirname.includes("config") ||
      // Check if it's a root config file
      (dirname === "" &&
        (filename.startsWith(".") || // Hidden config files (.eslintrc, .babelrc, etc)
          this.config.project.typeRules.node.includes(filename) || // package.json, etc
          filename.toLowerCase().includes("config"))) // Other config files
    ) {
      return "config";
    }

    // Check documentation files
    if (dirname.startsWith("docs") || dirname.endsWith("docs")) {
      return "docs";
    }

    // Check file extensions with type priority
    const typeOrder = ["code", "docs", "config"];
    for (const type of typeOrder) {
      if (this.config.files.include[type]?.includes(ext)) {
        return type;
      }
    }

    return "text";
  }

  generateStats(bundle) {
    return {
      totalFiles: bundle.files.length,
      fileTypes: bundle.files.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  escapeXML(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  objectToXML(obj, indent = "") {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (value === null || value === undefined) return "";

        // Handle nested objects
        if (typeof value === "object" && !Array.isArray(value)) {
          return `${indent}<${key}>\n${this.objectToXML(value, indent + "  ")}${indent}</${key}>`;
        }

        // Handle arrays
        if (Array.isArray(value)) {
          // Only escape < and > in array values
          const safeValues = value.map((v) => String(v).replace(/[<>]/g, ""));
          return `${indent}<${key}>${safeValues.join(",")}</${key}>`;
        }

        // Handle simple values
        // Only escape < and > to maintain XML structure
        const safeValue = String(value).replace(/[<>]/g, "");
        return `${indent}<${key}>${safeValue}</${key}>`;
      })
      .filter(Boolean)
      .join("\n");
  }
}
