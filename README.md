# Claude Project Bundle (CPB)

Claude Project Bundle (CPB) creates comprehensive project snapshots for maintaining context in conversations with Claude AI. When working on complex projects, each new conversation with Claude starts fresh. CPB solves this by generating a well-structured XML document containing your project's current state, making it easy for Claude to understand your project's context.

## Installation

You can install CPB globally for regular use:

```bash
npm install -g cpb
```

Or use it immediately without installation via npx:

```bash
npx cpb [directory]
```

### Requirements

- Node.js version 18 or higher
- npm version 7 or higher

## Usage

Basic usage with default settings:

```bash
cpb
```

Specify a different project directory:

```bash
cpb /path/to/your/project
```

With custom output location:

```bash
cpb --output ./my-bundles --filename project-snapshot.txt
```

## Configuration

CPB works with sensible defaults but can be customized through a configuration file. Create a `cpb.config.json` in your project root:

```json
{
  "output": {
    "directory": "./cpb-output",
    "filename": "project-knowledge.txt"
  },
  "files": {
    "include": {
      "text": [".txt", ".md"],
      "code": [".js", ".ts", ".py"],
      "docs": [".adoc", ".rst"],
      "config": [".json", ".yml"]
    },
    "exclude": {
      "directories": ["node_modules", "dist"],
      "files": [".env", ".DS_Store"],
      "patterns": ["*.test.js", "*.spec.ts"]
    },
    "binary": {
      "extensions": [".png", ".jpg", ".pdf"],
      "maxSize": 1048576
    }
  },
  "project": {
    "mainFiles": ["README.md", "package.json"],
    "typeRules": {
      "node": ["package.json"],
      "python": ["requirements.txt"]
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
    <created>2024-12-09T21:15:11.296Z</created>
    <projectPath>/path/to/project</projectPath>
    <config>...</config>
  </metadata>
  <files>
    <file path="src/index.js" type="code">
      <content>// File content here</content>
    </file>
    ...
  </files>
</bundle>
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
4. Include relevant configuration files in your bundle
5. Maintain a clean project structure for better context

## Command Line Options

```bash
Usage: cpb [options] [directory]

Options:
  -V, --version           Output version number
  -o, --output <path>     Output directory (default: "./out")
  -f, --filename <name>   Output filename (default: "project_bundle.txt")
  --config <path>        Custom config file path
  -h, --help             Display help information
```

## Project Type Support

CPB automatically detects and handles various project types:

- Node.js/JavaScript/TypeScript
- Python
- Ruby
- Java
- AsciiDoc documentation
- General documentation (Markdown, RST)

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Dennis Decoene

## Support

- Report bugs: [Issue Tracker](https://github.com/ddecoene/cpb/issues)
- Get help: [Discussions](https://github.com/ddecoene/cpb/discussions)
- Documentation: [Wiki](https://github.com/ddecoene/cpb/wiki)