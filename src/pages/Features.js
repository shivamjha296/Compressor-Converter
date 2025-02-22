import React from 'react';

function Features() {
  return (
    <div className="container">
      <h1>Our Features</h1>
      <div className="features-grid">
        <div className="feature-card">
          <i className="fas fa-file-archive"></i>
          <h3>File Compression</h3>
          <p>Compress your files without losing quality. Support for multiple formats.</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-exchange-alt"></i>
          <h3>Format Conversion</h3>
          <p>Convert files between different formats easily and quickly.</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-bolt"></i>
          <h3>Fast Processing</h3>
          <p>Quick conversion and compression with our optimized algorithms.</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-lock"></i>
          <h3>Secure</h3>
          <p>Your files are processed securely and deleted after conversion.</p>
        </div>
      </div>
    </div>
  );
}

export default Features; 