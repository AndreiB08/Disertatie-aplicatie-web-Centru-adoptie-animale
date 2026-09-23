import React from "react";
import "./privacyPolicy.css";

const PrivacyPolicy = () => {
    return (
        <div className="page">
            <div className="privacy-container">
                <h1 className="title">Politica de Confidențialitate</h1>

                <p>
                    La Centrul de Adopție a Animalelor, prețuim confidențialitatea dumneavoastră
                    și ne angajăm să protejăm informațiile personale pe care ni le furnizați.
                    Această politică descrie modul în care colectăm, utilizăm și protejăm datele dumneavoastră.
                </p>

                <h2>1. Informații pe care le colectăm</h2>
                <p>
                    Putem colecta detalii personale precum numele, adresa de email, numărul de telefon
                    și orice alte informații oferite prin formularele de adopție sau contact.
                </p>

                <h2>2. Cum folosim informațiile dumneavoastră</h2>
                <ul>
                    <li>Pentru a procesa cererile de adopție</li>
                    <li>Pentru a comunica actualizări sau a răspunde solicitărilor</li>
                    <li>Pentru a îmbunătăți serviciile și experiența pe site</li>
                </ul>

                <h2>3. Partajarea datelor</h2>
                <p>
                    Nu vindem și nu partajăm informațiile dumneavoastră personale cu terți,
                    cu excepția cazurilor impuse de lege sau pentru a proteja utilizatorii noștri.
                </p>

                <h2>4. Securitate</h2>
                <p>
                    Implementăm măsuri de securitate pentru a proteja informațiile împotriva accesului
                    neautorizat, modificării, divulgării sau distrugerii.
                </p>

                <h2>5. Cookie-uri</h2>
                <p>
                    Site-ul nostru poate folosi cookie-uri pentru a îmbunătăți experiența utilizatorilor.
                    Puteți alege să dezactivați cookie-urile din setările browserului.
                </p>

                <h2>6. Drepturile dumneavoastră</h2>
                <p>
                    Aveți dreptul de a accesa, actualiza sau șterge datele dumneavoastră personale.
                    Pentru a face acest lucru, vă rugăm să ne contactați la adresa: privacy@adoptioncenter.com.
                </p>

                <h2>7. Modificări ale acestei politici</h2>
                <p>
                    Ne rezervăm dreptul de a actualiza această politică. Orice modificări vor fi
                    afișate pe această pagină împreună cu data revizuirii.
                </p>

                <p className="updated-date">Ultima actualizare: Aprilie 2025</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
