import { Link } from "react-router-dom"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

import estrellas from "../assets/img/estrellas.png"
import icon4 from "../assets/img/icono-4.png"
import icon5 from "../assets/img/icono-5.png"
import icon6 from "../assets/img/icono-6.png"

import fishVideoBg from "../assets/vid/ANIMACION DE MOJARRA WEB.mp4";

import '../style/inicio.css'

function Inicio() {

    const testimonials = [
        {
            id: 1,
            text: `Un gran lugar para ir a comer y muy familiar también.
        La comida deliciosa y las bebidas también.`,
            author: "Fernanda Camacho"
        },
        {
            id: 2,
            text: `Uno de los mejores lugares de Querétaro para comer mariscos.
        No te vas a decepcionar.`,
            author: "Luis"
        },
        {
            id: 3,
            text: `Muy buena comida, el lugar es agradable y bastante amplio.`,
            author: "Sergio Alan Belmont Ramos"
        }
    ]

    return (
        <>
            <Navbar />

            {/* HERO */}
            <section className="hero-section">
                <video
                    className="hero-bg-video"
                    src={fishVideoBg}
                    autoPlay
                    loop
                    muted
                    playsInline
                />

                <div className="hero-inner">
                    <div className="hero-text">
                        <h1>
                            DONDE LA FRESCURA DEL <span className="mar">Mar</span> Y EL SABOR AUTÉNTICO REÚNEN A LA FAMILIA.
                        </h1>

                        <div className="hero-buttons">
                            <Link to="/menu" className="btn-cta">
                                <b>Ver menú</b>
                            </Link>

                            <Link to="/sucursales" className="btn-outline">
                                <b>Encuentra tu sucursal</b>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features-section">

                <div className="features-grid">

                    <div className="features-left">

                        <div className="feature-card card-blue">
                            <img src={icon4} alt="ingredientes" />
                            <h4>INGREDIENTES<br />FRESCOS DEL MAR</h4>
                            <p>
                                Seleccionamos cuidadosamente pescados y mariscos frescos
                                para garantizar calidad, frescura y auténtico sabor del mar
                                en cada platillo.
                            </p>
                        </div>

                        <div className="feature-card card-orange">
                            <img src={icon5} alt="menu" />
                            <h4>UN MENÚ PARA<br />TODOS LOS GUSTOS</h4>
                            <p>
                                Disfruta una amplia variedad de platillos preparados
                                al momento, donde la tradición de los mariscos se combina
                                con recetas llenas de sabor.
                            </p>
                        </div>

                        <div className="feature-card card-blue">
                            <img src={icon6} alt="chefs" />
                            <h4>LOS MEJORES<br />CHEFS</h4>
                            <p>
                                Nuestros chefs expertos ponen pasión y experiencia
                                en cada creación, ofreciendo una experiencia culinaria
                                única.
                            </p>
                        </div>

                    </div>

                    <div className="features-right"></div>

                </div>

            </section>

            {/* TESTIMONIALS */}
            <section className="testimonials">

                <div className="testimonials-grid">

                    {testimonials.map((t) => (
                        <div className="testimonial-card" key={t.id}>

                            <div className="testimonial-avatar"></div>

                            <img
                                src={estrellas}
                                className="testimonial-stars"
                                alt="estrellas"
                                loading="lazy"
                                decoding="async"
                            />

                            <p className="testimonial-text">
                                {t.text}
                            </p>

                            <div className="testimonial-author">
                                {t.author}
                            </div>

                        </div>
                    ))}

                </div>

                <div className="center-cta">
                    <button className="btn">
                        Cuéntanos tu experiencia
                    </button>
                </div>

            </section>

            <Footer />
        </>
    )
}

export default Inicio