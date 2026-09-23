import { Contact } from "../models/contact.js";

export const seedContact = async () => {
    const count = await Contact.count();
    if (count > 0) return console.log("Contact messages already exist");

    await Contact.create({
        name: "Radu Ionescu",
        email: "radu.ionescu@gmail.com",
        message: "Mesaj test.",
    });
    console.log("Contact messages seeded");
};
