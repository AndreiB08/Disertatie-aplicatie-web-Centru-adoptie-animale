import React, { useState, useEffect } from "react";
import axios from "axios";
import "./petDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { SERVER_URL } from "../../constants/server_url";
import { ADOPTION_STATUSES } from "../../../../backend/src/constants/enums";
import AdoptModal from "../../components/adoptModal/adoptModal";

const PetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [translatedNote, setTranslatedNote] = useState("");
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const res = await axios.get(`${SERVER_URL}/pets/${id}`);
                const data = res.data;

                if (!data || !data.id ||
                    [ADOPTION_STATUSES.REZERVAT, ADOPTION_STATUSES.ADOPTAT].includes(data.adoption_status)) {
                    navigate("*", { replace: true });
                    return;
                }

                setPet(data);
                setSelectedImage(data.image);
            } catch (err) {
                console.error("Error fetching pet details: ", err);
                navigate("*", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [id, navigate]);

    if (loading) return <p className="loading">Se încarcă...</p>;
    if (error) return <p className="error">Eroare la încărcarea detaliilor</p>;

    return (
        <div className="page">
            <div>
                <button className="back-button" onClick={() => navigate(-1)}>
                    &lt; Înapoi
                </button>
            </div>
            {pet ? (
                <div className="pet-content">
                    <div className="image-container">
                        <img src={selectedImage} alt={pet.name} className="pet-image" />
                    </div>
                    <div className="pet-info">
                        <h1>{pet.name} - {pet.species}</h1>
                        <p><strong>Rasă:</strong> {pet.breed}</p>
                        <p><strong>Vârstă:</strong> {pet.age} ani</p>
                        <p><strong>Mărime:</strong> {pet.size}</p>
                        <p><strong>Gen:</strong> {pet.gender}</p>
                        <p><strong>Culoare:</strong> {pet.color ? pet.color : "Nespecificat"}</p>
                        <p><strong>Stare de sănătate:</strong> {pet.health_status}</p>
                        <p><strong>Vaccinat:</strong> {pet.vaccinated ? "Da" : "Nu"}</p>
                        <p><strong>Sterilizat:</strong> {pet.sterilized ? "Da" : "Nu"}</p>
                        <p><strong>Descriere:</strong> {pet.notes || "Nu există informații suplimentare"}</p>

                        <div className="buttons">
                            <button className="btn btn-secondary" onClick={() => setShowContactModal(true)}>
                                Adoptă-mă
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate("/pets")}>
                                Vezi alte animale
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="error">Detaliile animalului nu sunt disponibile</p>
            )}

            {pet && (
                <AdoptModal
                    open={showContactModal}
                    setOpen={setShowContactModal}
                    animalId={pet.id}
                />
            )}
        </div>
    );
};

export default PetDetails;
