import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button
} from "@mui/material";
import { SERVER_URL } from "../../constants/server_url";
import { EMPLOYEE_ROLES } from "../../../../backend/src/constants/enums";

const StaffModal = ({ open, handleClose, employee = null, onSaved, employees = [] }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: EMPLOYEE_ROLES.ANGAJAT,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email,
        phone: employee.phone_number,
        role: employee.role || EMPLOYEE_ROLES.ANGAJAT,
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: EMPLOYEE_ROLES.ANGAJAT,
      });
    }
  }, [employee]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
  
    const emailTrimmed = formData.email.trim().toLowerCase();
    const phoneTrimmed = formData.phone.trim();
  
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Prenumele este obligatoriu.";
    }
  
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Numele este obligatoriu.";
    }
  
    if (!emailTrimmed) {
      newErrors.email = "Email-ul este obligatoriu.";
    } else if (!/\S+@\S+\.\S+/.test(emailTrimmed)) {
      newErrors.email = "Format email invalid.";
    } else if (!/@(gmail\.com|yahoo\.com|outlook\.com)$/i.test(emailTrimmed)) {
      newErrors.email = "Domain-uri acceptate: gmail.com, yahoo.com, outlook.com.";
    } else if (
      employees.some(
        (emp) => emp.email.toLowerCase() === emailTrimmed && emp.id !== employee?.id
      )
    ) {
      newErrors.email = "Email-ul există deja.";
    }
    if (!phoneTrimmed) {
      newErrors.phone = "Numărul de telefon este obligatoriu.";
    } else if (!/^[0-9+\-\(\)\s]*$/.test(phoneTrimmed)) {
      newErrors.phone = "Numărul de telefon poate conține doar cifre, semnul +, -, spații și paranteze.";
    } else if (phoneTrimmed.length < 10 || phoneTrimmed.length > 15) {
      newErrors.phone = "Numărul trebuie să înceapă cu 07 și să conțină 10-15 cifre.";
    } else if (
      employees.some(
        (emp) => emp.phone_number === phoneTrimmed && emp.id !== employee?.id
      )
    ) {
      newErrors.phone = "Numărul de telefon există deja";
    }
    
    if (!formData.role) {
      newErrors.role = "Selectează un rol.";
    }
    return newErrors;
  };  

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email,
      phone_number: formData.phone,
      role: formData.role,
    };

    if (!employee || !employee.id) {
      payload.password = formData.role === EMPLOYEE_ROLES.ADMIN ? "admin1234" : "staff1234";
    }

    try {
      if (employee && employee.id) {
        await axios.put(`${SERVER_URL}/employees/${employee.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${SERVER_URL}/employees`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      setFormData({ first_name: "", last_name: "", email: "", phone: "", role: EMPLOYEE_ROLES.ANGAJAT });
      setErrors({});
      handleClose();
      onSaved?.();
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="sm">
      <DialogTitle>{employee ? "Editează angajat" : "Adaugă angajat"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, overflow: "visible" }}>
        <TextField
          label="Prenume"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          error={!!errors.first_name}
          helperText={errors.first_name}
          required
          fullWidth
          
        />
        <TextField
          label="Nume"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          error={!!errors.last_name}
          helperText={errors.last_name}
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          required
          fullWidth
        />
        <TextField
          label="Telefon"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
          required
          fullWidth
        />
        <FormControl fullWidth error={!!errors.role}>
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            name="role"
            value={formData.role}
            onChange={handleChange}
            label="Rol"
          >
            <MenuItem value={EMPLOYEE_ROLES.ANGAJAT}>Angajat</MenuItem>
            <MenuItem value={EMPLOYEE_ROLES.ADMIN}>Admin</MenuItem>
          </Select>
          {errors.role && (
            <p style={{ color: "#d32f2f", fontSize: "0.75rem", margin: "3px 14px 0" }}>
              {errors.role}
            </p>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}>Anulează</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {employee ? "Salvează" : "Adaugă"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffModal;
