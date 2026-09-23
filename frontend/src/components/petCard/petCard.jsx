import React, { useState } from "react";
import axios from "axios";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import "./petCard.css";
import { useNavigate } from 'react-router-dom';
import { ADOPTION_STATUSES } from "../../../../backend/src/constants/enums.js";
import AdoptModal from "../adoptModal/adoptModal.jsx";
import { SERVER_URL } from "../../constants/server_url.js";

const getStatusClass = (status) => {
    switch (status) {
        case ADOPTION_STATUSES.DISPONIBIL:
            return "status-available";
        case ADOPTION_STATUSES.ADOPTAT:
            return "status-adopted";
        case ADOPTION_STATUSES.REZERVAT:
            return "status-reserved";
        default:
            return "";
    }
};

const formatAdoptionStatus = (status) => {
    switch (status) {
        case ADOPTION_STATUSES.DISPONIBIL:
            return "Disponibil pentru adopție";
        case ADOPTION_STATUSES.ADOPTAT:
            return "Adoptat";
        case ADOPTION_STATUSES.REZERVAT:
            return "Rezervat";
        default:
            return "";
    }
};

const getCardClass = (status) => {
    return `pet-card${status === 'reserved' ? ' reserved-card' : ''}`;
}

const PetCard = ({ id, name, species, breed, age, adoption_status, image, onEdit }) => {
    const navigate = useNavigate();
    const [openNotifyModal, setOpenNotifyModal] = useState(false);
    const isAuthenticated = Boolean(localStorage.getItem("token"));

    const handleMoreClick = () => {
        if (adoption_status === ADOPTION_STATUSES.REZERVAT || adoption_status === ADOPTION_STATUSES.ADOPTAT) {
            navigate("*");
        } else {
            navigate(`/pets/${id}`);
        }
    };

    const handleNotifyClick = () => {
        setOpenNotifyModal(true);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(`Ești sigur că vrei să ștergi "${name}"?`);
        if (!confirmDelete) return;

        try {
            await axios.delete(`${SERVER_URL}/pets/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            window.location.reload();
        } catch (error) {
            console.error("Error deleting pet: ", error);
            alert("A apărut o eroare.");
        }
    };

    return (
        <Card
            sx={{ width: 300, margin: 1, boxShadow: 3 }}
            className={getCardClass(adoption_status)}
        >
            <CardMedia
                sx={{ height: 220, width: "100%", objectFit: "cover", objectPosition: "top" }}
                className={`pet-image ${adoption_status === ADOPTION_STATUSES.REZERVAT || adoption_status === ADOPTION_STATUSES.ADOPTAT ? "image-reserved" : ""} ${getStatusClass(adoption_status)}`}
                image={image}
                title={name}
            />

            <CardContent sx={{ backgroundColor: "var(--color-background)", justifyContent: "center" }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ color: "var(--color-titlu)" }}>
                    {name}
                </Typography>
                <Typography variant="body1" color="var(--color-text)">
                    {species} - {breed}
                </Typography>
                <Typography variant="body2" color="var(--color-text)">
                    Vârstă: {age} ani
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: "bold" }} className={`status ${getStatusClass(adoption_status)}`}>
                    Status: {formatAdoptionStatus(adoption_status)}
                </Typography>
            </CardContent>

            <CardActions sx={{ backgroundColor: "var(--color-background)", justifyContent: "center" }}>
                {isAuthenticated ? (
                    <>
                        <Button
                            size='small'
                            variant='contained'
                            sx={{
                                fontSize: "0.75rem",
                                backgroundColor: "var(--color-cyan)",
                                "&:hover": { backgroundColor: "var(--color-cyan-hover)" }
                            }}
                            onClick={onEdit}
                        >
                            Editează
                        </Button>
                        <Button
                            size='small'
                            variant='contained'
                            sx={{
                                fontSize: "0.75rem",
                                backgroundColor: "var(--color-red)",
                                "&:hover": { backgroundColor: "var(--color-red-hover)" }
                            }}
                            onClick={handleDelete}
                        >
                            Șterge
                        </Button>
                    </>
                ) : adoption_status === ADOPTION_STATUSES.REZERVAT ? (
                    <>
                        <Button
                            size='small'
                            variant='contained'
                            onClick={handleNotifyClick}
                            sx={{
                                marginBottom: "5px",
                                fontSize: "0.75rem",
                                textAlign: "center",
                                backgroundColor: "var(--color-neutral)",
                                "&:hover": { backgroundColor: "var(--color-neutral-hover)" }
                            }}
                        >
                            Anunță-mă dacă devine disponibil
                        </Button>
                        <AdoptModal
                            open={openNotifyModal}
                            setOpen={setOpenNotifyModal}
                            notifyOnly={true}
                            animalId={id}
                        />
                    </>
                ) : (
                    <Button
                        size='small'
                        variant='contained'
                        sx={{
                            marginBottom: "5px",
                            fontSize: "0.75rem",
                            backgroundColor: "var(--color-primary)",
                            "&:hover": { backgroundColor: "var(--color-primary-hover)" }
                        }}
                        onClick={handleMoreClick}
                    >
                        Detalii
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export default PetCard;