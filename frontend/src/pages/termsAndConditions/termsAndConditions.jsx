import React from "react";
import "./termsAndConditions.css";

const TermsAndConditions = () => {
  return (
    <div className="page">
      <div className="terms-container">
        <h1 className="title">Termeni și Condiții</h1>

        <p>
          Bine ați venit la Centrul de Adopție a Animalelor. Prin accesarea sau
          utilizarea site-ului nostru, a serviciilor oferite sau prin adoptarea
          unui animal de la noi, sunteți de acord să respectați următorii termeni
          și condiții. Vă rugăm să îi citiți cu atenție.
        </p>

        <h2>1. Eligibilitate pentru adopție</h2>
        <p>
          Adoptatorii trebuie să aibă cel puțin 18 ani și să fie capabili să
          ofere un mediu sigur și potrivit pentru animal. Ne rezervăm dreptul de
          a respinge orice cerere care nu respectă standardele noastre.
        </p>

        <h2>2. Procesul de adopție</h2>
        <p>
          Procesul de adopție include completarea unui formular, participarea la
          un interviu și, posibil, o vizită la domiciliu. Aprobarea finală este la
          discreția exclusivă a personalului nostru.
        </p>

        <h2>3. Responsabilitățile adoptatorului</h2>
        <ul>
          <li>Să ofere hrană, adăpost, îngrijire veterinară și atenție</li>
          <li>Să nu abandoneze sau vândă animalul adoptat</li>
          <li>Să ne anunțe dacă nu mai poate avea grijă de animal</li>
        </ul>

        <h2>4. Utilizarea site-ului</h2>
        <p>
          Tot conținutul de pe site-ul nostru este doar cu scop informativ.
          Depunem eforturi pentru a-l menține precis și actualizat, dar nu oferim
          garanții. Utilizarea sau reproducerea neautorizată a conținutului este
          interzisă.
        </p>

        <h2>5. Limitarea răspunderii</h2>
        <p>
          Centrul de Adopție a Animalelor nu este responsabil pentru daune sau
          vătămări rezultate din utilizarea site-ului nostru sau din adoptarea
          animalelor. Toate animalele sunt adoptate „așa cum sunt”, fără garanții.
        </p>

        <h2>6. Modificări ale acestor termeni</h2>
        <p>
          Ne rezervăm dreptul de a actualiza acești termeni în orice moment.
          Continuarea utilizării site-ului sau a serviciilor noastre după
          actualizări indică acceptarea termenilor noi.
        </p>

        <p className="updated-date">Ultima actualizare: Aprilie 2025</p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
