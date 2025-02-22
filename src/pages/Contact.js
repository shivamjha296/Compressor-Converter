import React from 'react';

function Contact() {
  return (
    <div className="container">
      <h1>Contact Us</h1>
      <div className="contact-content">
        <div className="contact-info">
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <p>support@fileconverter.com</p>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="contact-item">
            <i className="fas fa-location-dot"></i>
            <p>123 Tech Street, Digital City, 12345</p>
          </div>
        </div>
        
        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit" className="submit-button">Send Message</button>
        </form>
      </div>
    </div>
  );
}

export default Contact; 