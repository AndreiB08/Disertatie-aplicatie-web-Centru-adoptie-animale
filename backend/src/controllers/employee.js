import { getAuth } from "firebase-admin/auth";
import { db, default as firebaseApp } from "../config/firebase.js";
import { EMPLOYEE_ROLES } from "../constants/enums.js";

const adminAuth = getAuth(firebaseApp);
const employeesCollection = db.collection("employees");

const DEFAULT_PASSWORD = "CentruAdoptie";

const employeeData = (id, data) => ({
    id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone_number: data.phone_number,
    role: data.role,
    mustChangePassword: data.mustChangePassword ?? false,
});

export const getEmployee = async (req, res) => {
    try {
        if (!req.employee?.id) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const employeeRef = employeesCollection.doc(req.employee.id);
        const employeeDoc = await employeeRef.get();

        if (!employeeDoc.exists) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        return res.status(200).json(
            employeeData(employeeDoc.id, employeeDoc.data())
        );

    } catch (error) {
        console.error("Error in getEmployee:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const snapshot = await employeesCollection.get();

        const employees = snapshot.docs.map((doc) =>
            employeeData(doc.id, doc.data())
        );

        return res.status(200).json({ employees });

    } catch (error) {
        console.error("Get employees error:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone_number,
            role
        } = req.body;

        if (req.employee.role !== EMPLOYEE_ROLES.ADMIN) {
            return res.status(403).json({
                message: "Only administrators can add employees."
            });
        }

        if (!first_name || !last_name || !email || !phone_number || !role) {
            return res.status(400).json({
                message: "All required fields must be filled in."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Email invalid sau lipsește."
            });
        }

        if (!Object.values(EMPLOYEE_ROLES).includes(role)) {
            return res.status(400).json({
                message: "Rol invalid."
            });
        }

        if (
            !/^[0-9+\-()\s]*$/.test(phone_number.trim()) ||
            phone_number.trim().length < 10 ||
            phone_number.trim().length > 15
        ) {
            return res.status(400).json({
                message: "Număr de telefon invalid."
            });
        }

        // Verificăm dacă email-ul există deja în Firebase Authentication
        try {
            await adminAuth.getUserByEmail(normalizedEmail);

            return res.status(400).json({
                message: "Email este deja folosit."
            });

        } catch (error) {
            if (error.code !== "auth/user-not-found") {
                throw error;
            }
        }

        // Verificăm dacă numărul de telefon există deja în Firestore
        const phoneSnapshot = await employeesCollection
            .where("phone_number", "==", phone_number.trim())
            .limit(1)
            .get();

        if (!phoneSnapshot.empty) {
            return res.status(400).json({
                message: "Numărul de telefon este deja folosit."
            });
        }

        // Creăm utilizatorul în Firebase Authentication
        const userRecord = await adminAuth.createUser({
            email: normalizedEmail,
            password: DEFAULT_PASSWORD
        });

        try {
            // Creăm profilul angajatului în Firestore
            await employeesCollection.doc(userRecord.uid).set({
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                email: normalizedEmail,
                phone_number: phone_number.trim(),
                role,
                mustChangePassword: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        } catch (firestoreError) {
            // Dacă Firestore eșuează, ștergem utilizatorul creat în Auth
            await adminAuth.deleteUser(userRecord.uid);
            throw firestoreError;
        }

        return res.status(201).json({
            message: "Employee created successfully.",
            employee: {
                id: userRecord.uid,
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                email: normalizedEmail,
                phone_number: phone_number.trim(),
                role,
                mustChangePassword: true
            }
        });

    } catch (error) {
        console.error("Create employee error:", error);

        return res.status(500).json({
            message: "Internal error while creating employee."
        });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id || req.employee?.id;

        if (!employeeId) {
            return res.status(400).json({
                message: "Employee ID is required."
            });
        }

        const employeeRef = employeesCollection.doc(employeeId);
        const employeeDoc = await employeeRef.get();

        if (!employeeDoc.exists) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        const currentData = employeeDoc.data();

        const isSelf = req.employee.id === employeeId;
        const isAdmin = req.employee.role === EMPLOYEE_ROLES.ADMIN;

        if (!isSelf && !isAdmin) {
            return res.status(403).json({
                message: "You are not authorized to update this employee."
            });
        }

        const {
            first_name,
            last_name,
            email,
            phone_number,
            role,
            password
        } = req.body;

        const updates = {
            updatedAt: new Date().toISOString()
        };

        if (first_name) {
            updates.first_name = first_name.trim();
        }

        if (last_name) {
            updates.last_name = last_name.trim();
        }

        if (email && email.trim().toLowerCase() !== currentData.email) {
            const normalizedEmail = email.trim().toLowerCase();

            try {
                const existingUser = await adminAuth.getUserByEmail(normalizedEmail);

                if (existingUser.uid !== employeeId) {
                    return res.status(400).json({
                        message: "Email-ul este deja folosit de alt utilizator."
                    });
                }

            } catch (error) {
                if (error.code !== "auth/user-not-found") {
                    throw error;
                }
            }

            await adminAuth.updateUser(employeeId, {
                email: normalizedEmail
            });

            updates.email = normalizedEmail;
        }

        if (phone_number && phone_number.trim() !== currentData.phone_number) {
            const normalizedPhone = phone_number.trim();

            const existingPhone = await employeesCollection
                .where("phone_number", "==", normalizedPhone)
                .limit(1)
                .get();

            if (!existingPhone.empty && existingPhone.docs[0].id !== employeeId) {
                return res.status(400).json({
                    message: "Numărul de telefon este deja folosit de alt utilizator."
                });
            }

            updates.phone_number = normalizedPhone;
        }

        if (role && isAdmin) {
            if (!Object.values(EMPLOYEE_ROLES).includes(role)) {
                return res.status(400).json({
                    message: "Rol invalid."
                });
            }

            updates.role = role;
        }

        if (password && password.trim() !== "") {
            await adminAuth.updateUser(employeeId, {
                password: password.trim()
            });

            updates.mustChangePassword = false;
        }

        await employeeRef.update(updates);

        const updatedDoc = await employeeRef.get();

        return res.status(200).json({
            message: "Employee updated successfully.",
            employee: employeeData(
                updatedDoc.id,
                updatedDoc.data()
            )
        });

    } catch (error) {
        console.error("Update employee error:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};

export const deleteEmployee = async (req, res) => {
    const targetId = req.params.id;
    const currentUserId = req.employee?.id;

    try {
        if (String(targetId) === String(currentUserId)) {
            return res.status(403).json({
                message: "You cannot delete your own account."
            });
        }

        const employeeRef = employeesCollection.doc(targetId);
        const employeeDoc = await employeeRef.get();

        if (!employeeDoc.exists) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        await adminAuth.deleteUser(targetId);
        await employeeRef.delete();

        return res.json({
            message: "Employee deleted successfully."
        });

    } catch (error) {
        console.error("Delete employee error:", error);

        return res.status(500).json({
            message: "Internal error while deleting employee."
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const employeeId = req.employee?.id;
        const { password } = req.body;

        if (!employeeId) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: "Parola trebuie să aibă cel puțin 8 caractere."
            });
        }

        await adminAuth.updateUser(employeeId, {
            password
        });

        await employeesCollection.doc(employeeId).update({
            mustChangePassword: false,
            updatedAt: new Date().toISOString()
        });

        return res.status(200).json({
            message: "Parola a fost schimbată cu succes."
        });

    } catch (error) {
        console.error("Change password error:", error);

        return res.status(500).json({
            message: "Nu s-a putut schimba parola."
        });
    }
};