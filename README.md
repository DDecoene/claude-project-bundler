# Claude Project Bundle (CPB)

Claude Project Bundle (CPB) is a tool that helps you maintain context when working with Claude on software projects. It creates comprehensive project snapshots that you can share at the start of each conversation, ensuring Claude understands your project's current state and history.

## Quick Start

You can use CPB immediately without installation using npx:

```bash
npx cpb [directory]
```

Or install it globally for regular use:

```bash
npm install -g cpb
cpb [directory]
```

## Why CPB?

When working with AI assistants like Claude on complex projects, maintaining context across conversations can be challenging. Each new conversation starts fresh, without knowledge of your project's structure or previous discussions. CPB solves this by:

1. Creating a comprehensive snapshot of your project
2. Organizing it in a format Claude can easily understand
3. Maintaining project context across conversations

## Configuration

CPB works out of the box with sensible defaults, but you can customize its behavior by creating a `cpb.config.json` file in your project root:

```json
{
  "output": {
    "directory": "./cpb-output",
    "filename": "project-knowledge.txt"
  },
  "files": {
    "include": {
      "text": [".txt", ".md"],
      "code": [".js", ".ts"],
      "docs": [".adoc"]
    },
    "exclude": {
      "directories": ["node_modules", "dist"],
      "files": [".env", ".DS_Store"],
      "patterns": ["*.test.js", "*.spec.ts"]
    }
  }
}
```

### Configuration Options

- `output`: Controls where and how the bundle is saved
  - `directory`: Output directory location
  - `filename`: Name of the bundle file

- `files`: Defines what files to include or exclude
  - `include`: File types to process
  - `exclude`: Files and patterns to ignore
  - `binary`: How to handle binary files

## Using with Claude

1. Generate your project bundle:
   ```bash
   cpb
   ```

2. Share the generated bundle at the start of your Claude conversation

3. Provide context about your project:
   ```
   I'm working on [project description]. I've shared a CPB (Claude Project Bundle) 
   that contains my project's current state. Please reference this context as we work.
   ```

## Best Practices

1. Regenerate the bundle when making significant project changes

2. Share the bundle at the start of new conversations

3. Create a `.cpbignore` file for project-specific exclusions

4. Use custom configuration for specialized project requirements

## Command Line Options

```bash
Usage: cpb [options] [directory]

Options:
  -V, --version           Output version number
  -o, --output <path>     Output directory (default: "./out")
  -f, --filename <name>   Output filename (default: "project_bundle.txt")
  --config <path>         Custom config file path
  -h, --help             Display help information
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Example Configurations

### TypeScript Project
```json
{
  "files": {
    "include": {
      "code": [".ts", ".tsx"],
      "docs": [".md"]
    },
    "exclude": {
      "patterns": ["*.test.ts", "*.spec.ts", "*.d.ts"]
    }
  }
}
```

### Python Project
```json
{
  "files": {
    "include": {
      "code": [".py"],
      "docs": [".rst", ".md"]
    },
    "exclude": {
      "directories": ["venv", "__pycache__"],
      "patterns": ["*.pyc"]
    }
  }
}
```