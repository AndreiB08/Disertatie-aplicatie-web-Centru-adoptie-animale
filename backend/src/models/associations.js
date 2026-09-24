import { Animal } from "./animal.js";
import { NotifyRequest } from "./notifyRequest.js";

// --- Notification Requests relationships ---
NotifyRequest.belongsTo(Animal, {
    foreignKey: "animalId",
    onDelete: "CASCADE"
});

Animal.hasMany(NotifyRequest, {
    foreignKey: "animalId",
    as: "notify_requests"
});