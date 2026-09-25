import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  faGauge,
  faBars,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

import "./navbar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const closeMenu = () => {
    setMenuOpen(false);
  };

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
      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
        aria-expanded={menuOpen}
      >
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </button>

      <div className="navbar-logo">
        <NavLink to={isAuthenticated ? "/admin/dashboard" : "/"} className="navbar-brand">
          Centrul de Adopție Animale
        </NavLink>
      </div>

      <ul className={`navbar-links ${menuOpen ? "menu-open" : ""}`}>
        {!isAuthenticated && (
          <>
            <li>
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faHome} /> Acasă
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pets"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faPaw} /> Animale
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faInfoCircle} /> Despre noi
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/location"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} /> Locație
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faEnvelope} /> Contact
              </NavLink>
            </li>
          </>
        )}

        {isAuthenticated && (
          <>
            <li>
              <NavLink
                to="/admin/dashboard"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faGauge} /> Panou
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/pets"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faPaw} /> Animale
              </NavLink>
            </li>
            {role === "Admin" && (
              <li>
                <NavLink
                  to="/admin/employees"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faUsers} /> Angajați
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/admin/account"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FontAwesomeIcon icon={faUser} /> Contul meu
              </NavLink>
            </li>
            <li
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              className="logout-link"
            >
              <FontAwesomeIcon icon={faSignOutAlt} /> Deconectare
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
