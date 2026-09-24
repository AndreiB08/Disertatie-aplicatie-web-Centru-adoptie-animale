import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SERVER_URL } from "../../constants/server_url";

const ChangePassword = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password.length < 8) {
            setError("Parola trebuie să aibă cel puțin 8 caractere.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Parolele nu coincid.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Sesiunea a expirat. Te rugăm să te autentifici din nou.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${SERVER_URL}/employees/change-password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Nu s-a putut schimba parola."
                );
            }

            setSuccess("Parola a fost schimbată cu succes!");

            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        } catch (err) {
            console.error("Change password error:", err);
            setError(err.message || "A apărut o eroare.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-page">
            <div className="change-password-container">
                <h1>Schimbă parola</h1>

                <p>
                    Pentru prima autentificare, trebuie să îți setezi o parolă
                    nouă.
                </p>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="password">
                            Parola nouă
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introdu parola nouă"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword">
                            Confirmă parola nouă
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            placeholder="Confirmă parola nouă"
                            disabled={loading}
                            required
                        />
                    </div>

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="success-message">
                            {success}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading
                            ? "Se schimbă parola..."
                            : "Schimbă parola"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;