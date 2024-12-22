// lib/config.js
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default configuration that serves as a fallback
export const defaultConfig = {
  output: {
    directory: './out',
    filename: 'project_bundle.txt',
    timestamped: true
  },
  
  files: {
    include: {
      asciidoc: ['.adoc', '.asc', '.asciidoc'],
      code: [
        '.js', '.jsx', '.ts', '.tsx',
        '.py', '.rb', '.java', '.cpp',
        '.html', '.css', '.scss'
      ],
      docs: ['.md', '.json', '.yaml', '.yml'],
      config: ['.json', '.yml', '.yaml', '.toml']
    },
    
    exclude: {
      directories: [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.vercel',
        '.github',
        '.vscode'
      ],
      files: [
        '.env',
        '.DS_Store',
        'package-lock.json',
        'yarn.lock',
        '.gitignore'
      ],
      patterns: ['*.log']
    },
    
    binary: {
      extensions: [
        '.png', '.jpg', '.jpeg', '.gif',
        '.pdf', '.mp4', '.mov',
        '.zip', '.tar', '.gz'
      ],
      maxSize: 1048576 // 1MB
    }
  },
  
  project: {
    mainFiles: ['README.md'],
    typeRules: {
      node: ['package.json'],
      python: ['requirements.txt', 'setup.py'],
      asciidoc: ['.adoc', '.asc']
    }
  }
};

// Function to find the configuration file in the project directory
function findConfigFile(projectPath) {
  const configFiles = [
    'cpb.config.json',
    '.cpbrc',
    '.cpb.json'
  ];
  
  for (const filename of configFiles) {
    const configPath = join(projectPath, filename);
    if (existsSync(configPath)) {
      return configPath;
    }
  }
  
  return null;
}

// Load and merge configuration
export function loadConfig(projectPath, configPath = null) {
  try {
    // If specific config path provided, use it
    const configFile = configPath || findConfigFile(projectPath);
    
    if (configFile) {
      console.log(`Loading configuration from ${configFile}`);
      const userConfig = JSON.parse(readFileSync(configFile, 'utf8'));
      return mergeConfigs(defaultConfig, userConfig);
    }
    
    console.log('No configuration file found, using defaults');
    return defaultConfig;
  } catch (error) {
    console.warn('Error loading configuration:', error.message);
    console.log('Falling back to default configuration');
    return defaultConfig;
  }
}

// Deep merge configuration objects
function mergeConfigs(defaultConfig, userConfig) {
  if (!userConfig) return defaultConfig;
  
  const merged = { ...defaultConfig };
  
  for (const [key, value] of Object.entries(userConfig)) {
    if (value === null || value === undefined) continue;
    
    if (Array.isArray(value)) {
      merged[key] = [...new Set([...(defaultConfig[key] || []), ...value])];
    } else if (typeof value === 'object') {
      merged[key] = mergeConfigs(defaultConfig[key] || {}, value);
    } else {
      merged[key] = value;
    }
  }
  
  return merged;
}