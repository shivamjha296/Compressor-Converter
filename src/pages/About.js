import React from 'react';

function About() {
  return (
    <div className="container">
      <h1>About Us</h1>
      <div className="about-content">
        <section className="about-section">
          <h2>Who We Are</h2>
          <p>We are a team of developers passionate about making file conversion and compression accessible to everyone. Our platform provides easy-to-use tools for all your file manipulation needs.</p>
        </section>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>To provide a simple, efficient, and secure platform for all your file conversion needs. We believe in making technology accessible and user-friendly.</p>
        </section>
        
        <section className="about-section">
          <h2>Why Choose Us</h2>
          <ul>
            <li>Fast and efficient processing</li>
            <li>Secure file handling</li>
            <li>Multiple format support</li>
            <li>User-friendly interface</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default About; 