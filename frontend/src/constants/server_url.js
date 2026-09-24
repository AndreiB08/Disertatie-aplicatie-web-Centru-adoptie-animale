const isDevelopment = import.meta.env.DEV;

export const SERVER_URL = isDevelopment
    ? "http://localhost:8080"
    : "https://disertatie-backend-l6ow.onrender.com";