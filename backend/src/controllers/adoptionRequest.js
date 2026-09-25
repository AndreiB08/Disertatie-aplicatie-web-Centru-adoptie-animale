import { db } from "../config/firebase.js";
import { ADOPTION_STATUSES } from "../constants/enums.js";
import { validate as isUUID, v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const adoptionRequestsCollection = db.collection("adoption_requests");
const animalsCollection = db.collection("animals");

export const addAdoptionRequest = async (req, res) => {
    try {
        const {
            adopter_first_name,
            adopter_last_name,
            adopter_email,
            adopter_phone_number,
            message,
            pickup_datetime,
            animalId,
        } = req.body;

        if (
            !adopter_first_name ||
            !adopter_last_name ||
            !adopter_email ||
            !adopter_phone_number ||
            !pickup_datetime ||
            !animalId
        ) {
            return res.status(400).json({
                message:
                    "Missing required fields: name, email, phone, pickupDateTime, and animalId are mandatory.",
            });
        }

        if (!isUUID(animalId)) {
            return res.status(400).json({
                message: "Invalid animal ID.",
            });
        }

        if (isNaN(Date.parse(pickup_datetime))) {
            return res.status(400).json({
                message: "Invalid pickup date time.",
            });
        }

        const email = adopter_email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format.",
            });
        }

        // Verificăm dacă animalul există în Firestore
        const animalRef = animalsCollection.doc(animalId);
        const animalSnapshot = await animalRef.get();

        if (!animalSnapshot.exists) {
            return res.status(404).json({
                message: "Animal not found.",
            });
        }

        // Verificăm numărul de cereri pending pentru aceeași persoană
        const pendingSnapshot = await adoptionRequestsCollection
            .where("approved", "==", false)
            .get();

        const existingRequests = pendingSnapshot.docs.filter((doc) => {
            const request = doc.data();

            return (
                request.adopter_first_name === adopter_first_name.trim() &&
                request.adopter_last_name === adopter_last_name.trim() &&
                request.adopter_email === email
            );
        });

        if (existingRequests.length >= 5) {
            return res.status(400).json({
                message:
                    "Nu poți avea mai mult de 5 cereri de adopție în așteptare.",
            });
        }

        const requestRef = adoptionRequestsCollection.doc(uuidv4());

        const newRequest = {
            id: requestRef.id,
            adopter_first_name,
            adopter_last_name,
            adopter_email,
            adopter_phone_number,
            message,
            pickup_datetime: new Date(pickup_datetime).toISOString(),
            animalId,
            approved: false,
            reminderSent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await requestRef.set(newRequest);

        await animalRef.update({
            adoption_status: ADOPTION_STATUSES.REZERVAT,
            updatedAt: new Date().toISOString(),
        });

        try {
            const animalData = animalSnapshot.data();

            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: process.env.GMAIL_USER,
                subject: `Cerere nouă de adopție pentru ${animalData.name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f7f7f7; padding: 20px;">
                        <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            
                            <h2 style="color: #437f83;">
                                Cerere nouă de adopție 🐾
                            </h2>

                            <p>
                                A fost înregistrată o nouă cerere de adopție.
                            </p>

                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />

                            <p>
                                <strong>Animal:</strong> ${animalData.name}
                            </p>

                            <p>
                                <strong>Solicitant:</strong> 
                                ${newRequest.adopter_first_name} ${newRequest.adopter_last_name}
                            </p>

                            <p>
                                <strong>Email:</strong> 
                                ${newRequest.adopter_email}
                            </p>

                            <p>
                                <strong>Telefon:</strong> 
                                ${newRequest.adopter_phone_number}
                            </p>

                            <p>
                                <strong>Data și ora ridicării:</strong> 
                                ${new Date(newRequest.pickup_datetime).toLocaleString("ro-RO")}
                            </p>

                            <p>
                                <strong>Mesaj:</strong> 
                                ${newRequest.message || "Nu a fost adăugat niciun mesaj."}
                            </p>

                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />

                            <p style="color: #555;">
                            <p style="color: #555;">
                                Poți verifica cererea din
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

        return res.status(201).json({
            message: "Adoption request saved successfully.",
            request: newRequest,
        });
    } catch (err) {
        console.error("Error saving adoption request:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

export const getAllRequests = async (req, res) => {
    try {
        const snapshot = await adoptionRequestsCollection.get();

        const requests = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const request = {
                    id: doc.id,
                    ...doc.data(),
                };

                let animal = null;

                if (request.animalId) {
                    const animalSnapshot = await animalsCollection
                        .doc(request.animalId)
                        .get();

                    if (animalSnapshot.exists) {
                        const animalData = animalSnapshot.data();

                        animal = {
                            name: animalData.name,
                            species: animalData.species,
                        };
                    }
                }

                return {
                    ...request,
                    animal,
                };
            })
        );

        requests.sort(
            (a, b) =>
                new Date(a.pickup_datetime) -
                new Date(b.pickup_datetime)
        );

        return res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching adoption requests:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const requestRef = adoptionRequestsCollection.doc(id);
        const requestSnapshot = await requestRef.get();

        if (!requestSnapshot.exists) {
            return res.status(404).json({
                message: "Request not found.",
            });
        }

        const request = requestSnapshot.data();

        let animal = null;

        if (request.animalId) {
            const animalRef = animalsCollection.doc(request.animalId);
            const animalSnapshot = await animalRef.get();

            if (animalSnapshot.exists) {
                animal = animalSnapshot.data();

                await animalRef.update({
                    adoption_status: ADOPTION_STATUSES.ADOPTAT,
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        await requestRef.update({
            approved: true,
            updatedAt: new Date().toISOString(),
        });

        // Trimitem email solicitantului după finalizarea adopției
        try {
            const animalName = animal?.name || "animalul";

            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: request.adopter_email,
                subject: `Adopția lui ${animalName} a fost finalizată! 🐾`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f7f7f7; padding: 20px;">
                        <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

                            <h2 style="color: #437f83;">
                                Adopția a fost finalizată! 🐾
                            </h2>

                            <p>
                                Salut, ${request.adopter_first_name}!
                            </p>

                            <p>
                                Avem o veste minunată! ❤️
                            </p>

                            <p>
                                Procesul de adopție pentru
                                <strong>${animalName}</strong>
                                s-a încheiat cu succes, iar ${animalName} a fost adoptat.
                            </p>

                            <p>
                                Îți mulțumim că ai ales să îi oferi o șansă la o viață mai bună
                                și că ai făcut parte din povestea lui. 🐶
                            </p>

                            <p>
                                Îți dorim multe momente frumoase împreună!
                            </p>

                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

                            <p style="color: #437f83; font-weight: bold;">
                                Cu drag,<br />
                                Centrul de Adopție Animale
                            </p>

                        </div>
                    </div>
                `,
            });

            if (error) {
                console.error(
                    "Eroare la trimiterea emailului de adopție finalizată:",
                    error
                );
            } else {
                console.log(
                    `Email de adopție finalizată trimis către ${request.adopter_email}:`,
                    data?.id
                );
            }
        } catch (emailError) {
            console.error(
                "Eroare la notificarea solicitantului:",
                emailError
            );
        }

        return res.status(200).json({
            message: "Request approved successfully.",
        });
    } catch (err) {
        console.error("Error approving request:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

export const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const requestRef = adoptionRequestsCollection.doc(id);
        const requestSnapshot = await requestRef.get();

        if (!requestSnapshot.exists) {
            return res.status(404).json({
                message: "Request not found.",
            });
        }

        const request = requestSnapshot.data();

        let animal = null;

        // Marcăm animalul ca disponibil în Firestore
        if (request.animalId) {
            const animalRef = animalsCollection.doc(request.animalId);
            const animalSnapshot = await animalRef.get();

            if (animalSnapshot.exists) {
                animal = animalSnapshot.data();

                await animalRef.update({
                    adoption_status: ADOPTION_STATUSES.DISPONIBIL,
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        // Trimitem emailul înainte să ștergem cererea
        try {
            const animalName = animal?.name || "animalul";

            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: request.adopter_email,
                subject: `Actualizare privind adopția lui ${animalName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f7f7f7; padding: 20px;">
                        <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

                            <h2 style="color: #437f83;">
                                Actualizare privind adopția lui ${animalName}
                            </h2>

                            <p>
                                Salut, ${request.adopter_first_name}!
                            </p>

                            <p>
                                Îți mulțumim că ai venit la centrul nostru și că ai acordat timp
                                procesului de adopție pentru
                                <strong>${animalName}</strong>. 🐾
                            </p>

                            <p>
                                Din păcate, de această dată procesul de adopție nu s-a finalizat.
                                Acest lucru poate avea loc din mai multe motive, iar faptul că
                                adopția nu s-a încheiat acum nu înseamnă că nu vei putea găsi
                                un animal potrivit pentru tine în viitor.
                            </p>

                            <p>
                                Îți mulțumim pentru interesul acordat și pentru faptul că ai ales
                                să iei în considerare adopția. ❤️
                            </p>

                            <a
                                href="https://centru-adoptie-animale.vercel.app/pets"
                                style="
                                    display: inline-block;
                                    background-color: #437f83;
                                    color: white;
                                    padding: 10px 18px;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    margin-top: 10px;
                                    font-weight: bold;
                                "
                            >
                                Vezi animalele disponibile
                            </a>

                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

                            <p style="color: #437f83; font-weight: bold;">
                                Cu drag,<br />
                                Centrul de Adopție Animale
                            </p>

                        </div>
                    </div>
                `,
            });

            if (error) {
                console.error(
                    "Eroare la trimiterea emailului de adopție nefinalizată:",
                    error
                );
            } else {
                console.log(
                    `Email de adopție nefinalizată trimis către ${request.adopter_email}:`,
                    data?.id
                );
            }
        } catch (emailError) {
            console.error(
                "Eroare la notificarea solicitantului:",
                emailError
            );
        }

        // Ștergem cererea
        await requestRef.delete();

        return res.status(200).json({
            message:
                "Request deleted and animal marked as available.",
        });
    } catch (err) {
        console.error("Error deleting request:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};