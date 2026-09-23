import { NotifyRequest } from "../models/notifyRequest.js";
import { Animal } from "../models/animal.js";

export const seedNotificationRequests = async () => {
  const count = await NotifyRequest.count();
  if (count > 0) return console.log("Notification requests already exist");

  const animal = await Animal.findOne({ where: { name: "Spots" } });

  if (!animal) {
    return console.warn("Animal named 'Spots' not found for notification requests");
  }

  await NotifyRequest.create({
    email: "andrei.buzagiu@gmail.com",
    animalId: animal.id,
  });

  console.log("Notification request for Spots added");
};
