import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../style/sucursales.css";

import qro from "../assets/img/qro.png";
import foto1 from "../assets/img/suc-1-refugio.png";
import foto2 from "../assets/img/suc-2-milenio.png";
import foto3 from "../assets/img/suc-3-tejeda.png";
import foto4 from "../assets/img/suc-4-gregorio.png";
import ola from "../assets/img/background-6.png";

export default function Sucursales() {
    // Datos de las sucursales (incluye coords en %)
    const branches = [
        {
            id: "el-refugio",
            name: "EL REFUGIO",
            address:
                "Peña de Bernal, El Refugio Mall, 76146 Santiago de Querétaro, Qro.",
            img: foto1,
            mapsUrl: "https://maps.app.goo.gl/HSQKApcDYKr4HXrs6",
            whatsapp: "https://wa.me/524424584159",
            coords: { left: "74%", top: "52%" } // REFUGIO
        },
        {
            id: "milenio",
            name: "MILENIO",
            address: "Camino Real de Carretas 128, Milenio III, 76150 Santiago",
            img: foto2,
            mapsUrl: "https://maps.app.goo.gl/K3xDkUZ9mdmVGWcn8",
            whatsapp: "https://wa.me/524424642493",
            coords: { left: "84.5%", top: "70%" } // MILENIO
        },
        {
            id: "tejeda",
            name: "TEJEDA",
            address:
                "Camino a Los Olvera Km 1+100 s/n, Los Olvera, 76900 El Pueblito, Qro.",
            img: foto3,
            mapsUrl: "https://maps.app.goo.gl/eVxb4GqsvoEcsHjv5",
            whatsapp: "https://wa.me/524424570848",
            coords: { left: "68.5%", top: "80%" } // TEJEDA
        },
        {
            id: "san-gregorio",
            name: "SAN GREGORIO",
            address:
                "Ejido 128 B, San Gregorio, 76157 Santiago de Querétaro, Qro.",
            img: foto4,
            mapsUrl: "https://maps.app.goo.gl/yj6PnPa9tT9uySwV8",
            whatsapp: "https://wa.me/524424322138",
            coords: { left: "65%", top: "64%" } // SAN GREGORIO
        }
    ];

    const [active, setActive] = useState(branches[0].id);

    const activeBranch = branches.find((b) => b.id === active) || branches[0];

    return (
        <>
            <Navbar />

            <main className="sucursales-page">
                <section className="sucursales-hero">
                    <div className="container hero-grid">

                        {/* LEFT: título + texto + botón */}
                        <div className="hero-left">
                            <h2 className="hero-heading">
                                <span>Tu mesa</span>
                            </h2>
                            <h2 className="hero-heading-2">
                                <span>te espera</span>
                            </h2>

                            <p className="hero-text">
                                Visita cualquiera de nuestras <strong>4 sucursales</strong> y
                                disfruta del auténtico sabor del mar, mariscos frescos y un ambiente familiar 
                                pensado para compartir momentos.
                            </p>

                            <a className="btn-order" href="/pedidos">Ordenar Aquí</a>
                        </div>

                        {/* CENTER: mapa (imagen) + pins */}
                        <div className="hero-center">
                            <div className="map-wrapper" aria-hidden="false">
                                <img src={qro} alt="Mapa de Querétaro" className="map-img" />

                                {branches.map((b) => {
                                    const isActive = b.id === active;
                                    return (
                                        <button
                                            key={b.id}
                                            className={`map-pin ${isActive ? "active" : ""}`}
                                            style={{ left: b.coords.left, top: b.coords.top }}
                                            onClick={() => setActive(b.id)}
                                            aria-pressed={isActive}
                                            aria-label={`Seleccionar sucursal ${b.name}`}
                                        >
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: información dinámica */}
                        <aside className="hero-right" aria-live="polite">
                            <div className="branch-card">
                                <div className="branch-photo">
                                    <img src={activeBranch.img} alt={activeBranch.name} />
                                </div>

                                <div className="branch-info">
                                    <h3>{activeBranch.name}</h3>
                                    <p className="address">{activeBranch.address}</p>

                                    <div className="branch-actions">
                                        <a
                                            className="btn-outline"
                                            href={activeBranch.mapsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Ubicación
                                        </a>

                                        <a
                                            className="btn-primary"
                                            href={activeBranch.whatsapp}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Contáctanos
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </aside>

                    </div>

                    {/* ola decorativa debajo */}
                    <div className="hero-ola">
                        <img src={ola} alt="" aria-hidden="true" />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}