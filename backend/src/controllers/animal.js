import { db, storage } from "../config/firebase.js";
import { validate as isUUID, v4 as uuidv4 } from "uuid";

const animalsCollection = db.collection("animals");

const uploadImage = async (file, animalId) => {
    if (!file) {
        return null;
    }

    const extension = file.originalname.split(".").pop().toLowerCase();
    const imagePath = `animals/${animalId}/image.${extension}`;
    const downloadToken = uuidv4();

    const imageFile = storage.file(imagePath);

    await imageFile.save(file.buffer, {
        metadata: {
            contentType: file.mimetype,
            metadata: {
                firebaseStorageDownloadTokens: downloadToken
            }
        }
    });

    const imageUrl =
        `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/` +
        `${encodeURIComponent(imagePath)}?alt=media&token=${downloadToken}`;

    return {
        imageUrl,
        imagePath
    };
};

const deleteImage = async (imagePath) => {
    if (!imagePath) {
        return;
    }

    try {
        await storage.file(imagePath).delete();
    } catch (error) {
        if (error.code !== 404) {
            throw error;
        }
    }
};

export const getAnimals = async (_req, res) => {
    try {
        const snapshot = await animalsCollection.get();

        if (snapshot.empty) {
            return res.status(404).json({
                message: "No animals found."
            });
        }

        const animals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json({ animals });
    } catch (err) {
        console.error("Error fetching animals:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

export const getAnimalById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                message: "Invalid animal ID"
            });
        }

        const doc = await animalsCollection.doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                message: "Animal not found"
            });
        }

        res.status(200).json({
            id: doc.id,
            ...doc.data()
        });
    } catch (err) {
        console.error("Error fetching animal by ID:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

export const addAnimal = async (req, res) => {
    try {
        const animal = req.body;

        const requiredFields = [
            "name",
            "species",
            "breed",
            "age",
            "gender",
            "size",
            "health_status",
            "arrival_date"
        ];

        const missingFields = requiredFields.filter(
            field =>
                animal[field] === undefined ||
                animal[field] === null ||
                animal[field] === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Animal image is required."
            });
        }

        const age = Number(animal.age);

        if (isNaN(age) || age < 0) {
            return res.status(400).json({
                message: "Age must be a positive number"
            });
        }

        if (isNaN(Date.parse(animal.arrival_date))) {
            return res.status(400).json({
                message: "Invalid date format for arrival_date"
            });
        }

        const id = uuidv4();

        const image = await uploadImage(req.file, id);

        const now = new Date().toISOString();

        const animalData = {
            name: animal.name,
            species: animal.species,
            breed: animal.breed,
            microchip_number: animal.microchip_number || null,

            age,
            gender: animal.gender,
            size: animal.size,
            color: animal.color || "",

            health_status: animal.health_status,
            vaccinated:
                animal.vaccinated === "true" ||
                animal.vaccinated === true,
            sterilized:
                animal.sterilized === "true" ||
                animal.sterilized === true,

            adoption_status: animal.adoption_status || "Disponibil",
            arrival_date: animal.arrival_date,
            notes: animal.notes || null,

            imageUrl: image.imageUrl,
            imagePath: image.imagePath,

            createdAt: now,
            updatedAt: now
        };

        await animalsCollection.doc(id).set(animalData);

        res.status(201).json({
            message: "Animal added successfully",
            animal: {
                id,
                ...animalData
            }
        });
    } catch (err) {
        console.error("Error adding animal:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

export const updateAnimal = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                message: "Invalid animal ID"
            });
        }

        const animalRef = animalsCollection.doc(id);
        const animalSnapshot = await animalRef.get();

        if (!animalSnapshot.exists) {
            return res.status(404).json({
                message: "Animal not found"
            });
        }

        const currentAnimal = animalSnapshot.data();

        const allowedFields = [
            "name",
            "species",
            "breed",
            "microchip_number",
            "age",
            "gender",
            "size",
            "color",
            "health_status",
            "vaccinated",
            "sterilized",
            "adoption_status",
            "arrival_date",
            "notes"
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (field in req.body) {
                updateData[field] = req.body[field];
            }
        }

        if ("age" in updateData) {
            updateData.age = Number(updateData.age);

            if (isNaN(updateData.age) || updateData.age < 0) {
                return res.status(400).json({
                    message: "Age must be a positive number"
                });
            }
        }

        if (
            "arrival_date" in updateData &&
            isNaN(Date.parse(updateData.arrival_date))
        ) {
            return res.status(400).json({
                message: "Invalid arrival_date format"
            });
        }

        if ("vaccinated" in updateData) {
            updateData.vaccinated =
                updateData.vaccinated === "true" ||
                updateData.vaccinated === true;
        }

        if ("sterilized" in updateData) {
            updateData.sterilized =
                updateData.sterilized === "true" ||
                updateData.sterilized === true;
        }

        if (req.file) {
            const image = await uploadImage(req.file, id);

            if (currentAnimal.imagePath) {
                await deleteImage(currentAnimal.imagePath);
            }

            updateData.imageUrl = image.imageUrl;
            updateData.imagePath = image.imagePath;
        }

        updateData.updatedAt = new Date().toISOString();

        await animalRef.update(updateData);

        const updatedSnapshot = await animalRef.get();

        res.status(200).json({
            message: "Animal updated successfully",
            animal: {
                id: updatedSnapshot.id,
                ...updatedSnapshot.data()
            }
        });
    } catch (err) {
        console.error("Error updating animal:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

export const deleteAnimal = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                message: "Invalid animal ID"
            });
        }

        const animalRef = animalsCollection.doc(id);
        const animalSnapshot = await animalRef.get();

        if (!animalSnapshot.exists) {
            return res.status(404).json({
                message: "Animal not found"
            });
        }

        const animal = animalSnapshot.data();

        if (animal.imagePath) {
            await deleteImage(animal.imagePath);
        }

        await animalRef.delete();

        res.status(200).json({
            message: `Animal with ID ${id} deleted successfully`
        });
    } catch (err) {
        console.error("Error deleting animal:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};