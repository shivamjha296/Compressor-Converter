import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import ImageCompression from './pages/compression/ImageCompression';
import PDFCompression from './pages/compression/PDFCompression';
import VideoCompression from './pages/compression/VideoCompression';
import AudioCompression from './pages/compression/AudioCompression';
import './App.css';
import './styles/pages.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/compress/image" element={<ImageCompression />} />
          <Route path="/compress/pdf" element={<PDFCompression />} />
          <Route path="/compress/video" element={<VideoCompression />} />
          <Route path="/compress/audio" element={<AudioCompression />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
