#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('.env file created successfully.');
} else if (fs.existsSync(envPath)) {
  console.log('.env file already exists, skipping creation.');
} else {
  console.log('No .env.example file found, skipping .env creation.');
}

console.log('Environment setup completed.');
