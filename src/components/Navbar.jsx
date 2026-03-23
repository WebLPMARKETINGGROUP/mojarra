import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/img/logo.png";
import "../style/global.css";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const firstMobileLinkRef = useRef(null);

    // obtiene nombre de la página
    const pageClass = location.pathname === "/" ? "home" : location.pathname.replace("/", "");

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // manejar ESC + bloqueo scroll
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);

        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);

    // focus al primer link cuando se abre el menú (accesibilidad)
    useEffect(() => {
        if (open) {
            // dar un pequeño delay para que el panel termine su animación y el elemento exista en DOM
            setTimeout(() => firstMobileLinkRef.current?.focus(), 60);
        }
    }, [open]);

    const toggle = () => setOpen((v) => !v);
    const closeMenu = () => setOpen(false);

    return (
        <header className={`navbar-custom ${pageClass} ${scrolled ? "scrolled" : ""}`} role="navigation" aria-label="Main navigation">
            <div className="navbar-container">

                {/* left area: on mobile the logo will sit here */}
                <div className="navbar-left">
                    <button
                        type="button"
                        className={`hamburger ${open ? "is-active" : ""}`}
                        onClick={toggle}
                        aria-label={open ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                    >
                        <span className="bar" />
                        <span className="bar" />
                        <span className="bar" />
                    </button>

                    {/* logo visible left in mobile, centered in desktop via CSS */}
                    <div className="logo-wrap-small" aria-hidden={open}>
                        <img src={logo} alt="Logo" className="logo-small" />
                    </div>
                </div>

                {/* center desktop links */}
                <div className="navbar-inner">
                    <ul className="nav-links desktop-nav" aria-hidden={open}>
                        <li><NavLink to="/" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>Inicio</NavLink></li>
                        <li><NavLink to="/nosotros" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>Nosotros</NavLink></li>
                        <li><NavLink to="/sucursales" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>Sucursales</NavLink></li>
                    </ul>

                    {/* centered logo for desktop */}
                    <div className="logo-circle desktop-logo" aria-hidden={open}>
                        <img src={logo} alt="Logo" />
                    </div>

                    <ul className="nav-links desktop-nav" aria-hidden={open}>
                        <li><NavLink to="/menu" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>Menú</NavLink></li>
                        <li><NavLink to="/pedidos" onClick={closeMenu} className={({ isActive }) => (isActive ? "active nav-cta" : "nav-cta")}>Pedidos</NavLink></li>
                    </ul>
                </div>

                {/* mobile menu panel (slide-in) */}
                <nav id="mobile-menu" className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open} role="menu">
                    <div className="mobile-menu-inner">
                        <div className="mobile-logo">
                            <img src={logo} alt="Logo" />
                        </div>

                        <ul className="mobile-links" role="menubar">
                            <li>
                                <NavLink
                                    to="/"
                                    onClick={closeMenu}
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                    ref={firstMobileLinkRef}
                                    role="menuitem"
                                >
                                    Inicio
                                </NavLink>
                            </li>
                            <li><NavLink to="/nosotros" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")} role="menuitem">Nosotros</NavLink></li>
                            <li><NavLink to="/sucursales" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")} role="menuitem">Sucursales</NavLink></li>
                            <li><NavLink to="/menu" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")} role="menuitem">Menú</NavLink></li>
                            <li><NavLink to="/pedidos" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")} role="menuitem">Pedidos</NavLink></li>
                        </ul>

                        <div className="mobile-cta">
                            <NavLink to="/pedidos" onClick={closeMenu} className="nav-cta">Ir a Pedidos</NavLink>
                        </div>
                    </div>
                </nav>

                {/* overlay (click para cerrar menu) */}
                <div className={`mobile-menu-overlay ${open ? "open" : ""}`} onClick={closeMenu} aria-hidden={!open} />

            </div>
        </header>
    );
}