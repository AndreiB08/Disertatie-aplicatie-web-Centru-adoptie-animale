import React from 'react';
import './location.css';

const LocationPage = () => {
  return (
    <div className="page">
      <h2 className="title">Unde ne găsești</h2>
      <p className="location-description">
        Vino să ne vizitezi! Centrul nostru de adopție te așteaptă cu drag. 🐾
      </p>
      <div className="location-details">
        <p><strong>📍 Adresă:</strong> Drumul Lunca Jariștei, București</p>
        <p><strong>🕒 Program:</strong> Lu-Vi: 10:00 - 18:00</p>
        <p><strong>📞 Număr telefon:</strong> +40 700 426 841</p>
      </div>
      <div className="map-container">
        <iframe
          title="Our Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2849.9940256720227!2d26.179869!3d44.4067655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1fc23214d2acb%3A0x3ab5538c499b6381!2sAd%C4%83postul%20de%20C%C%C3%A2ini%20Pallady!5e0!3m2!1sen!2sro!4v1720613146521!5m2!1sen!2sro"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default LocationPage;
