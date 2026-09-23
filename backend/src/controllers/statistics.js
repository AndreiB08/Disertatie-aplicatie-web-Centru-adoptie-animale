import { Animal } from "../models/animal.js";
import { Op } from "sequelize";

export const getStatistics = async (req, res) => {
  try {
    const totalAnimals = await Animal.count();

    const adoptedAnimals = await Animal.count({
      where: { adoption_status: "Adoptat" },
    });

    const treatedAnimals = await Animal.count({
      where: { health_status: "Sănătos" },
    });

    res.json({
      animalsRescued: totalAnimals,
      animalsAdopted: adoptedAnimals,
      medicalTreatments: treatedAnimals,
      educationalEvents: 20,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Server error" });
  }
};
