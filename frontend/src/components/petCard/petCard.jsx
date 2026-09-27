import { useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { ADOPTION_STATUSES } from "../../../../backend/src/constants/enums.js";
import AdoptModal from "../adoptModal/adoptModal.jsx";
import { SERVER_URL } from "../../constants/server_url.js";
import "./petCard.css";

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

const PetCard = ({
    id,
    name,
    species,
    breed,
    age,
    adoption_status,
    image,
    onEdit
}) => {
    const navigate = useNavigate();
    const [openNotifyModal, setOpenNotifyModal] = useState(false);
    const isAuthenticated = Boolean(sessionStorage.getItem("token"));

    const handleMoreClick = () => {
        if (
            adoption_status === ADOPTION_STATUSES.REZERVAT ||
            adoption_status === ADOPTION_STATUSES.ADOPTAT
        ) {
            navigate("*");
        } else {
            navigate(`/pets/${id}`);
        }
    };

    const handleNotifyClick = () => {
        setOpenNotifyModal(true);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `Ești sigur că vrei să ștergi "${name}"?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(`${SERVER_URL}/pets/${id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            });

            window.location.reload();
        } catch (error) {
            console.error("Error deleting pet:", error);
            alert("A apărut o eroare.");
        }
    };

    return (
        <Card
            className="pet-card"
            sx={{
                width: 255,
                minHeight: 412,
                margin: 1,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column"
            }}
        >
            <CardMedia
                component="img"
                image={image}
                title={name}
                className={`pet-image ${adoption_status === ADOPTION_STATUSES.REZERVAT ||
                        adoption_status === ADOPTION_STATUSES.ADOPTAT
                        ? "image-reserved"
                        : ""
                    } ${getStatusClass(adoption_status)}`}
                sx={{
                    height: 200,
                    width: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                    flexShrink: 0
                }}
            />

            <CardContent
                sx={{
                    backgroundColor: "var(--color-background)",
                    flex: 1
                }}
            >
                <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ color: "var(--color-titlu)" }}
                >
                    {name}
                </Typography>

                <Typography
                    variant="body1"
                    color="var(--color-text)"
                >
                    {species} - {breed}
                </Typography>

                <Typography
                    variant="body2"
                    color="var(--color-text)"
                >
                    Vârstă: {age} ani
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold" }}
                    className={`status ${getStatusClass(adoption_status)}`}
                >
                    Status: {formatAdoptionStatus(adoption_status)}
                </Typography>
            </CardContent>

            <CardActions
                sx={{
                    backgroundColor: "var(--color-background)",
                    justifyContent: "center"
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={onEdit}
                            sx={{
                                fontSize: "0.75rem",
                                backgroundColor: "var(--color-cyan)",
                                "&:hover": {
                                    backgroundColor: "var(--color-cyan-hover)"
                                }
                            }}
                        >
                            Editează
                        </Button>

                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleDelete}
                            sx={{
                                fontSize: "0.75rem",
                                backgroundColor: "var(--color-red)",
                                "&:hover": {
                                    backgroundColor: "var(--color-red-hover)"
                                }
                            }}
                        >
                            Șterge
                        </Button>
                    </>
                ) : adoption_status === ADOPTION_STATUSES.REZERVAT ? (
                    <>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleNotifyClick}
                            sx={{
                                marginBottom: "5px",
                                fontSize: "0.75rem",
                                textAlign: "center",
                                backgroundColor: "var(--color-neutral)",
                                "&:hover": {
                                    backgroundColor: "var(--color-neutral-hover)"
                                }
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
                        size="small"
                        variant="contained"
                        onClick={handleMoreClick}
                        sx={{
                            marginBottom: "5px",
                            fontSize: "0.75rem",
                            backgroundColor: "var(--color-primary)",
                            "&:hover": {
                                backgroundColor: "var(--color-primary-hover)"
                            }
                        }}
                    >
                        Detalii
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export default PetCard;