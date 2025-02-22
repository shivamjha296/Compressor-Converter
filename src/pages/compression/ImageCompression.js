import React, { useState } from 'react';
import Compressor from 'compressorjs';
import './Compression.css';

function ImageCompression() {
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILES = 3;

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length + imageFiles.length > MAX_FILES) {
      setError(`You can only compress up to ${MAX_FILES} images at a time`);
      return;
    }

    setError('');
    
    const filesWithPreview = imageFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file),
      status: 'pending',
      originalSize: file.size,
      compressedSize: null,
      compressedURL: null,
      savings: null
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (idToRemove) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== idToRemove);
      // Cleanup preview URLs
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

  const getCompressionOptions = (level) => {
    const options = {
      strict: true,
      checkOrientation: true,
      maxWidth: 2000,
      maxHeight: 2000,
      mimeType: 'image/jpeg',
      convertTypes: ['image/png', 'image/webp']
    };

    switch (level) {
      case 'low':
        return {
          ...options,
          quality: 0.6,
          maxWidth: 1600,
          maxHeight: 1600
        };
      case 'medium':
        return {
          ...options,
          quality: 0.8,
          maxWidth: 1800,
          maxHeight: 1800
        };
      case 'high':
        return {
          ...options,
          quality: 0.9,
          maxWidth: 2000,
          maxHeight: 2000
        };
      default:
        return options;
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file.file, {
        ...getCompressionOptions(compressionLevel),
        success(result) {
          const compressedURL = URL.createObjectURL(result);
          const savings = ((file.originalSize - result.size) / file.originalSize * 100).toFixed(1);
          
          resolve({
            compressedURL,
            compressedSize: result.size,
            savings
          });
        },
        error(err) {
          reject(err);
        }
      });
    });
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

        try {
          const result = await compressImage(file);
          
          setFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? {
                    ...f, 
                    status: 'completed',
                    compressedURL: result.compressedURL,
                    compressedSize: result.compressedSize,
                    savings: result.savings
                  } 
                : f
            )
          );
        } catch (error) {
          console.error('Compression error:', error);
          setFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? {...f, status: 'error'} 
                : f
            )
          );
        }
      }
    }
    
    setIsProcessing(false);
  };

  const handleDownload = (file) => {
    if (file.compressedURL) {
      const link = document.createElement('a');
      link.href = file.compressedURL;
      // Preserve original extension for PNG files
      const extension = file.file.type === 'image/png' ? '.png' : '.jpg';
      link.download = `compressed_${file.file.name.replace(/\.[^/.]+$/, '')}${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBatchDownload = () => {
    const completedFiles = files.filter(file => file.status === 'completed');
    completedFiles.forEach(file => handleDownload(file));
  };

  return (
    <div className="compression-container">
      <div className="compression-header">
        <h1>Image Compression</h1>
        <p>Compress your images while maintaining high quality</p>
        <span className="file-limit">Maximum 3 images at a time</span>
      </div>

      <div className="compression-options">
        <div className="quality-selector">
          <label>Compression Level:</label>
          <select 
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
          >
            <option value="high">High Quality (Best for Photos)</option>
            <option value="medium">Medium Quality (Recommended)</option>
            <option value="low">Low Quality (Smallest Size)</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-area">
        <input
          type="file"
          id="file-input"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        <label htmlFor="file-input" className="upload-label">
          <i className="fas fa-cloud-upload-alt"></i>
          <p>Drag & drop images here or click to browse</p>
          <span>Supported formats: JPG, PNG, WEBP</span>
          <span className="files-count">
            {files.length} of {MAX_FILES} images selected
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="files-preview">
          {files.map(file => (
            <div key={file.id} className="file-preview-card">
              <img src={file.preview} alt="preview" />
              <div className="file-info">
                <p>{file.file.name}</p>
                <span>Original: {(file.originalSize / 1024 / 1024).toFixed(2)} MB</span>
                {file.compressedSize && (
                  <>
                    <span>Compressed: {(file.compressedSize / 1024 / 1024).toFixed(2)} MB</span>
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
              'Compress Images'
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

export default ImageCompression; 