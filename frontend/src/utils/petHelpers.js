export const calculateItemsPerPage = () => {

    // console.log("latime:", window.innerWidth);

    const width = window.innerWidth;
    if (width >= 1900) return 10;
    if (width >= 1500) return 8;
    if (width >= 1200) return 6;
    return 4;
};

export const paginatePets = (data, page, itemsPerPage) => {
    return data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
};

export const filterPets = (pets, filters = {}) => {
    const { species, adoption_status, name, breed, status } = filters;
    const effectiveStatus = status || adoption_status;
    
    return pets.filter(pet => {
        const matchSpecies = species ? pet.species === species : true;
        const matchStatus = effectiveStatus ? pet.adoption_status === effectiveStatus : true;
        const matchName = name ? pet.name.toLowerCase().includes(name.toLowerCase()) : true;
        const matchBreed = breed ? pet.breed.toLowerCase().includes(breed.toLowerCase()) : true;

        return matchSpecies && matchStatus && matchName && matchBreed;
    });
};

