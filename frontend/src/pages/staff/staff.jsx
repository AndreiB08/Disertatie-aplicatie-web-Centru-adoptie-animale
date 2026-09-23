import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StaffModal from "../../components/staffModal/staffModal";
import { Pagination, TextField, MenuItem, Button } from "@mui/material";
import { SERVER_URL } from "../../constants/server_url";
import './Staff.css';
import { EMPLOYEE_ROLES } from "../../../../backend/src/constants/enums";

const Staff = () => {
    const [employees, setEmployees] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("id");
    const itemsPerPage = 8;

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== EMPLOYEE_ROLES.ADMIN) {
            navigate("*");
            return;
        }

        fetchEmployees();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [nameFilter, emailFilter, roleFilter, employees]);

    const fetchEmployees = () => {
        const token = localStorage.getItem("token");

        axios.get(`${SERVER_URL}/employees`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                const sorted = (res.data.employees || []).sort((a, b) => {
                    const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
                    const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                setEmployees(sorted);
                setFiltered(sorted);
            })
            .catch((err) => console.error("Error fetching employees: ", err));
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");

            if (id.toString() === currentUserId?.toString()) {
                alert("Nu poți șterge propriul cont.");
                return;
            }

            const confirm = window.confirm("Ești sigur că vrei să ștergi acest");
            if (!confirm) return;

            await axios.delete(`${SERVER_URL}/employees/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            fetchEmployees();
        } catch (err) {
            console.error("Error deleting employee:", err);
            alert("Error deleting employee.");
        }
    };

    const applyFilters = () => {
        let result = employees;

        if (nameFilter) {
            result = result.filter(emp =>
                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        if (emailFilter) {
            result = result.filter(emp =>
                emp.email.toLowerCase().includes(emailFilter.toLowerCase())
            );
        }

        if (roleFilter) {
            result = result.filter(emp => emp.role === roleFilter);
        }

        setPage(1);
        setFiltered(result);
    };

    const handleResetFilters = () => {
        setNameFilter("");
        setEmailFilter("");
        setRoleFilter("");
        setFiltered(employees);
        setPage(1);
    };

    const openEditModal = (emp) => {
        setSelectedEmployee(emp);
        setOpenModal(true);
    };

    const closeEditModal = () => {
        setSelectedEmployee(null);
        setOpenModal(false);
    };

    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className="page">
            <h2 className="title">Gestionează angajați</h2>

            <div className="add-btn-wrapper">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setSelectedEmployee(null);
                        setOpenModal(true);
                    }}
                >
                    Adaugă angajat
                </button>
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    justifyContent: "center",
                    marginTop: "20px",
                    marginBottom: "30px"
                }}
            >
                <TextField
                    label="Caută după nume"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    variant="outlined"
                    sx={{ width: 250 }}
                    inputProps={{ style: { backgroundColor: "white", borderRadius: "12px" } }}
                />

                <TextField
                    label="Caută după email"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    variant="outlined"
                    sx={{ width: 250 }}
                    inputProps={{ style: { backgroundColor: "white", borderRadius: "12px" } }}
                />

                <TextField
                    select
                    label="Caută după rol"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    variant="outlined"
                    sx={{ width: 250 }}
                >
                    <MenuItem value="">Toate rolurile</MenuItem>
                    {Object.values(EMPLOYEE_ROLES).map((role) => (
                        <MenuItem key={role} value={role}>
                            {role}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    onClick={handleResetFilters}
                    variant="outlined"
                    sx={{
                        width: 250,
                        fontWeight: "bold",
                        borderRadius: "12px",
                        color: "var(--color-neutral)",
                        borderColor: "var(--color-neutral)",
                        backgroundColor: "var(--color-background)",
                        "&:hover": {
                            color: "var(--color-neutral-hover)",
                            borderColor: "var(--color-neutral-hover)",
                            backgroundColor: "#ebebeb"
                        }
                    }}
                >
                    Resetează filtrele
                </Button>
            </div>

            {filtered.length === 0 ? (
                <p>Nu s-au găsit angajați care să îndeplinească criteriile.</p>
            ) : (
                <>
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Nume</th>
                                <th>Email</th>
                                <th>Telefon</th>
                                <th>Rol</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((emp) => (
                                <tr key={emp.id}>
                                    <td>{emp.first_name} {emp.last_name}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.phone_number}</td>
                                    <td>{emp.role}</td>
                                    <td className="btn-container">
                                        <button onClick={() => openEditModal(emp)} className="btn btn-edit">Editează</button>
                                        {emp.id.toString() !== currentUserId?.toString() && (
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="btn btn-delete"
                                            >
                                                Șterge
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
                            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
                        </div>
                    )}
                </>
            )}
            <StaffModal
                open={openModal}
                handleClose={closeEditModal}
                employee={selectedEmployee}
                onSaved={fetchEmployees}
                employees={employees}
            />
        </div>
    );
};

export default Staff;
