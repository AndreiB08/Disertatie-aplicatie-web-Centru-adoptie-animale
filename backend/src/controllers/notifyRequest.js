import { db } from "../config/firebase.js";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const notifyRequestsCollection = db.collection("notification_requests");
const animalsCollection = db.collection("animals");
const adoptionRequestsCollection = db.collection("adoption_requests");
const resend = new Resend(process.env.RESEND_API_KEY);

export const addNotifyRequest = async (req, res) => {
  try {
    const { email, animalId } = req.body;

    if (!email || !animalId) {
      return res.status(400).json({ message: "Missing email or animalId." });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const adoptionSnapshot = await adoptionRequestsCollection
      .where("adopter_email", "==", normalizedEmail)
      .where("animalId", "==", animalId)
      .limit(1)
      .get();

    if (!adoptionSnapshot.empty) {
      return res.status(409).json({
        message:
          "Ai completat deja formularul de adopție pentru acest animal și nu mai poți solicita o notificare.",
      });
    }

    const existingSnapshot = await notifyRequestsCollection
      .where("email", "==", normalizedEmail)
      .where("animalId", "==", animalId)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(409).json({
        message: "Ai solicitat deja o notificare pentru acest animal.",
      });
    }

    const notifyRef = notifyRequestsCollection.doc();

    const newNotify = {
      id: notifyRef.id,
      email: normalizedEmail,
      animalId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await notifyRef.set(newNotify);

    return res.status(201).json({
      message: "Notification request saved successfully.",
      notify: newNotify,
    });
  } catch (err) {
    console.error("Error saving notification request:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const notifyAvailability = async (req, res) => {
  try {
    const { animalId } = req.body;

    const notifySnapshot = await notifyRequestsCollection
      .where("animalId", "==", animalId)
      .get();

    const notifyList = notifySnapshot.docs.map((doc) => doc.data());

    if (!notifyList.length) {
      return res.status(200).json({
        message: "No notification requests found for this animal.",
      });
    }

    const animalDoc = await animalsCollection.doc(animalId).get();
    const animal = animalDoc.exists ? animalDoc.data() : null;

    const animalName = animal ? animal.name : "Acest animal";
    const animalImage =
      animal?.imageUrl ||
      "https://a1petmeats.com.au/wp-content/uploads/2019/11/no-image-available.jpg";
    const isFemale = animal?.gender === "Femelă";

    const introSentence = isFemale
      ? `Ne bucurăm să îți dăm vestea că <strong>${animalName}</strong> este din nou disponibilă pentru adopție!`
      : `Ne bucurăm să îți dăm vestea că <strong>${animalName}</strong> este din nou disponibil pentru adopție!`;

    for (const notify of notifyList) {
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: notify.email,
        subject: `${animalName} este din nou disponibil${isFemale ? "ă" : ""} pentru adopție!`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f7f7f7; padding: 20px;">
          <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
            <img src="${animalImage}" alt="${animalName}" 
                style="width: 100%; max-width: 600px; height: 400px; object-fit: cover; object-position: top; border-radius: 10px; margin-top: 20px;" />
            <div style="padding: 25px;">
              <h2 style="color: #437f83;">Salut!</h2>
              <p>
                ${introSentence}
              </p>
              <p>
                Poți vedea mai multe detalii accesând următorul link:
              </p>
              <a 
                href="https://centru-adoptie-animale.vercel.app/pets/${animalId}"
                style="display: inline-block; background-color: #437f83; color: white; padding: 10px 18px; text-decoration: none; 
                      border-radius: 5px; margin-top: 10px; font-weight: bold;"
              >
                Vezi detalii
              </a>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
              <p style="font-size: 14px; color: #555;">
                Cu drag,<br />
                Centrul de Adopție Animale
              </p>
            </div>
          </div>
        </div>
      `,
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }

      console.log(`Email sent to ${notify.email}:`, data?.id);
    }

    const deleteBatch = db.batch();

    notifySnapshot.docs.forEach((doc) => {
      deleteBatch.delete(doc.ref);
    });

    await deleteBatch.commit();

    return res.status(200).json({
      message: `Notified ${notifyList.length} people about ${animalName} and cleared the notification requests.`
    });
  } catch (error) {
    console.error("Error in notifyAvailability:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
