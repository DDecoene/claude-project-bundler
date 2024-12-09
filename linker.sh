#!/bin/bash

# Store the paths as variables for clarity and maintainability
CPB_PATH="/Users/dennisdecoene/Dev/claude-project-bundle"
PROJECT_PATH="/Users/dennisdecoene/Dev/history-repeats"

# Print what we're about to do
echo "Setting up CPB development links..."
echo "CPB Path: $CPB_PATH"
echo "Project Path: $PROJECT_PATH"

# First, check if we're already in a linked state and clean up if necessary
echo -e "\nCleaning up any existing links..."
npm unlink cpb 2>/dev/null || true

# Move to the CPB directory and create the global link
echo -e "\nSetting up CPB for linking..."
cd "$CPB_PATH" || { echo "Failed to change to CPB directory"; exit 1; }
npm link || { echo "Failed to create global link for CPB"; exit 1; }

# Move to the project directory and create the project-specific link
echo -e "\nLinking CPB to your project..."
cd "$PROJECT_PATH" || { echo "Failed to change to project directory"; exit 1; }
npm link cpb || { echo "Failed to link CPB to project"; exit 1; }

# Confirm success
echo -e "\n✨ Setup complete! CPB is now linked for development."
echo "You can now use 'npx cpb' in your project directory."

# Return to the original directory
cd - > /dev/null