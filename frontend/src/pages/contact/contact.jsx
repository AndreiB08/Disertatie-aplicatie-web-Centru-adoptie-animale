import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { SERVER_URL } from "../../constants/server_url";
import './contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Numele este obligatoriu.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Emailul este obligatoriu.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Emailul introdus nu este valid.";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Mesajul este obligatoriu.";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const res = await fetch(`${SERVER_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Mesajul tău a fost trimis!");
                setFormData({ name: '', email: '', message: '' });
                setErrors({});
            } else {
                alert("Ceva n-a funcționat. Încearcă din nou.");
            }
        } catch (err) {
            console.error(err);
            alert("Eroare la trimiterea mesajului.");
        }
    };

    return (
        <div className="page contact-container">
            <Typography variant="h4" className="titlu contact-title">Contactează-ne</Typography>
            <Typography className="contact-description">
                Ne-ar face plăcere să îți auzim părerea! Fie că ai întrebări, sugestii sau vrei să ne susții, nu ezita să ne scrii.
            </Typography>

            <Box component="form" className="contact-form" onSubmit={handleSubmit} noValidate>
                <TextField
                    label="Numele tău"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                />
                <TextField
                    label="Emailul tău"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                />
                <TextField
                    label="Mesajul tău"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={5}
                    error={!!errors.message}
                    helperText={errors.message}
                    fullWidth
                />
                <Button variant="contained" color="primary" type="submit">
                    Trimite mesaj
                </Button>
            </Box>

            <div className="contact-info">
                <p><strong>📍 Adresă:</strong> Drumul Lunca Jariștei, București</p>
                <p><strong>📞 Program:</strong> +40 700 426 841</p>
                <p><strong>✉️ Email:</strong> contact@centruadoptie.ro</p>
            </div>
        </div>
    );
};

export default Contact;
