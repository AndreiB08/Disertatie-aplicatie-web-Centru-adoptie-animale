import { ADOPTION_STATUSES } from "../constants/enums.js";
import { AdoptionRequest } from "../models/adoptionRequest.js";
import { Animal } from "../models/animal.js";

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
                message: "Missing required fields: name, email, phone, pickupDateTime, and animalId are mandatory.",
            });
        }

        if (isNaN(Date.parse(pickup_datetime))) {
            return res.status(400).json({ message: "Invalid pickup date time." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(adopter_email.trim())) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        const existingRequests = await AdoptionRequest.count({
            where: {
                adopter_first_name: adopter_first_name.trim(),
                adopter_last_name: adopter_last_name.trim(),
                adopter_email: adopter_email.trim().toLowerCase(),
                approved: false,
            }
        });

        if (existingRequests >= 5) {
            return res.status(400).json({
                message: "Nu poți avea mai mult de 5 cereri de adopție în așteptare.",
            });
        }

        const newRequest = await AdoptionRequest.create({
            adopter_first_name,
            adopter_last_name,
            adopter_email: adopter_email.trim().toLowerCase(),
            adopter_phone_number,
            message,
            pickup_datetime,
            animalId,
        });

        return res.status(201).json({
            message: "Adoption request saved successfully.",
            request: newRequest,
        });

    } catch (err) {
        console.error("Error saving adoption request:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getAllRequests = async (req, res) => {
    try {
        const requests = await AdoptionRequest.findAll({
            include: {
                model: Animal,
                attributes: ["name", "species"]
            },
            order: [["pickup_datetime", "ASC"]]

        });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching adoption requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const [updatedCount] = await AdoptionRequest.update(
            { approved: true },
            { where: { id } }
        );

        if (updatedCount === 0) {
            return res.status(404).json({ message: "Request not found." });
        }

        return res.status(200).json({ message: "Request approved successfully." });
    } catch (err) {
        console.error("Error approving request:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await AdoptionRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        const animal = await request.getAnimal();
        if (animal) {
            animal.adoption_status = ADOPTION_STATUSES.DISPONIBIL;
            await animal.save();
        }

        await request.destroy();

        res.status(200).json({ message: "Request deleted and animal marked as available." });
    } catch (err) {
        console.error("Error deleting request:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
