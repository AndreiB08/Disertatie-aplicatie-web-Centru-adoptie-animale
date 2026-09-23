import { AdoptionRequest } from "../models/adoptionRequest.js";
import { Animal } from "../models/animal.js";

export const seedAdoptionRequests = async () => {
  const count = await AdoptionRequest.count();
  if (count > 0) return console.log("Adoption requests already exist");

  const names = ["Kiwi", "Oscar", "Zara", "Coco", "Spots"];

  const animalsByName = await Animal.findAll({
    where: { name: names }
  });

  const getId = (name) => animalsByName.find(a => a.name === name)?.id;

  const adoptionRequests = [
    {
      adopter_first_name: "Mara",
      adopter_last_name: "Popescu",
      adopter_email: "mara.popescu@gmail.com",
      adopter_phone_number: "0721345678",
      message: "",
      pickup_datetime: "2025-04-19T16:20:00",
      approved: true,
      animalId: getId("Kiwi")
    },
    {
      adopter_first_name: "Alexandru",
      adopter_last_name: "Ionescu",
      adopter_email: "alex.ionescu@yahoo.com",
      adopter_phone_number: "0749988776",
      message: "",
      pickup_datetime: "2025-04-26T16:20:00",
      approved: true,
      animalId: getId("Oscar")
    },
    {
      adopter_first_name: "Ioana",
      adopter_last_name: "Dinu",
      adopter_email: "ioana.dinu@outlook.com",
      adopter_phone_number: "0755123123",
      message: "",
      pickup_datetime: "2025-04-30T16:20:00",
      approved: true,
      animalId: getId("Zara")
    },
    {
      adopter_first_name: "Vlad",
      adopter_last_name: "Enache",
      adopter_email: "vlad.enache@mail.com",
      adopter_phone_number: "0767432789",
      message: "",
      pickup_datetime: "2025-04-29T16:21:00",
      approved: false,
      animalId: getId("Coco")
    },
    {
      adopter_first_name: "Cristina",
      adopter_last_name: "Radu",
      adopter_email: "cristina.radu@protonmail.com",
      adopter_phone_number: "0733772211",
      message: "",
      pickup_datetime: "2025-04-29T16:20:00",
      approved: false,
      animalId: getId("Spots")
    }
  ];

  await AdoptionRequest.bulkCreate(adoptionRequests);
  console.log("Adoption requests seeded");
};