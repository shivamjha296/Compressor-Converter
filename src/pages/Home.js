import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [showOptions, setShowOptions] = useState(null); // 'compress' or 'convert' or null
  const navigate = useNavigate();

  const compressionOptions = [
    { title: 'Image Compression', icon: 'fa-image', path: '/compress/image' },
    { title: 'PDF Compression', icon: 'fa-file-pdf', path: '/compress/pdf' },
    { title: 'Video Compression', icon: 'fa-video', path: '/compress/video' },
    { title: 'Audio Compression', icon: 'fa-music', path: '/compress/audio' }
  ];

  const conversionOptions = [
    { title: 'Image Converter', icon: 'fa-image', path: '/convert/image', 
      formats: 'JPG ↔ PNG ↔ WEBP ↔ GIF' },
    { title: 'Document Converter', icon: 'fa-file-alt', path: '/convert/document',
      formats: 'PDF ↔ DOCX ↔ TXT' },
    { title: 'Video Converter', icon: 'fa-video', path: '/convert/video',
      formats: 'MP4 ↔ AVI ↔ MOV ↔ MKV' },
    { title: 'Audio Converter', icon: 'fa-music', path: '/convert/audio',
      formats: 'MP3 ↔ WAV ↔ AAC ↔ FLAC' }
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>File Converter & Compressor</h1>
        <p>Convert and compress your files with ease</p>
      </section>

      {!showOptions ? (
        <div className="main-actions">
          <div 
            className="action-card"
            onClick={() => setShowOptions('compress')}
          >
            <i className="fas fa-compress-arrows-alt"></i>
            <h2>Compress Files</h2>
            <p>Reduce file size while maintaining quality</p>
          </div>

          <div 
            className="action-card"
            onClick={() => setShowOptions('convert')}
          >
            <i className="fas fa-exchange-alt"></i>
            <h2>Convert Files</h2>
            <p>Convert files to different formats</p>
          </div>
        </div>
      ) : (
        <div className="options-container">
          <button 
            className="back-button"
            onClick={() => setShowOptions(null)}
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>

          <h2>{showOptions === 'compress' ? 'Compression Options' : 'Conversion Options'}</h2>
          
          <div className="options-grid">
            {(showOptions === 'compress' ? compressionOptions : conversionOptions).map((option, index) => (
              <div 
                key={index} 
                className="option-card"
                onClick={() => navigate(option.path)}
              >
                <i className={`fas ${option.icon}`}></i>
                <h3>{option.title}</h3>
                {option.formats && <p className="formats">{option.formats}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home; 