import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import './Compression.css';

function PDFCompression() {
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILES = 3;

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const pdfFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf'
    );

    if (files.length + pdfFiles.length > MAX_FILES) {
      setError(`You can only compress up to ${MAX_FILES} PDFs at a time`);
      return;
    }

    setError('');
    
    const filesWithPreview = pdfFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
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
      prev.forEach(file => {
        if (file.id === idToRemove && file.compressedURL) {
          URL.revokeObjectURL(file.compressedURL);
        }
      });
      return updatedFiles;
    });
  };

  const compressPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Compress PDF
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        compress: true
      });

      // Create blob from compressed bytes
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const compressedURL = URL.createObjectURL(blob);
      
      return {
        compressedURL,
        compressedSize: blob.size,
        savings: ((file.size - blob.size) / file.size * 100).toFixed(1)
      };
    } catch (error) {
      console.error('PDF compression error:', error);
      throw error;
    }
  };

  const handleCompression = async () => {
    setIsProcessing(true);
    
    for (let file of files) {
      if (file.status === 'pending') {
        try {
          setFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? {...f, status: 'processing'} 
                : f
            )
          );

          const result = await compressPDF(file.file);

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
      link.download = `compressed_${file.file.name}`;
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
        <h1>PDF Compression</h1>
        <p>Compress your PDF files while maintaining quality</p>
        <span className="file-limit">Maximum 3 PDFs at a time</span>
      </div>

      <div className="compression-options">
        <div className="quality-selector">
          <label>Compression Level:</label>
          <select 
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
          >
            <option value="high">High Quality (Best for Text)</option>
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
          accept=".pdf"
          onChange={handleFileSelect}
          className="file-input"
        />
        <label htmlFor="file-input" className="upload-label">
          <i className="fas fa-file-pdf"></i>
          <p>Drag & drop PDF files here or click to browse</p>
          <span>Supported format: PDF</span>
          <span className="files-count">
            {files.length} of {MAX_FILES} PDFs selected
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="files-preview">
          {files.map(file => (
            <div key={file.id} className="file-preview-card pdf-card">
              <div className="pdf-icon">
                <i className="fas fa-file-pdf"></i>
              </div>
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
              'Compress PDFs'
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

export default PDFCompression; 