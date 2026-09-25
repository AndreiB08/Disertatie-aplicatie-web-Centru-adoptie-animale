import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHeart,
	faHouse,
	faPeopleGroup,
	faPaw,
	faArrowRight,
	faDog,
	faShieldDog
} from "@fortawesome/free-solid-svg-icons";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css/bundle";

import caine1 from "../../assets/caine1.jpeg";
import caine3 from "../../assets/caine3.jpg";
import papagal from "../../assets/papagal.jpg";
import pisica1 from "../../assets/pisica1.jpg";

import AIAdvice from "../../components/aiAdvice/aiAdvice.jsx";

import chowchow from "../../assets/Chow-Chow-.png";
import rescue from "../../assets/rescue.jpg";
import care from "../../assets/care.jpg";
import adoption from "../../assets/adoption.jpg";
import education from "../../assets/education.jpg";

import "./home.css";

const Home = () => {
	const navigate = useNavigate();
	const role = localStorage.getItem("role");
	const [showChat, setShowChat] = useState(false);

	const images = [caine1, pisica1, caine3, papagal];

	useEffect(() => {
		if (role === "admin" || role === "staff") {
			navigate("/dashboard");
		}
	}, [role, navigate]);

	const services = [
		{
			icon: faHeart,
			title: "Salvare",
			text: "Oferim adăpost și ajutor animalelor abandonate sau aflate în situații dificile.",
			image: rescue,
			link: "/about#rescue"
		},
		{
			icon: faPaw,
			title: "Îngrijire",
			text: "Asigurăm îngrijire medicală, hrană și un mediu sigur pentru fiecare animal.",
			image: care,
			link: "/about#care"
		},
		{
			icon: faHouse,
			title: "Adopție",
			text: "Ajutăm animalele să își găsească o familie responsabilă și iubitoare.",
			image: adoption,
			link: "/about#adoption"
		},
		{
			icon: faPeopleGroup,
			title: "Educație",
			text: "Promovăm responsabilitatea față de animale prin informare și implicare.",
			image: education,
			link: "/about#education"
		}
	];

	return (
		<div className="home">

			<section className="hero">
				<div className="hero-content">

					<div className="hero-text">
						<span className="hero-badge">
							<FontAwesomeIcon icon={faHeart} />
							Fiecare suflet contează
						</span>

						<h1>
							O a doua șansă
							<span>pentru un viitor mai bun</span>
						</h1>

						<p>
							Oferim adăpost, îngrijire și o nouă familie
							animalelor aflate în nevoie. Împreună putem
							schimba destine.
						</p>

						<div className="hero-buttons">
							<Link to="/pets" className="btn btn-primary">
								<FontAwesomeIcon icon={faPaw} />
								Vezi animalele
							</Link>

							<Link to="/about" className="btn btn-secondary">
								Află mai multe
								<FontAwesomeIcon icon={faArrowRight} />
							</Link>
						</div>

						<div className="hero-features">

							<div className="hero-feature">
								<FontAwesomeIcon icon={faHeart} />
								<div>
									<strong>Adoptă</strong>
									<span>un prieten pe viață</span>
								</div>
							</div>

							<div className="hero-feature">
								<FontAwesomeIcon icon={faHouse} />
								<div>
									<strong>Oferă</strong>
									<span>o a doua șansă</span>
								</div>
							</div>

							<div className="hero-feature">
								<FontAwesomeIcon icon={faPeopleGroup} />
								<div>
									<strong>Implică-te</strong>
									<span>în comunitate</span>
								</div>
							</div>

						</div>
					</div>

					<div className="hero-image-wrapper">

						<Swiper
							modules={[Autoplay]}
							spaceBetween={0}
							slidesPerView={1}
							autoplay={{
								delay: 3000,
								disableOnInteraction: false
							}}
							speed={1200}
							loop={true}
							allowTouchMove={false}
							navigation={false}
							pagination={false}
						>
							{images.map((url, index) => (
								<SwiperSlide key={index}>
									<img
										src={url}
										alt={`Animal care își caută o familie ${index + 1}`}
									/>
								</SwiperSlide>
							))}
						</Swiper>

						<div className="hero-image-badge">
							<FontAwesomeIcon icon={faHeart} />

							<span>
								Fiecare animal
								<strong>merită o familie</strong>
							</span>
						</div>

					</div>

				</div>
			</section>


			{/* ANIMALE */}

			<section className="animals-section">

				<div className="section-heading">
					<span>ANIMALE ÎN CĂUTAREA UNEI FAMILII</span>

					<h2>
						Descoperă prietenii noștri
					</h2>

					<p>
						Poate următorul tău cel mai bun prieten
						este chiar aici.
					</p>
				</div>

				<div className="animals-preview">

					<div className="animal-card">
						<img src={chowchow} alt="Animal disponibil pentru adopție" />

						<div className="animal-card-content">
							<div>
								<h3>Animale disponibile</h3>
								<p>
									Descoperă toate animalele care
									își caută o familie.
								</p>
							</div>

							<Link to="/pets">
								<FontAwesomeIcon icon={faArrowRight} />
							</Link>
						</div>
					</div>

					<div className="animals-info">
						<div className="animals-info-icon">
							<FontAwesomeIcon icon={faShieldDog} />
						</div>

						<h3>
							Poate începe cu tine
						</h3>

						<p>
							Fiecare adopție înseamnă mai mult decât
							un nou cămin. Înseamnă o viață schimbată.
						</p>

						<Link to="/pets" className="text-link">
							Vezi toate animalele
							<FontAwesomeIcon icon={faArrowRight} />
						</Link>
					</div>

				</div>

			</section>


			{/* SERVICII */}

			<section className="services-section">

				<div className="section-heading">
					<span>CUM NE IMPLICĂM</span>

					<h2>
						Mai mult decât un adăpost
					</h2>

					<p>
						Suntem aici pentru animale înainte,
						în timpul și după adopție.
					</p>
				</div>

				<div className="services-grid">

					{services.map((service) => (
						<article
							className="service-card"
							key={service.title}
						>
							<div className="service-image">
								<img
									src={service.image}
									alt={service.title}
								/>

								<div className="service-icon">
									<FontAwesomeIcon icon={service.icon} />
								</div>
							</div>

							<div className="service-content">

								<h3>{service.title}</h3>

								<p>{service.text}</p>

								<Link to={service.link}>
									Află mai multe
									<FontAwesomeIcon icon={faArrowRight} />
								</Link>

							</div>
						</article>
					))}

				</div>

			</section>


			{/* CTA */}

			<section className="home-cta">

				<div>
					<span>FĂ PARTE DIN POVESTE</span>

					<h2>
						Un gest mic poate schimba
						o viață întreagă.
					</h2>

					<p>
						Adoptă, donează sau implică-te ca voluntar.
						Orice ajutor contează.
					</p>
				</div>

				<Link to="/contact" className="cta-button">
					Implică-te
					<FontAwesomeIcon icon={faArrowRight} />
				</Link>

			</section>


			{/* AI */}

			<button
				className="floating-chat-button"
				onClick={() => setShowChat(true)}
				aria-label="Deschide AI Advice"
			>
				<FontAwesomeIcon icon={faDog} />
			</button>

			{showChat && (
				<div className="modal-overlay">

					<div className="modal-box">

						<button
							className="close-button"
							onClick={() => setShowChat(false)}
						>
							×
						</button>

						<AIAdvice
							onClose={() => setShowChat(false)}
						/>

					</div>

				</div>
			)}

		</div>
	);
};

export default Home;