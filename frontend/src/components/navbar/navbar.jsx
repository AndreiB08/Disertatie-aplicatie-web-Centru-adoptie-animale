import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPaw,
  faUser,
  faSignOutAlt,
  faUsers,
  faInfoCircle,
  faMapMarkerAlt,
  faEnvelope,
  faGauge
} from "@fortawesome/free-solid-svg-icons";

import "./NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("isAuthenticated");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to={isAuthenticated ? "/admin/dashboard" : "/"} className="navbar-brand">
          Centrul de Adopție Animale
        </NavLink>
      </div>

      <ul className="navbar-links">
        {!isAuthenticated && (
          <>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faHome} /> Acasă
              </NavLink>
            </li>
            <li>
              <NavLink to="/pets" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faPaw} /> Animale
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faInfoCircle} /> Despre noi
              </NavLink>
            </li>
            <li>
              <NavLink to="/location" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faMapMarkerAlt} /> Locație
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faEnvelope} /> Contact
              </NavLink>
            </li>
          </>
        )}

        {isAuthenticated && (
          <>
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faGauge} /> Panou
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/pets" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faPaw} /> Animale
              </NavLink>
            </li>
            {role === "Admin" && (
              <li>
                <NavLink to="/admin/employees" className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faUsers} /> Angajați
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/admin/account" className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faUser} /> Contul meu
              </NavLink>
            </li>
            <li onClick={handleLogout} className="logout-link">
              <FontAwesomeIcon icon={faSignOutAlt} /> Deconectare
            </li>
          </>
        )}

        {/* Language Switcher */}

      </ul>
    </nav>
  );
};

export default NavBar;
