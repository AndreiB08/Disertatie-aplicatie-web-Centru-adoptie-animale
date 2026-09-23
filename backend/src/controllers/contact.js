import { Contact } from "../models/contact.js";
import { validate as isUUID } from "uuid";

export const getContacts = async (req, res) => {
    try {
        const messages = await Contact.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const addContact = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await Contact.create({ name, email, message });
        res.status(200).json({ message: 'Message received successfully' });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteContact = async (req, res) => {
    const { id } = req.params;
    try {
        const message = await Contact.findByPk(id);
        if (!message) return res.status(404).json({ error: "Message not found" });

        await message.destroy();
        res.status(204).end();
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ error: "Server error" });
    }
};