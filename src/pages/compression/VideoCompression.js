import React, { useState } from 'react';
import './Compression.css';

function VideoCompression() {
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILES = 3;
  const SUPPORTED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const videoFiles = selectedFiles.filter(file => 
      SUPPORTED_FORMATS.includes(file.type)
    );

    if (files.length + videoFiles.length > MAX_FILES) {
      setError(`You can only compress up to ${MAX_FILES} videos at a time`);
      return;
    }

    setError('');
    
    const filesWithPreview = videoFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file),
      status: 'pending',
      originalSize: file.size,
      duration: 0,
      resolution: '',
      compressedSize: null,
      compressedURL: null,
      savings: null
    }));

    // Get video metadata
    filesWithPreview.forEach(fileData => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileData.id) {
            return {
              ...f,
              duration: Math.round(video.duration),
              resolution: `${video.videoWidth}x${video.videoHeight}`
            };
          }
          return f;
        }));
        URL.revokeObjectURL(video.src);
      };
      video.src = fileData.preview;
    });

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (idToRemove) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== idToRemove);
      prev.forEach(file => {
        if (file.id === idToRemove) {
          URL.revokeObjectURL(file.preview);
          if (file.compressedURL) {
            URL.revokeObjectURL(file.compressedURL);
          }
        }
      });
      return updatedFiles;
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompression = async () => {
    setIsProcessing(true);
    
    // Simulated compression - Replace with actual video compression logic
    for (let file of files) {
      if (file.status === 'pending') {
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? {...f, status: 'processing'} 
              : f
          )
        );

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Simulate compression result
        const simulatedCompressedSize = file.originalSize * 0.6;
        const savings = ((file.originalSize - simulatedCompressedSize) / file.originalSize * 100).toFixed(1);

        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? {
                  ...f,
                  status: 'completed',
                  compressedSize: simulatedCompressedSize,
                  savings: savings
                }
              : f
          )
        );
      }
    }
    
    setIsProcessing(false);
  };

  const handleDownload = (file) => {
    // Implement actual video download logic
    console.log('Downloading compressed video:', file);
  };

  const handleBatchDownload = () => {
    const completedFiles = files.filter(file => file.status === 'completed');
    completedFiles.forEach(file => handleDownload(file));
  };

  return (
    <div className="compression-container">
      <div className="compression-header">
        <h1>Video Compression</h1>
        <p>Compress your videos while maintaining quality</p>
        <span className="file-limit">Maximum 3 videos at a time</span>
      </div>

      <div className="compression-options">
        <div className="quality-selector">
          <label>Compression Level:</label>
          <select 
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
          >
            <option value="high">High Quality (1080p)</option>
            <option value="medium">Medium Quality (720p)</option>
            <option value="low">Low Quality (480p)</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-area">
        <input
          type="file"
          id="video-input"
          multiple
          accept="video/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        <label htmlFor="video-input" className="upload-label">
          <i className="fas fa-video"></i>
          <p>Drag & drop videos here or click to browse</p>
          <span>Supported formats: MP4, WebM, MOV, AVI</span>
          <span className="files-count">
            {files.length} of {MAX_FILES} videos selected
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="files-preview">
          {files.map(file => (
            <div key={file.id} className="file-preview-card video-card">
              <div className="video-preview">
                <video src={file.preview} controls preload="metadata" />
              </div>
              <div className="file-info">
                <p>{file.file.name}</p>
                <div className="video-details">
                  <span>Duration: {formatDuration(file.duration)}</span>
                  <span>Resolution: {file.resolution}</span>
                </div>
                <span>Original: {formatFileSize(file.originalSize)}</span>
                {file.compressedSize && (
                  <>
                    <span>Compressed: {formatFileSize(file.compressedSize)}</span>
                    <span className="savings">Space saved: {file.savings}%</span>
                  </>
                )}
              </div>
              <div className="file-status">
                {file.status === 'pending' && <span className="status-pending">Ready</span>}
                {file.status === 'processing' && (
                  <span className="status-processing">
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </span>
                )}
                {file.status === 'completed' && (
                  <button 
                    className="download-button"
                    onClick={() => handleDownload(file)}
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                )}
                {file.status === 'error' && <span className="status-error">Error</span>}
              </div>
              <button 
                className="remove-file"
                onClick={() => removeFile(file.id)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="compression-actions">
          <button 
            className="compress-button"
            onClick={handleCompression}
            disabled={isProcessing || files.length === 0}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Compressing...
              </>
            ) : (
              'Compress Videos'
            )}
          </button>
          
          {files.some(file => file.status === 'completed') && (
            <button 
              className="download-all-button"
              onClick={handleBatchDownload}
            >
              <i className="fas fa-download"></i> Download All
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoCompression;