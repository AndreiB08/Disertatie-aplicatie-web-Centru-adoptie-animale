import { db } from "../config/firebase.js";

export const getContacts = async (req, res) => {
    try {
        const snapshot = await db
            .collection("contacts")
            .orderBy("createdAt", "desc")
            .get();

        const messages = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
            };
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
        await db.collection("contacts").add({
            name,
            email: email.toLowerCase(),
            message,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        res.status(200).json({ message: 'Message received successfully' });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteContact = async (req, res) => {
    const { id } = req.params;
    try {
        const message = await db.collection("contacts").doc(id).get();
        if (!message.exists) {
            return res.status(404).json({ error: "Message not found" });
        }
        await db.collection("contacts").doc(id).delete();
        res.status(204).end();
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ error: "Server error" });
    }
};