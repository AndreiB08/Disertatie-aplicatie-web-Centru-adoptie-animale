import { Animal } from "./animal.js";
import { AdoptionRequest } from "./adoptionRequest.js";
import { NotifyRequest } from "./notifyRequest.js";

// --- Adoption Requests relationships ---
AdoptionRequest.belongsTo(Animal, {
    foreignKey: "animalId",
    onDelete: "CASCADE"
});

Animal.hasMany(AdoptionRequest, {
    foreignKey: "animalId",
    as: "adoption_requests"
});

// --- Notification Requests relationships ---
NotifyRequest.belongsTo(Animal, {
    foreignKey: "animalId",
    onDelete: "CASCADE"
});

Animal.hasMany(NotifyRequest, {
    foreignKey: "animalId",
    as: "notify_requests"
});