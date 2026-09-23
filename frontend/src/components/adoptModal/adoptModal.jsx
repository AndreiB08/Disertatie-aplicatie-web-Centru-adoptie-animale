import React, { useState } from "react";
import axios from "axios";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../constants/server_url";
import { ADOPTION_STATUSES } from "../../../../backend/src/constants/enums";
import { lowercase, capitalizeWords } from "../../utils/formHelpers";
const AdoptModal = ({ open, setOpen, animalId, notifyOnly = false }) => {

    const initialForm = notifyOnly
        ? { email: "" }
        : {
            adopter_first_name: "",
            adopter_last_name: "",
            adopter_email: "",
            adopter_phone_number: "",
            message: "",
            pickup_datetime: ""
        };

    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};

        if (!formData.adopter_email.trim()) {
            newErrors.adopter_email = "Emailul este obligatoriu.";
        } else if (!/\S+@\S+\.\S+/.test(formData.adopter_email)) {
            newErrors.adopter_email = "Formatul emailului este invalid.";
        } else {
            const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
            const emailDomain = formData.adopter_email.split("@")[1]?.toLowerCase();

            if (!allowedDomains.includes(emailDomain)) {
                newErrors.adopter_email = "Te rugăm să folosești un provider valid precum gmail.com, yahoo.com sau outlook.com.";
            }
        }

        if (!notifyOnly) {
            if (!formData.adopter_first_name?.trim()) {
                newErrors.adopter_first_name = "Prenumele este obligatoriu.";
            }
            if (!formData.adopter_last_name?.trim()) {
                newErrors.adopter_last_name = "Numele este obligatoriu.";
            }
            const phoneRegex = /^[0-9+\-\(\)\s]*$/;

            if (!formData.adopter_phone_number?.trim()) {
                newErrors.adopter_phone_number = "Numărul de telefon este obligatoriu.";
            } else if (!phoneRegex.test(formData.adopter_phone_number.trim())) {
                newErrors.adopter_phone_number = "Numărul poate conține doar cifre, +, -, spații și paranteze.";
            } else if (
                formData.adopter_phone_number.trim().length < 10 ||
                formData.adopter_phone_number.trim().length > 15
            ) {
                newErrors.adopter_phone_number = "Numărul trebuie să aibă între 10 și 15 caractere.";
            }

            if (!formData.pickup_datetime) {
                newErrors.pickup_datetime = "Selectează ziua și ora.";
            } else {
                const selectedDate = new Date(formData.pickup_datetime);
                const now = new Date();

                if (selectedDate < now) {
                    newErrors.pickup_datetime = "Data și ora trebuie să fie în viitor.";
                }
            }
        }

        return newErrors;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;

        let formattedValue = value;

        if (name === "adopter_email") {
            formattedValue = lowercase(value);
        }

        if (name === "adopter_first_name" || name === "adopter_last_name") {
            formattedValue = capitalizeWords(value);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            if (notifyOnly) {
                await axios.post(`${SERVER_URL}/notify-requests`, {
                    email: formData.adopter_email,
                    animalId,
                });
                alert("Cererea ta a fost trimisă cu succes. Vei fi notificat când animalul este disponibil.");
            } else {
                if (!animalId) {
                    console.error("AnimalId is undefined or null");
                    alert("Ceva nu a funcționat. Încearcă din nou.");
                    return;
                }

                await axios.post(`${SERVER_URL}/adoption-requests`, {
                    adopter_first_name: formData.adopter_first_name,
                    adopter_last_name: formData.adopter_last_name,
                    adopter_email: formData.adopter_email,
                    adopter_phone_number: formData.adopter_phone_number,
                    message: formData.message,
                    pickup_datetime: formData.pickup_datetime,
                    animalId,
                });


                await axios.put(`${SERVER_URL}/pets/${animalId}`, {
                    adoption_status: ADOPTION_STATUSES.REZERVAT
                });
            }

            setFormData(initialForm);
            setErrors({});
            setOpen(false);
            navigate("/pets");

        } catch (error) {
            console.error("Error: ", error);
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            alert(errorMsg);
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>
                {notifyOnly ? "Anunță-mă când este disponibil" : "Completează formularul pentru a rezerva animalul"}
            </DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <TextField
                    label="Email"
                    name="adopter_email"
                    type="email"
                    value={formData.adopter_email || ""}
                    onChange={handleChange}
                    error={!!errors.adopter_email}
                    helperText={errors.adopter_email}
                    required
                    fullWidth
                />

                {!notifyOnly && (
                    <>
                        <TextField
                            label="Prenume"
                            name="adopter_first_name"
                            value={formData.adopter_first_name}
                            onChange={handleChange}
                            error={!!errors.adopter_first_name}
                            helperText={errors.adopter_first_name}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Nume"
                            name="adopter_last_name"
                            value={formData.adopter_last_name}
                            onChange={handleChange}
                            error={!!errors.adopter_last_name}
                            helperText={errors.adopter_last_name}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Număr de telefon"
                            name="adopter_phone_number"
                            type="tel"
                            value={formData.adopter_phone_number}
                            onChange={handleChange}
                            error={!!errors.adopter_phone_number}
                            helperText={errors.adopter_phone_number}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Mesaj (opțional)"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <TextField
                            label="Data și ora ridicării"
                            name="pickup_datetime"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={formData.pickup_datetime}
                            onChange={handleChange}
                            error={!!errors.pickup_datetime}
                            helperText={errors.pickup_datetime}
                            required
                            fullWidth
                        />
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    sx={{
                        color: "var(--color-primary)",
                        "&:hover": {
                            color: "var(--color-primary-hover)"
                        }
                    }}
                    onClick={() => setOpen(false)}>Renunță</Button>
                <Button variant="contained"
                    sx={{
                        backgroundColor: "var(--color-primary)",
                        "&:hover": {
                            backgroundColor: "var(--color-primary-hover)"
                        }
                    }}
                    onClick={handleSubmit}>
                    {notifyOnly ? "Trimite email" : "Trimite formular"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdoptModal;
