import React, { useState } from 'react';
import './Compression.css';

function AudioCompression() {
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILES = 3;
  const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'];

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const audioFiles = selectedFiles.filter(file => 
      SUPPORTED_FORMATS.includes(file.type)
    );

    if (files.length + audioFiles.length > MAX_FILES) {
      setError(`You can only compress up to ${MAX_FILES} audio files at a time`);
      return;
    }

    setError('');
    
    const filesWithPreview = audioFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      originalSize: file.size,
      duration: 0,
      bitrate: '',
      compressedSize: null,
      compressedURL: null,
      savings: null
    }));

    // Get audio metadata
    filesWithPreview.forEach(fileData => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileData.id) {
            return {
              ...f,
              duration: Math.round(audio.duration),
              bitrate: calculateBitrate(fileData.file.size, audio.duration)
            };
          }
          return f;
        }));
        URL.revokeObjectURL(audio.src);
      };
      audio.src = URL.createObjectURL(fileData.file);
    });

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const calculateBitrate = (fileSize, duration) => {
    const bitrate = (fileSize * 8) / (duration * 1000);
    return `${Math.round(bitrate)} kbps`;
  };

  const removeFile = (idToRemove) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== idToRemove);
      prev.forEach(file => {
        if (file.id === idToRemove && file.compressedURL) {
          URL.revokeObjectURL(file.compressedURL);
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
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate compression result
        const simulatedCompressedSize = file.originalSize * 0.5;
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
    // Implement actual audio download logic
    console.log('Downloading compressed audio:', file);
  };

  const handleBatchDownload = () => {
    const completedFiles = files.filter(file => file.status === 'completed');
    completedFiles.forEach(file => handleDownload(file));
  };

  return (
    <div className="compression-container">
      <div className="compression-header">
        <h1>Audio Compression</h1>
        <p>Compress your audio files while maintaining quality</p>
        <span className="file-limit">Maximum 3 audio files at a time</span>
      </div>

      <div className="compression-options">
        <div className="quality-selector">
          <label>Compression Level:</label>
          <select 
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
          >
            <option value="high">High Quality (320 kbps)</option>
            <option value="medium">Medium Quality (192 kbps)</option>
            <option value="low">Low Quality (128 kbps)</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-area">
        <input
          type="file"
          id="audio-input"
          multiple
          accept="audio/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        <label htmlFor="audio-input" className="upload-label">
          <i className="fas fa-music"></i>
          <p>Drag & drop audio files here or click to browse</p>
          <span>Supported formats: MP3, WAV, OGG, M4A</span>
          <span className="files-count">
            {files.length} of {MAX_FILES} audio files selected
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="files-preview">
          {files.map(file => (
            <div key={file.id} className="file-preview-card audio-card">
              <div className="audio-preview">
                <i className="fas fa-music"></i>
                <audio src={URL.createObjectURL(file.file)} controls />
              </div>
              <div className="file-info">
                <p>{file.file.name}</p>
                <div className="audio-details">
                  <span>Duration: {formatDuration(file.duration)}</span>
                  <span>Bitrate: {file.bitrate}</span>
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
              'Compress Audio'
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

export default AudioCompression;