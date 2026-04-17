import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../style/sucursales.css";

import foto1 from "../assets/img/suc-1-refugio.png";
import foto2 from "../assets/img/suc-2-milenio.png";
import foto3 from "../assets/img/suc-3-tejeda.png";
import foto4 from "../assets/img/suc-4-gregorio.png";
import ola from "../assets/img/background-6.png";

export default function Sucursales() {
    const branches = [
        {
            id: "el-refugio",
            name: "EL REFUGIO",
            address: "Peña de Bernal, El Refugio Mall, 76146 Santiago de Querétaro, Qro.",
            img: foto1,
            mapsUrl: "https://maps.app.goo.gl/HSQKApcDYKr4HXrs6",
            whatsapp: "https://wa.me/524424584159"
        },
        {
            id: "milenio",
            name: "MILENIO",
            address: "Camino Real de Carretas 128, Milenio III, 76150 Santiago",
            img: foto2,
            mapsUrl: "https://maps.app.goo.gl/K3xDkUZ9mdmVGWcn8",
            whatsapp: "https://wa.me/524424642493"
        },
        {
            id: "tejeda",
            name: "TEJEDA",
            address: "Camino a Los Olvera Km 1+100 s/n, Los Olvera, 76900 El Pueblito, Qro.",
            img: foto3,
            mapsUrl: "https://maps.app.goo.gl/eVxb4GqsvoEcsHjv5",
            whatsapp: "https://wa.me/524424570848"
        },
        {
            id: "san-gregorio",
            name: "SAN GREGORIO",
            address: "Ejido 128 B, San Gregorio, 76157 Santiago de Querétaro, Qro.",
            img: foto4,
            mapsUrl: "https://maps.app.goo.gl/yj6PnPa9tT9uySwV8",
            whatsapp: "https://wa.me/524424322138"
        }
    ];

    return (
        <>
            <Navbar />

            <main className="sucursales-page">
                <section className="sucursales-hero">
                    <div className="container">
                        <div className="hero-top">
                            <h2 className="hero-heading">
                                <span>Tu mesa</span>
                            </h2>
                            <h2 className="hero-heading-2">
                                <span>te espera</span>
                            </h2>

                            <p className="hero-text">
                                Visita cualquiera de nuestras <strong>4 sucursales</strong> y disfruta del auténtico sabor del mar, mariscos frescos y un ambiente familiar pensado para compartir momentos.
                            </p>

                            {/* <a className="btn-order" href="/pedidos">
                                Ordenar Aquí
                            </a> */}
                        </div>

                        <div className="branches-grid">
                            {branches.map((branch) => (
                                <article className="branch-card" key={branch.id}>
                                    <div className="branch-photo">
                                        <img src={branch.img} alt={branch.name} />
                                    </div>

                                    <div className="branch-info">
                                        <h3>{branch.name}</h3>
                                        <p className="address">{branch.address}</p>

                                        <div className="branch-actions">
                                            <a
                                                className="btn-outline"
                                                href={branch.mapsUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Ubicación
                                            </a>

                                            <a
                                                className="btn-primary"
                                                href={branch.whatsapp}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Contáctanos
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
                <div className="hero-ola">
                    <img src={ola} alt="" aria-hidden="true" />
                </div>
            </main>

            <Footer />
        </>
    );
}