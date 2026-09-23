import React, { useState, useEffect } from "react";
import axios from "axios";
import PetCard from "../../components/petCard/petCard.jsx";
import { Grid, TextField, MenuItem, Pagination, Button } from "@mui/material";
import { calculateItemsPerPage, paginatePets, filterPets } from "../../utils/petHelpers";
import PetModal from "../../components/petModal/petModal.jsx";
import { SERVER_URL } from "../../constants/server_url";
import { SPECIES, ADOPTION_STATUSES } from "../../../../backend/src/constants/enums";
import './pets.css';

const Pets = () => {
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchBreed, setSearchBreed] = useState("");
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openPetModal, setOpenPetModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    const isAuthenticated = Boolean(localStorage.getItem("token"));

    const fetchPets = () => {
        axios.get(`${SERVER_URL}/pets`)
            .then((res) => {
                const allPets = res.data.animals;
                const visiblePets = isAuthenticated ? allPets : allPets.filter(pet => pet.adoption_status !== ADOPTION_STATUSES.ADOPTAT);
                setPets(visiblePets);
            })
            .catch((err) => console.error("Error fetching pets: ", err));
    };

    useEffect(() => {
        const updateItemsPerPage = () => setItemsPerPage(calculateItemsPerPage());
        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);
        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    useEffect(() => {
        fetchPets();
    }, [isAuthenticated]);

    useEffect(() => {
        const filters = {
            species: selectedSpecies,
            status: selectedStatus,
            name: searchName,
            breed: searchBreed
        };
        if (isAuthenticated) filters.status = selectedStatus;

        const result = filterPets(pets, filters);
        setFilteredPets(result);
        setPage(1);
    }, [pets, selectedSpecies, selectedStatus, searchName, searchBreed, isAuthenticated]);

    const handleSpeciesChange = (event) => setSelectedSpecies(event.target.value);
    const handleStatusChange = (event) => setSelectedStatus(event.target.value);
    const handleNameChange = (event) => setSearchName(event.target.value);
    const handleBreedChange = (event) => setSearchBreed(event.target.value);

    const handleResetFilters = () => {
        setSelectedSpecies("");
        setSelectedStatus("");
        setSearchName("");
        setSearchBreed("");
        setFilteredPets(pets);
        setPage(1);
    };

    const handleEditPet = (pet) => {
        setSelectedPet(pet);
        setOpenPetModal(true);
    };

    const paginatedPets = paginatePets(filteredPets, page, itemsPerPage);
    const totalPages = Math.ceil(filteredPets.length / itemsPerPage);

    return (
        <div className="page">
            <h3 className="title">
                {isAuthenticated ? "Toate animalele" : "Animalele din centru"}
            </h3>

            {isAuthenticated && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setSelectedPet(null);
                            setOpenPetModal(true);
                        }}
                        sx={{
                            fontWeight: "bold",
                            backgroundColor: "var(--color-primary)",
                            "&:hover": { backgroundColor: "var(--color-primary-hover)" }
                        }}
                    >
                        Adaugă animal nou
                    </Button>
                </div>
            )}

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    justifyContent: "center",
                    marginTop: "20px",
                    marginBottom: "30px"
                }}
            >
                <TextField
                    label="Caută după nume"
                    value={searchName}
                    onChange={handleNameChange}
                    variant="outlined"
                    sx={{ width: 250 }}
                    slotProps={{
                        input: {
                            style: {
                                backgroundColor: "white",
                                borderRadius: "12px"
                            }
                        }
                    }}
                />

                <TextField
                    label="Caută după rasă"
                    value={searchBreed}
                    onChange={handleBreedChange}
                    variant="outlined"
                    sx={{ width: 250 }}
                    slotProps={{
                        input: {
                            style: {
                                backgroundColor: "white",
                                borderRadius: "12px"
                            }
                        }
                    }}
                />

                <TextField
                    select
                    label="Caută după specie"
                    value={selectedSpecies}
                    onChange={handleSpeciesChange}
                    variant="outlined"
                    sx={{ width: 250 }}
                    slotProps={{
                        input: {
                            style: {
                                backgroundColor: "white",
                                borderRadius: "12px"
                            }
                        }
                    }}
                >
                    <MenuItem value="">Toate speciile</MenuItem>
                    {Object.values(SPECIES).map((specie) => (
                        <MenuItem key={specie} value={specie}>
                            {specie}
                        </MenuItem>
                    ))}
                </TextField>
                {isAuthenticated && (
                    <TextField
                        select
                        label="Caută după status"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        variant="outlined"
                        sx={{ width: 250 }}
                        slotProps={{
                            input: {
                                style: {
                                    backgroundColor: "white",
                                    borderRadius: "12px"
                                }
                            }
                        }}
                    >
                        <MenuItem value="">Toate statusurile</MenuItem>
                        {Object.values(ADOPTION_STATUSES).map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                {!isAuthenticated && (
                    <TextField
                        select
                        label="Caută după status"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        variant="outlined"
                        sx={{ width: 250 }}
                        slotProps={{
                            input: {
                                style: {
                                    backgroundColor: "white",
                                    borderRadius: "12px"
                                }
                            }
                        }}
                    >
                        <MenuItem value="">Caută după status</MenuItem>
                        {Object.values(ADOPTION_STATUSES)
                            .filter(status => ["Disponibil", "Rezervat"].includes(status))
                            .map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                    </TextField>
                )}

                <Button
                    onClick={handleResetFilters}
                    variant="outlined"
                    sx={{
                        width: 250,
                        fontWeight: "bold",
                        borderRadius: "12px",
                        color: "var(--color-neutral)",
                        borderColor: "var(--color-neutral)",
                        backgroundColor: "var(--color-background)",
                        "&:hover": {
                            color: "var(--color-neutral-hover)",
                            borderColor: "var(--color-neutral-hover)",
                            backgroundColor: "#ebebeb"
                        }
                    }}
                >
                    Resetează filtrele
                </Button>
            </div>

            <Grid container spacing={5} justifyContent="center">
                {paginatedPets.length > 0 ? (
                    paginatedPets.map((pet) => (
                        <Grid key={pet.id}>
                            <PetCard
                                id={pet.id}
                                name={pet.name}
                                species={pet.species}
                                breed={pet.breed}
                                age={pet.age}
                                adoption_status={pet.adoption_status}
                                image={pet.image}
                                onEdit={() => handleEditPet(pet)}
                            />
                        </Grid>
                    ))
                ) : (
                    <p className="p-not-available">Momentan, nu există animale disponibile.</p>
                )}
            </Grid>

            {totalPages > 1 && (
                <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
                    <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
                </div>
            )}

            <PetModal
                open={openPetModal}
                handleClose={() => {
                    setOpenPetModal(false);
                    setSelectedPet(null);
                }}
                onSaved={() => {
                    fetchPets();
                    setOpenPetModal(false);
                    setSelectedPet(null);
                }}
                initialData={selectedPet}
            />
        </div>
    );
};

export default Pets;
