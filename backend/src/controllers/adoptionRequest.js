import { db } from "../config/firebase.js";
import { ADOPTION_STATUSES } from "../constants/enums.js";
import { validate as isUUID, v4 as uuidv4 } from "uuid";

const adoptionRequestsCollection = db.collection("adoption_requests");
const animalsCollection = db.collection("animals");

export const addAdoptionRequest = async (req, res) => {
    try {
        const {
            adopter_first_name,
            adopter_last_name,
            adopter_email,
            adopter_phone_number,
            message,
            pickup_datetime,
            animalId,
        } = req.body;

        if (
            !adopter_first_name ||
            !adopter_last_name ||
            !adopter_email ||
            !adopter_phone_number ||
            !pickup_datetime ||
            !animalId
        ) {
            return res.status(400).json({
                message:
                    "Missing required fields: name, email, phone, pickupDateTime, and animalId are mandatory.",
            });
        }

        if (!isUUID(animalId)) {
            return res.status(400).json({
                message: "Invalid animal ID.",
            });
        }

        if (isNaN(Date.parse(pickup_datetime))) {
            return res.status(400).json({
                message: "Invalid pickup date time.",
            });
        }

        const email = adopter_email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format.",
            });
        }

        // Verificăm dacă animalul există în Firestore
        const animalRef = animalsCollection.doc(animalId);
        const animalSnapshot = await animalRef.get();

        if (!animalSnapshot.exists) {
            return res.status(404).json({
                message: "Animal not found.",
            });
        }

        // Verificăm numărul de cereri pending pentru aceeași persoană
        const pendingSnapshot = await adoptionRequestsCollection
            .where("approved", "==", false)
            .get();

        const existingRequests = pendingSnapshot.docs.filter((doc) => {
            const request = doc.data();

            return (
                request.adopter_first_name === adopter_first_name.trim() &&
                request.adopter_last_name === adopter_last_name.trim() &&
                request.adopter_email === email
            );
        });

        if (existingRequests.length >= 5) {
            return res.status(400).json({
                message:
                    "Nu poți avea mai mult de 5 cereri de adopție în așteptare.",
            });
        }

        const requestRef = adoptionRequestsCollection.doc(uuidv4());

        const newRequest = {
            adopter_first_name: adopter_first_name.trim(),
            adopter_last_name: adopter_last_name.trim(),
            adopter_email: email,
            adopter_phone_number: adopter_phone_number.trim(),
            message: message?.trim() || null,
            pickup_datetime: new Date(pickup_datetime).toISOString(),
            animalId,
            approved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await requestRef.set(newRequest);

        // După trimiterea cererii, animalul devine rezervat
        await animalRef.update({
            adoption_status: ADOPTION_STATUSES.REZERVAT,
            updatedAt: new Date().toISOString(),
        });

        return res.status(201).json({
            message: "Adoption request saved successfully.",
            request: newRequest,
        });
    } catch (err) {
        console.error("Error saving adoption request:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

export const getAllRequests = async (req, res) => {
    try {
        const snapshot = await adoptionRequestsCollection.get();

        const requests = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const request = {
                    id: doc.id,
                    ...doc.data(),
                };

                let animal = null;

                if (request.animalId) {
                    const animalSnapshot = await animalsCollection
                        .doc(request.animalId)
                        .get();

                    if (animalSnapshot.exists) {
                        const animalData = animalSnapshot.data();

                        animal = {
                            name: animalData.name,
                            species: animalData.species,
                        };
                    }
                }

                return {
                    ...request,
                    animal,
                };
            })
        );

        requests.sort(
            (a, b) =>
                new Date(a.pickup_datetime) -
                new Date(b.pickup_datetime)
        );

        return res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching adoption requests:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const requestRef = adoptionRequestsCollection.doc(id);
        const requestSnapshot = await requestRef.get();

        if (!requestSnapshot.exists) {
            return res.status(404).json({
                message: "Request not found.",
            });
        }

        const request = requestSnapshot.data();

        if (request.animalId) {
            const animalRef = animalsCollection.doc(request.animalId);
            const animalSnapshot = await animalRef.get();

            if (animalSnapshot.exists) {
                await animalRef.update({
                    adoption_status: ADOPTION_STATUSES.ADOPTAT,
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        await requestRef.update({
            approved: true,
            updatedAt: new Date().toISOString(),
        });

        return res.status(200).json({
            message: "Request approved successfully.",
        });
    } catch (err) {
        console.error("Error approving request:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

export const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const requestRef = adoptionRequestsCollection.doc(id);
        const requestSnapshot = await requestRef.get();

        if (!requestSnapshot.exists) {
            return res.status(404).json({
                message: "Request not found.",
            });
        }

        const request = requestSnapshot.data();

        // Marcăm animalul ca disponibil în Firestore
        if (request.animalId) {
            const animalRef = animalsCollection.doc(request.animalId);
            const animalSnapshot = await animalRef.get();

            if (animalSnapshot.exists) {
                await animalRef.update({
                    adoption_status: ADOPTION_STATUSES.DISPONIBIL,
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        // Ștergem cererea
        await requestRef.delete();

        return res.status(200).json({
            message:
                "Request deleted and animal marked as available.",
        });
    } catch (err) {
        console.error("Error deleting request:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};