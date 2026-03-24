import React from "react";
import { NavLink } from "react-router-dom";

import logo from "../assets/img/logo.png";
import fb from "../assets/img/facebook.png";
import ig from "../assets/img/instagram.png";
import tt from "../assets/img/tiktok.png";
import linea from "../assets/img/linea-2.png";

import "../style/global.css";

export default function Footer() {
    const handleClick = () => {
        window.scrollTo(0, 0);
    };

    return (
        <footer className="site-footer" role="contentinfo">

            {/* TEXTO SUPERIOR */}
            <div className="footer-top">
                <p className="footer-slogan">
                    FRESCURA DEL MAR, DIRECTO A TU MESA <br />
                    <b>CON SABOR Y TRADICIÓN.</b>
                </p>

                <img src={linea} alt="" className="footer-linea" />

                <h3 className="footer-title">¡Conócenos!</h3>
            </div>

            {/* CONTENIDO */}
            <div className="footer-inner">

                {/* LOGO */}
                <div className="footer-left">
                    <img src={logo} alt="La Mojarra Feliz" className="footer-logo" />
                </div>

                {/* NAVIGATION (AHORA COMO NAVBAR) */}
                <div className="footer-center">
                    <ul className="footer-nav">
                        <li>
                            <NavLink to="/" onClick={handleClick} className={({ isActive }) => (isActive ? "active" : "")}>
                                Inicio
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/nosotros" onClick={handleClick} className={({ isActive }) => (isActive ? "active" : "")}>
                                Nosotros
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/sucursales" onClick={handleClick} className={({ isActive }) => (isActive ? "active" : "")}>
                                Sucursales
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/menu" onClick={handleClick} className={({ isActive }) => (isActive ? "active" : "")}>
                                Menú
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/pedidos" onClick={handleClick} className={({ isActive }) => (isActive ? "active nav-cta" : "nav-cta")}>
                                Pedidos
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* REDES */}
                <div className="footer-right">
                    <p className="footer-social-title">
                        REDES SOCIALES
                    </p>

                    <div className="socials">
                        <a
                            href="https://www.facebook.com/lamojarrafelizqueretaro?locale=es_LA"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={fb} alt="Facebook" />
                        </a>

                        <a
                            href="https://www.instagram.com/lamojarrafelizqueretaro?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={ig} alt="Instagram" />
                        </a>

                        <a
                            href="https://www.tiktok.com/@mojarrafelizqro?_r=1&_t=ZS-94lwEm96yLY"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={tt} alt="TikTok" />
                        </a>
                    </div>
                </div>

            </div>

        </footer>
    );
}