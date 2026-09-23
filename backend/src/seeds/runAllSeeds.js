import { seedAnimals } from "./seedAnimals.js";
import { seedEmployees } from "./seedEmployees.js";
import { seedAdoptionRequests } from "./seedAdoptionRequests.js";
import { seedNotificationRequests } from "./seedNotificationRequests.js";
import { seedContact } from "./seedContacts.js";


export const runAllSeeds = async () => {
  try {
    console.log("Starting seed process...");
    await Promise.all([
      seedEmployees(),
      seedAnimals(),
      seedAdoptionRequests(),
      seedNotificationRequests(),
      seedContact(),
    ]);
  } catch (err) {
    console.error("Error running seeds:", err);
  }
};