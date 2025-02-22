const fs = require('fs');
const path = require('path');

// Define source and destination paths
const ffmpegCorePath = path.join(__dirname, 'node_modules/@ffmpeg/core/dist/umd');
const publicPath = path.join(__dirname, 'public');

// Files to copy
const files = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm'
];

// Create public directory if it doesn't exist
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath);
}

// Copy each file
files.forEach(file => {
  const source = path.join(ffmpegCorePath, file);
  const destination = path.join(publicPath, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(publicPath, file));
    console.log(`Copied ${file} to public folder`);
  } else {
    console.warn(`Warning: ${file} not found in source directory: ${source}`);
  }
}); 