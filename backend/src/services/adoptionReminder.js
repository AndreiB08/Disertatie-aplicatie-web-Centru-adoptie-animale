import { db } from "../config/firebase.js";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const adoptionRequestsCollection = db.collection("adoption_requests");
const animalsCollection = db.collection("animals");

export const checkAdoptionReminders = async () => {
    try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        const snapshot = await adoptionRequestsCollection
            .where("approved", "==", false)
            .get();

        for (const doc of snapshot.docs) {
            const request = doc.data();

            if (request.reminderSent) {
                continue;
            }

            if (!request.pickup_datetime || !request.adopter_email) {
                continue;
            }

            const pickupDate = new Date(request.pickup_datetime);

            if (Number.isNaN(pickupDate.getTime())) {
                console.error(
                    `Invalid pickup_datetime for request ${doc.id}`
                );
                continue;
            }

            // Trimitem reminderul atunci când ora ridicării
            // este în următoarea oră.
            if (pickupDate > now && pickupDate <= oneHourFromNow) {
                const animalDoc = await animalsCollection
                    .doc(request.animalId)
                    .get();

                const animal = animalDoc.exists
                    ? animalDoc.data()
                    : null;

                const animalName = animal?.name || "animalul";
                const pickupFormatted = pickupDate.toLocaleString("ro-RO", {
                    dateStyle: "long",
                    timeStyle: "short",
                });

                const { data, error } = await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: request.adopter_email,
                    subject: `Reminder: adopția lui ${animalName} este programată în aproximativ o oră 🐾`,
                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 30px;
                            color: #333;
                        ">
                            <h2 style="color: #437f83;">
                                Ne apropiem de momentul întâlnirii! 🐾
                            </h2>

                            <p>
                                Salut, ${request.adopter_first_name}!
                            </p>

                            <p>
                                Îți reamintim că ai programată o vizită
                                pentru adopția lui
                                <strong>${animalName}</strong>
                                în aproximativ o oră.
                            </p>

                            <p>
                                <strong>Data și ora programată:</strong><br>
                                ${pickupFormatted}
                            </p>

                            <p>
                                Te așteptăm la Centrul de Adopție Animale
                                pentru întâlnirea cu
                                <strong>${animalName}</strong>. ❤️
                            </p>

                            <p>
                                Dacă ai nevoie de informații suplimentare,
                                ne poți contacta prin intermediul site-ului.
                            </p>

                            <p style="margin-top: 30px;">
                                Cu drag,<br>
                                <strong>Centrul de Adopție Animale</strong>
                            </p>
                        </div>
                    `,
                });

                if (error) {
                    console.error(
                        `Error sending reminder to ${request.adopter_email}:`,
                        error
                    );
                    continue;
                }

                await doc.ref.update({
                    reminderSent: true,
                    updatedAt: new Date(),
                });

                console.log(
                    `Adoption reminder sent to ${request.adopter_email}:`,
                    data?.id
                );
            }
        }
    } catch (error) {
        console.error("Error checking adoption reminders:", error);
    }
};