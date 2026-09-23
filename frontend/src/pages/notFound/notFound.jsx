import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {

  const navigate = useNavigate();

  return (
    <div className="page not-found">
      <h1>404 - Pagină negăsită</h1>
      <p>Ne pare rău, dar pagina pe care o cauți nu există.</p>
      <div className="button-wrapper">
        <button
          className="btn btn-primary"
          onClick={() => {
            const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
            if (isAuthenticated) {
              navigate("/admin/dashboard");
            } else {
              navigate("/");
            }
          }}
        >
          Înapoi la pagina principală
        </button>
      </div>
    </div>
  );
};

export default NotFound;