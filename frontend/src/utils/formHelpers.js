export const lowercase = (s) => s.toLowerCase();

export const capitalizeWords = (s) =>
  s
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const capitalizeFirstWordOnly = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const formatNotes = (str = "") => {
  const cleaned = str.trim().replace(/\s+/g, " ").toLowerCase();
  if (!cleaned) return "";

  const capitalized = cleaned[0].toUpperCase() + cleaned.slice(1);
  const endsWithPunctuation = /[.!?]$/.test(capitalized);

  return endsWithPunctuation ? capitalized : capitalized + ".";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
};

export const formatAnimalData = (data = {}) => ({
  ...data,
  name: capitalizeWords(data.name),
  breed: capitalizeWords(data.breed),
  color: capitalizeFirstWordOnly(data.color),
  notes: formatNotes(data.notes),
  arrival_date: formatDate(data.arrival_date),
  microchip_number:
    data.microchip_number?.trim() === "" ? null : data.microchip_number,
});

export const validateAnimalData = (data = {}) => {
  const errors = {};
  const isEmpty = (value) => !value || value.trim() === "";

  if (isEmpty(data.name)) errors.name = "Numele este obligatoriu.";
  if (isEmpty(data.species)) errors.species = "Specia este obligatorie.";
  if (isEmpty(data.breed)) errors.breed = "Rasa este obligatorie.";
  if (data.age === undefined || data.age === null || data.age === "")
    errors.age = "Vârsta este obligatorie.";
  if (isEmpty(data.gender)) errors.gender = "Genul este obligatoriu.";
  if (isEmpty(data.size)) errors.size = "Dimensiunea este obligatorie.";
  if (isEmpty(data.color)) errors.color = "Culoarea este obligatorie.";
  if (isEmpty(data.health_status)) errors.health_status = "Starea medicală este obligatorie.";
  if (isEmpty(data.adoption_status)) errors.adoption_status = "Statusul de adopție este obligatoriu.";
  if (isEmpty(data.arrival_date)) errors.arrival_date = "Data sosirii este obligatorie.";
  if (isEmpty(data.image)) errors.image = "URL-ul imaginii este obligatoriu.";

  if (
    data.microchip_number &&
    !/^\d{15}$/.test(data.microchip_number.trim())
  ) {
    errors.microchip_number = "Numărul de microcip trebuie să aibă exact 15 cifre.";
  }

  return errors;
};
