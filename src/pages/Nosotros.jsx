import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../style/nosotros.css";

import bg1 from "../assets/img/background-1.avif";
import bg2 from "../assets/img/background-2.avif";
import linea from "../assets/img/linea-1.png";

import foto1 from "../assets/img/foto-1.png";
import foto2 from "../assets/img/foto-2.png";
import foto3 from "../assets/img/foto-3.png";

import icono1 from "../assets/img/icono-1.png";
import icono2 from "../assets/img/icono-2.png";
import icono3 from "../assets/img/icono-3.png";

export default function Nosotros() {
    return (
        <>
            <Navbar />

            {/* HERO (background-1) */}
            <section
                className="nosotros-hero"
                aria-label="Nuestra historia - hero"
                style={{ backgroundImage: `url(${bg1})` }}
            >
                <div className="container nosotros-hero-inner">
                    <div className="hero-text-block">

                        <div className="hero-copy">


                            <h1 className="hero-title">
                                Nuestra
                            </h1>

                            <h1 className="hero-title-2">
                                Historia
                            </h1>

                            <p>
                                Desde hace <span className="highlight">20 años</span>, La Mojarra Feliz se ha convertido en un lugar
                                donde el sabor del mar se disfruta en familia.
                            </p>

                            <p>
                                Nuestra historia comenzó con una idea simple: ofrecer mariscos frescos,
                                preparados con pasión y con ese sazón que hace sentir a todos como en casa.
                            </p>

                            <p>
                                Con el paso de los años, hemos crecido junto a nuestros clientes,
                                manteniendo siempre el mismo compromiso:
                                <span className="highlight">
                                    ingredientes de calidad, recetas llenas de tradición
                                </span>
                                y una experiencia que invita a compartir.
                            </p>

                            <p>
                                Hoy seguimos llevando a tu mesa lo mejor del mar, creando momentos
                                que se disfrutan y se recuerdan.
                            </p>

                        </div>

                    </div>
                </div>
            </section>


            {/* COMPROMISO (background-2) */}
            <section
                className="nosotros-compromiso"
                aria-label="Compromiso con el mar"
                style={{ backgroundImage: `url(${bg2})` }}
            >
                <div className="container compromiso-inner">
                    <h2 className="compromiso-title">Compromiso con el mar</h2>
                    <img src={linea} alt="" className="compromiso-line" loading="lazy" />
                    <p className="compromiso-copy">
                        Seleccionamos proveedores responsables que promueven prácticas pesqueras sostenibles, para ofrecer mariscos frescos mientras cuidamos el equilibrio de nuestros mares.
                    </p>
                </div>
            </section>

            {/* ESENCIA - 3 tarjetas con hover glass (foto-2, foto-3, foto-1) */}
            <section className="nosotros-esencia">
                <div className="container esencia-inner">

                    <h3 className="esencia-title">Nuestra esencia</h3>

                    <div className="cards-grid">

                        {/* CARD 1 */}
                        <article className="esencia-card">
                            <img src={foto2} alt="Frescura y calidad" loading="lazy" />

                            <div className="card-bottom">
                                <div className="icon-circle">
                                    <img src={icono1} loading="lazy" />
                                </div>

                                <div className="blur-title">
                                    <h4>FRESCURA Y CALIDAD<br />TODOS LOS DÍAS</h4>
                                </div>
                            </div>

                            <div className="card-hover">
                                <img src={icono1} className="hover-icon" loading="lazy" />

                                <h4>FRESCURA Y CALIDAD<br />TODOS LOS DÍAS</h4>

                                <p>
                                    Productos seleccionados diariamente para que cada platillo
                                    lleve la frescura del mar directamente a tu mesa.
                                </p>
                            </div>
                        </article>

                        {/* CARD 2 */}
                        <article className="esencia-card">
                            <img src={foto3} alt="Ambiente familiar" loading="lazy" />

                            <div className="card-bottom">
                                <div className="icon-circle">
                                    <img src={icono2} loading="lazy" />
                                </div>

                                <div className="blur-title">
                                    <h4>UN AMBIENTE FAMILIAR<br />Y ACOGEDOR</h4>
                                </div>
                            </div>

                            <div className="card-hover">
                                <img src={icono2} className="hover-icon" loading="lazy" />

                                <h4>UN AMBIENTE FAMILIAR<br />Y ACOGEDOR</h4>

                                <p>
                                    Creamos espacios pensados para compartir,
                                    donde cada visita se disfruta con tranquilidad,
                                    buena comida y momentos especiales en compañía
                                    de quienes más quieres.
                                </p>
                            </div>
                        </article>

                        {/* CARD 3 */}
                        <article className="esencia-card">
                            <img src={foto1} alt="Auténtico sabor del mar" loading="lazy" />

                            <div className="card-bottom">
                                <div className="icon-circle">
                                    <img src={icono3} loading="lazy" />
                                </div>
                                <div className="blur-title">
                                    <h4>AUTÉNTICO SABOR<br />DEL MAR</h4>
                                </div>
                            </div>

                            <div className="card-hover">
                                <img src={icono3} className="hover-icon" loading="lazy" />

                                <h4>AUTÉNTICO SABOR<br />DEL MAR</h4>

                                <p>
                                    Nuestros platillos rescatan recetas tradicionales del mar,
                                    preparadas con dedicación para ofrecer sabores auténticos.
                                </p>
                            </div>
                        </article>

                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}