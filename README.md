# Claude Project Bundle (CPB)

Claude Project Bundle (CPB) creates comprehensive project snapshots for maintaining context in conversations with Claude AI. When working with complex projects, each new conversation with Claude starts fresh. CPB solves this by generating a well-structured XML document containing your project's current state, making it easy for Claude to understand your project's context.

## Installation

You can install CPB globally for regular use:

```bash
yarn global add claude-project-bundler
```

Or use it immediately without installation via npx:

```bash
npx claude-project-bundler [directory]
```

### Requirements

- Node.js version 18 or higher
- yarn version 1 or higher

## Usage

Basic usage with default settings:

```bash
# Using the installed command
cpb

# Or using the full command
claude-project-bundler
```

Create a bundle for a specific directory:

```bash
cpb /path/to/your/project
```

Create a bundle with custom output location:

```bash
cpb --output ./my-bundles --filename project-snapshot.txt
```

Initialize a new configuration file:

```bash
cpb init
```

## Configuration

CPB works with sensible defaults but can be customized through a configuration file. Create one using:

```bash
cpb init
```

Or manually create `cpb.config.json` in your project root:

```json
{
  "output": {
    "directory": "./cpb-output",
    "filename": "project-knowledge.txt",
    "timestamped": true
  },
  "files": {
    "include": {
      "asciidoc": [".adoc", ".asc", ".asciidoc"],
      "code": [".js", ".jsx", ".ts", ".tsx", ".py", ".rb", ".java", ".cpp"],
      "docs": [".md", ".rst", ".adoc"],
      "config": [".json", ".yml", ".yaml", ".toml"]
    },
    "exclude": {
      "directories": ["node_modules", "dist", "build", ".git"],
      "files": [".env", ".DS_Store", "package-lock.json"],
      "patterns": ["*.test.*", "*.spec.*"]
    },
    "binary": {
      "extensions": [".png", ".jpg", ".pdf", ".zip"],
      "maxSize": 1048576
    }
  },
  "project": {
    "mainFiles": ["README.md", "package.json"],
    "typeRules": {
      "node": ["package.json"],
      "python": ["requirements.txt", "setup.py"],
      "asciidoc": [".adoc", ".asc"]
    }
  }
}
```

### Output Format

CPB generates a structured XML document containing:

1. Project Metadata
   - Creation timestamp
   - Project path
   - Configuration settings

2. File Contents
   - Organized by file type (code, docs, config)
   - Preserves directory structure
   - Includes file content with proper XML escaping

Example output structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bundle>
  <metadata>
    <created>2024-12-22T16:18:55.123Z</created>
    <projectPath>/path/to/project</projectPath>
    <config>...</config>
  </metadata>
  <files>
    <file path="src/index.js" type="code">
      <content>// File content here</content>
    </file>
  </files>
</bundle>
```

## Command Line Interface

The CLI provides several commands and options:

```bash
Usage: cpb [options] [directory]

Options:
  -V, --version           Output version number
  -o, --output <path>     Output directory (default: "./out")
  -f, --filename <name>   Output filename (default: "project_bundle.txt")
  --config <path>        Custom config file path
  --no-timestamp        Disable timestamp in filename
  -h, --help             Display help information

Commands:
  bundle [options] [dir]  Create a project bundle (default)
  init [options] [dir]    Create a default configuration file
```

## Using with Claude

1. Generate your project bundle:
   ```bash
   cpb
   ```

2. Start a new conversation with Claude and share the generated bundle file.

3. Provide context about your project:
   ```
   I'm working on [project description]. I've shared a CPB (Claude Project Bundle) 
   that contains my project's current state. Please reference this context as we work.
   ```

4. Regenerate the bundle when making significant project changes to keep Claude's context current.

## Best Practices

1. Keep bundles up to date with your project's latest state
2. Use `.cpbignore` for project-specific exclusions
3. Share bundles at the start of new conversations
4. Include relevant configuration files
5. Maintain a clean project structure for better context
6. Use timestamped filenames to track bundle versions
7. Exclude unnecessary files and directories

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](https://github.com/DDecoene/claude-project-bundler/blob/main/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/DDecoene/claude-project-bundler/blob/main/LICENSE) file for details.

## Author

Dennis Decoene

## Support

- Report bugs: [Issue Tracker](https://github.com/ddecoene/claude-project-bundler/issues)
- Get help: [Discussions](https://github.com/ddecoene/claude-project-bundler/discussions)
- Documentation: [Wiki](https://github.com/ddecoene/claude-project-bundler/wiki)