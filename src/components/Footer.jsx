import React from "react";
import logo from "../assets/img/logo.png";
import fb from "../assets/img/facebook.png";
import ig from "../assets/img/instagram.png";
import tt from "../assets/img/tiktok.png";
import linea from "../assets/img/linea-2.png";
import "../style/global.css";

export default function Footer() {
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

            {/* CONTENIDO PRINCIPAL */}
            <div className="footer-inner">

                {/* IZQUIERDA */}
                <div className="footer-left">
                    <img src={logo} alt="La Mojarra Feliz" className="footer-logo" />
                </div>

                {/* MENU */}
                <div className="footer-center">
                    <ul className="footer-nav">
                        <li><a href="/">Inicio</a></li>
                        <li><a href="/nosotros">Nosotros</a></li>
                        <li><a href="/sucursales">Sucursales</a></li>
                        <li><a href="/menu">Menú</a></li>
                        <li><a href="/pedidos">Pedidos</a></li>
                    </ul>
                </div>

                {/* REDES */}
                <div className="footer-right">
                    <p className="footer-social-title">
                        Visita nuestras <br /> redes sociales
                    </p>

                    <div className="socials">
                        <img src={fb} alt="Facebook" />
                        <img src={ig} alt="Instagram" />
                        <img src={tt} alt="TikTok" />
                    </div>
                </div>

            </div>

        </footer>
    );
}