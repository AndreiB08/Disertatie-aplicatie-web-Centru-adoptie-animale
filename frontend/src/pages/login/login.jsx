import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './login.css';
import { SERVER_URL } from "../../constants/server_url";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${SERVER_URL}/employees/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login eșuat.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.employee.role);
            localStorage.setItem("id", data.employee.id);
            localStorage.setItem("isAuthenticated", "true");

            navigate("/admin/dashboard");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page login">
            <h1 className="title">Bine ai venit</h1>

            <div className="login-box">
                <h2>Conectează-te</h2>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Parolă</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="buttons">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? "Se conectează..." : "Conectează-te"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
