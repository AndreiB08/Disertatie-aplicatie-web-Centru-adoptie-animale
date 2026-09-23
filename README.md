# Aplicație Web - Centru de Adopție Animale

Această aplicație este realizată ca lucrare de licență și reprezintă o aplicație web pentru gestionarea unui centru de adopții de animale.

---

## Funcționalități principale

### Autentificare și Autorizare
- Login pentru angajați (roluri: `admin`, `staff`)
- Autorizare pe baza token-ului JWT
- Acces restricționat în funcție de rol

### Gestionare Animale
- Adăugare / editare / ștergere animale
- Afișare detalii complete pentru fiecare animal
- Filtrare și paginare în panoul de administrare

### Gestionare Angajați
- Vizualizare listă angajați (doar `admin`)
- Adăugare, editare și ștergere angajat
- Validare câmpuri + protecție: nu poți șterge propriul cont

### Contul meu
- Fiecare angajat își poate actualiza informațiile personale și parola
- Validare telefon, email, și formatare nume automată

---

## Tehnologii utilizate

### Front-end:
- React + Vite
- React Router DOM
- Axios
- Material UI (MUI)
- CSS personalizat

### Back-end:
- Node.js + Express
- Sequelize (ORM)
- SQLite
- JWT pentru autentificare

---

## Instrucțiuni de rulare

### 1. Clonează proiectul

```bash
git clone https://github.com/andrei-bz/licenta-adoptie-animale.git
cd licenta-adoptie-animale
```

### 2. Creează fișierul `.env`

### 3. Instalează dependențele

#### Pentru backend:
```bash
cd back-end
npm install
npm run dev
```

#### Pentru frontend:
```bash
cd front-end
npm install
npm run dev
```

---

## Date de test

```txt
Admin:
email: andrei.buzagiu@gmail.com
parola: admin1234

Staff:
email: andrei2.buzagiu@gmail.com
parola: staff1234
```

> Se pot schimba din interfață.

### 4. Paginile pentru staff

> http://localhost:5173/login
