export interface CPBConfig {
  output: {
    directory: string;
    filename: string;
    timestamped?: boolean;
  };

  files: {
    include: {
      text: string[];
      code: string[];
      docs: string[];
      config: string[];
    };

    exclude: {
      directories: string[];
      files: string[];
      patterns: string[];
    };

    binary: {
      extensions: string[];
      maxSize: number;
    };
  };

  project: {
    mainFiles: string[];
    typeRules: {
      [key: string]: string[];
    };
  };
}

export interface BundleResult {
  success: boolean;
  outputPath: string;
  stats: {
    totalFiles: number;
    fileTypes: {
      [key: string]: number;
    };
  };
}

export interface BundlerOptions {
  configPath?: string;
  output?: {
    directory: string;
    filename: string;
  };
}
