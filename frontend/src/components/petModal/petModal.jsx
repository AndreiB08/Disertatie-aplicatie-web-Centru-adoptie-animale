import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Select, MenuItem, InputLabel, FormControl, FormHelperText
} from "@mui/material";
import { formatAnimalData, validateAnimalData } from "../../utils/formHelpers";
import { SPECIES, GENDERS, SIZES, HEALTH_STATUSES, ADOPTION_STATUSES } from "../../../../backend/src/constants/enums";
import { SERVER_URL } from "../../constants/server_url.js";

const initialForm = {
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    color: "",
    health_status: "",
    vaccinated: false,
    sterilized: false,
    adoption_status: "",
    arrival_date: new Date().toISOString().split("T")[0],
    notes: "",
    image: "",
    microchip_number: ""
};

const PetModal = ({ open, handleClose, onSaved, initialData = null }) => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm(initialForm);
        }
        setErrors({});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === "checkbox" ? checked : value;

        setForm((prev) => ({
            ...prev,
            [name]: name === "age"
                ? (() => {
                    const number = parseInt(finalValue);
                    return isNaN(number) || number <= 0 ? "" : number;
                })()
                : finalValue,
        }));
    };

    const handleSubmit = async () => {
        const newErrors = validateAnimalData(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const formattedData = formatAnimalData(form);
            const token = localStorage.getItem("token");

            if (initialData && initialData.id) {
                await axios.put(`${SERVER_URL}/pets/${initialData.id}`, formattedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${SERVER_URL}/pets`, formattedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            onSaved();
            handleClose();
            setForm(initialForm);
            setErrors({});
        } catch (err) {
            if (err.response) {
                console.error("Răspuns de la server:", err.response.data);
            }
            console.error("Eroare la salvare animal:", err);
            alert("Eroare la salvare.");
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>{initialData ? "Editează animal" : "Adaugă animal nou"}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, overflowY: 'visible' }}>
                <TextField
                    label="Nume"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth error={!!errors.species}>
                    <InputLabel id="species-label">Specie</InputLabel>
                    <Select
                        labelId="species-label"
                        name="species"
                        value={form.species}
                        onChange={handleChange}
                        label="Specie"
                    >
                        {Object.values(SPECIES).map((specie) => (
                            <MenuItem key={specie} value={specie}>{specie}</MenuItem>
                        ))}
                    </Select>
                    {errors.species && <FormHelperText>{errors.species}</FormHelperText>}
                </FormControl>

                <TextField label="Rasă" name="breed" value={form.breed} onChange={handleChange} error={!!errors.breed} helperText={errors.breed} fullWidth />
                <TextField label="Vârstă" name="age" type="number" value={form.age} onChange={handleChange} error={!!errors.age} helperText={errors.age} fullWidth />

                <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel id="gender-label">Gen</InputLabel>
                    <Select
                        labelId="gender-label"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        label="Gen"
                    >
                        {Object.values(GENDERS).map((gender) => (
                            <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                        ))}
                    </Select>
                    {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.size}>
                    <InputLabel id="size-label">Dimensiune</InputLabel>
                    <Select
                        labelId="size-label"
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        label="Dimensiune"
                    >
                        {Object.values(SIZES).map((size) => (
                            <MenuItem key={size} value={size}>{size}</MenuItem>
                        ))}
                    </Select>
                    {errors.size && <FormHelperText>{errors.size}</FormHelperText>}
                </FormControl>

                <TextField label="Culoare" name="color" value={form.color} onChange={handleChange} error={!!errors.color} helperText={errors.color} fullWidth />

                <FormControl fullWidth error={!!errors.health_status}>
                    <InputLabel id="health-status-label">Status sănătate</InputLabel>
                    <Select
                        labelId="health-status-label"
                        name="health_status"
                        value={form.health_status}
                        onChange={handleChange}
                        label="Status sănătate"
                    >
                        {Object.values(HEALTH_STATUSES).map((health_status) => (
                            <MenuItem key={health_status} value={health_status}>{health_status}</MenuItem>
                        ))}
                    </Select>
                    {errors.health_status && <FormHelperText>{errors.health_status}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.adoption_status}>
                    <InputLabel id="adoption-status-label">Status adopție</InputLabel>
                    <Select
                        labelId="adoption-status-label"
                        name="adoption_status"
                        value={form.adoption_status}
                        onChange={handleChange}
                        label="Status adopție"
                    >
                        {Object.values(ADOPTION_STATUSES).map((adoption_status) => (
                            <MenuItem key={adoption_status} value={adoption_status}>{adoption_status}</MenuItem>
                        ))}
                    </Select>
                    {errors.adoption_status && <FormHelperText>{errors.adoption_status}</FormHelperText>}
                </FormControl>

                <TextField label="Data sosirii" name="arrival_date" type="date" value={form.arrival_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.arrival_date} helperText={errors.arrival_date} fullWidth />

                <TextField label="Descriere" name="notes" value={form.notes} onChange={handleChange} fullWidth multiline rows={3} />
                <TextField label="URL poză" name="image" value={form.image} onChange={handleChange} error={!!errors.image} helperText={errors.image} fullWidth />

                <TextField label="Număr microcip" name="microchip_number" value={form.microchip_number} onChange={handleChange} error={!!errors.microchip_number} helperText={errors.microchip_number} fullWidth />

                <label>
                    <input type="checkbox" name="vaccinated" checked={form.vaccinated} onChange={handleChange} />
                    &nbsp; Vaccinat
                </label>
                <label>
                    <input type="checkbox" name="sterilized" checked={form.sterilized} onChange={handleChange} />
                    &nbsp; Sterilizat
                </label>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Anulează</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {initialData ? "Salvează modificările" : "Salvează"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PetModal;
