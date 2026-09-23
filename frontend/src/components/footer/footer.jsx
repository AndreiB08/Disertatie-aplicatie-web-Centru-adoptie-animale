import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>🐾 Centrul de Adopție Animale</p>
        <p>&copy; 2025 Centrul de Adopție Animale. Toate drepturile rezervate.</p>
        <p>
          <a href="/privacy-policy">Politica de Confidențialitate</a> |{" "}
          <a href="/terms">Termeni și Condiții</a>
        </p>
      </div>
      <ul className="footer-links">
        <li><Link to="/">Acasă</Link></li>
        <li><Link to="/pets">Animale</Link></li>
        <li><Link to="/about">Despre noi</Link></li>
        <li><Link to="/location">Locație</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
    </footer>
  );
};

export default Footer;
