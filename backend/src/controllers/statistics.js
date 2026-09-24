import { db } from "../config/firebase.js";

export const getStatistics = async (req, res) => {
  try {
    const snapshot = await db.collection("animals").get();
    const animals = snapshot.docs.map((doc) => doc.data());

    const totalAnimals = animals.length;

    const adoptedAnimals = animals.filter(
      (animal) => animal.adoption_status === "Adoptat"
    ).length;

    const treatedAnimals = animals.filter(
      (animal) => animal.health_status === "Sănătos"
    ).length;

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
