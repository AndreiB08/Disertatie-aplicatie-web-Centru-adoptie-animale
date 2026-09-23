import React, { useEffect, useState } from "react";
import axios from "axios";
import { capitalizeWords } from "../../utils/formHelpers.js";
import {
    Container, Typography, TextField, Button, Box, Alert
} from "@mui/material";
import { SERVER_URL } from "../../constants/server_url";

const Account = () => {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${SERVER_URL}/employees/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data;

            localStorage.setItem("id", data.id);

            setForm({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                email: data.email || "",
                phone_number: data.phone_number || "",
                password: ""
            });
        } catch (err) {
            console.error("Eroare la încărcare:", err);
            setErrorMessage("A apărut o eroare la încărcarea contului.");
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        const newErrors = {};

        if (!form.first_name.trim()) newErrors.first_name = "Prenumele este obligatoriu.";
        if (!form.last_name.trim()) newErrors.last_name = "Numele este obligatoriu.";

        if (!form.email.trim()) {
            newErrors.email = "Emailul este obligatoriu.";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Format email invalid.";
        }

        if (!form.phone_number.trim()) {
            newErrors.phone_number = "Telefonul este obligatoriu.";
        } else if (!/^07\d{8}$/.test(form.phone_number.trim())) {
            newErrors.phone_number = "Numărul trebuie să înceapă cu 07 și să conțină 10-15 cifre.";
        }

        if (form.password && form.password.length < 8) {
            newErrors.password = "Parola trebuie să aibă cel puțin 8 caractere.";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const body = {
                ...form,
                first_name: capitalizeWords(form.first_name),
                last_name: capitalizeWords(form.last_name)
            };

            if (!body.password || body.password.trim() === "") {
                delete body.password;
            }

            await axios.put(`${SERVER_URL}/employees/me`, body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            setSuccessMessage("Modificările au fost salvate cu succes!");
            await fetchProfile();
        } catch (err) {
            console.error("Eroare la salvare:", err);
            setErrorMessage(
                err.response?.data?.message || "Eroare de rețea sau server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="page" maxWidth="sm" sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>
                Contul meu
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                    label="Prenume"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                />
                <TextField
                    label="Nume"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                />
                <TextField
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    label="Telefon"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number}
                />
                <TextField
                    label="Parolă nouă (opțional)"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{
                    height: "56px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-primary)",
                    "&:hover": {
                        backgroundColor: "var(--color-primary-hover)"
                    }
                }}>
                    {loading ? "Salvare..." : "Salvează modificările"}
                </Button>
                {successMessage && <Alert severity="success">{successMessage}</Alert>}
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </Box>
        </Container>
    );
};

export default Account;
