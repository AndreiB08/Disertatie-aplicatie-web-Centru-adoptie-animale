import { NotifyRequest } from "../models/notifyRequest.js";
import { Animal } from "../models/animal.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const addNotifyRequest = async (req, res) => {
  try {
    const { email, animalId } = req.body;

    if (!email || !animalId) {
      return res.status(400).json({ message: "Missing email or animalId." });
    }
    const exists = await NotifyRequest.findOne({ where: { email, animalId } });
    if (exists) {
      return res.status(409).json({ message: "Ai solicitat deja o notificare pentru acest animal." });
    }


    const newNotify = await NotifyRequest.create({ email, animalId });
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

    const notifyList = await NotifyRequest.findAll({ where: { animalId } });

    if (!notifyList.length) {
      return res.status(200).json({ message: "No notification requests found for this animal." });
    }

    const animal = await Animal.findByPk(animalId);

    const animalName = animal ? animal.name : "Acest animal";
    const animalImage = animal?.image || "https://a1petmeats.com.au/wp-content/uploads/2019/11/no-image-available.jpg";
    const isFemale = animal?.gender === "Femelă";

    const subjectGender = isFemale ? "ea este disponibilă" : "el este disponibil";
    const introSentence = isFemale
      ? `Ne bucurăm să îți dăm vestea că <strong>${animalName}</strong> este din nou disponibilă pentru adopție!`
      : `Ne bucurăm să îți dăm vestea că <strong>${animalName}</strong> este din nou disponibil pentru adopție!`;

    const available = isFemale ? "available" : "available";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    for (const notify of notifyList) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
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
                href="http://localhost:5173/pets/${animalId}"
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
      `
      };

      await transporter.sendMail(mailOptions);
    }

    await NotifyRequest.destroy({ where: { animalId } });

    return res.status(200).json({
      message: `Notified ${notifyList.length} people about ${animalName} and cleared the notification requests.`
    });
  } catch (error) {
    console.error("Error in notifyAvailability:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
