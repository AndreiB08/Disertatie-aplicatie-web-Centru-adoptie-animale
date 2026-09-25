import { db } from "../config/firebase.js";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        // Salvăm mesajul în Firestore
        await db.collection("contacts").add({
            name: name.trim(),
            email: normalizedEmail,
            message: message.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Trimitem notificarea către administrator
        try {
            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: process.env.GMAIL_USER,
                subject: `Mesaj nou de contact de la ${name.trim()}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f7f7f7; padding: 20px;">
                        <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

                            <h2 style="color: #437f83;">
                                Mesaj nou primit 📩
                            </h2>

                            <p>
                                Ai primit un mesaj nou prin formularul de contact.
                            </p>

                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />

                            <p>
                                <strong>Nume:</strong> ${name.trim()}
                            </p>

                            <p>
                                <strong>Email:</strong> ${normalizedEmail}
                            </p>

                            <p>
                                <strong>Mesaj:</strong>
                            </p>

                            <div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; margin-top: 10px;">
                                ${message.trim()}
                            </div>

                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />

                            <p style="color: #555;">
                                Poți verifica mesajul din
                                <a
                                    href="https://centru-adoptie-animale.vercel.app/admin/dashboard"
                                    style="color: #437f83; font-weight: bold; text-decoration: none;"
                                >
                                    panoul de administrare
                                </a>.
                            </p>

                            <p style="color: #437f83; font-weight: bold;">
                                Centrul de Adopție Animale
                            </p>

                        </div>
                    </div>
                `,
            });

            if (error) {
                console.error(
                    "Eroare la trimiterea emailului de notificare:",
                    error
                );
            } else {
                console.log(
                    `Email de notificare trimis către ${process.env.GMAIL_USER}:`,
                    data?.id
                );
            }
        } catch (emailError) {
            console.error(
                "Eroare la notificarea administratorului:",
                emailError
            );
        }

        res.status(200).json({
            message: "Message received successfully",
        });
    } catch (err) {
        console.error("Error saving message:", err);

        res.status(500).json({
            error: "Server error",
        });
    }
};

export const deleteContact = async (req, res) => {
    const { id } = req.params;

    try {
        const message = await db.collection("contacts").doc(id).get();

        if (!message.exists) {
            return res.status(404).json({
                error: "Message not found",
            });
        }

        await db.collection("contacts").doc(id).delete();

        res.status(204).end();
    } catch (err) {
        console.error("Error deleting message:", err);

        res.status(500).json({
            error: "Server error",
        });
    }
};