import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../style/menu.css";

import p1 from "../assets/img/1.jpg";
import p2 from "../assets/img/2.jpg";
import p3 from "../assets/img/3.jpg";
import p4 from "../assets/img/4.jpg";
import p5 from "../assets/img/5.jpg";
import p6 from "../assets/img/6.jpg";
import p7 from "../assets/img/7.jpg";

import torre from "../assets/img/torre.png";
import coctel from "../assets/img/coctel.png";

const PAGES = [p1, p2, p3, p4, p5, p6, p7];
const ANIM_MS = 450;

export default function Menu() {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [animating, setAnimating] = useState(false);

    const containerRef = useRef(null);
    const timeoutRef = useRef(null);

    // preload imágenes
    useEffect(() => {
        PAGES.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // detectar mobile
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // función central de animación
    const triggerAnimation = (newIndex, dir) => {
        if (timeoutRef.current) return;

        setDirection(dir);
        setAnimating(true);
        setIndex(newIndex);

        timeoutRef.current = setTimeout(() => {
            setAnimating(false);
            timeoutRef.current = null;
        }, ANIM_MS);
    };

    const goNext = useCallback(() => {
        const next = (index + 1) % PAGES.length;
        triggerAnimation(next, 1);
    }, [index]);

    const goPrev = useCallback(() => {
        const prev = (index - 1 + PAGES.length) % PAGES.length;
        triggerAnimation(prev, -1);
    }, [index]);

    // teclado
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [goNext, goPrev]);

    // swipe / drag
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let startX = 0;
        let dx = 0;
        let dragging = false;

        const onStart = (e) => {
            dragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
        };

        const onMove = (e) => {
            if (!dragging) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            dx = x - startX;
        };

        const onEnd = () => {
            if (!dragging) return;
            dragging = false;

            if (Math.abs(dx) > 40) {
                dx < 0 ? goNext() : goPrev();
            }

            dx = 0;
        };

        el.addEventListener("touchstart", onStart, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: true });
        el.addEventListener("touchend", onEnd);

        el.addEventListener("mousedown", onStart);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onEnd);

        return () => {
            el.removeEventListener("touchstart", onStart);
            el.removeEventListener("touchmove", onMove);
            el.removeEventListener("touchend", onEnd);

            el.removeEventListener("mousedown", onStart);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onEnd);
        };
    }, [goNext, goPrev]);

    // lógica original (RESPETADA)
    const leftIndex = isMobile ? index : index - (index % 2);
    const leftPage = isMobile ? null : PAGES[leftIndex];
    const rightPage = isMobile
        ? PAGES[index]
        : PAGES[(leftIndex + 1) % PAGES.length];

    const totalDots = isMobile
        ? PAGES.length
        : Math.ceil(PAGES.length / 2);

    const handleDot = (dotIdx) => {
        const target = isMobile ? dotIdx : dotIdx * 2;
        const dir = target >= index ? 1 : -1;
        triggerAnimation(target, dir);
    };

    return (
        <>
            <Navbar />

            <main className="menu-page">
                <section className="menu-hero" ref={containerRef} aria-label="Menú">

                    {!isMobile && (
                        <>
                            <img src={torre} className="decor-torre" alt="" aria-hidden />
                            <img src={coctel} className="decor-coctel" alt="" aria-hidden />
                        </>
                    )}

                    <div className="menu-inner container">

                        <div className="book-wrap" role="region" aria-live="polite" aria-atomic="true">
                            
                            <button
                                className="book-nav"
                                onClick={goPrev}
                                disabled={animating}
                                aria-label="Página anterior"
                            >
                                ‹
                            </button>

                            <div className="slider" aria-hidden={animating ? "true" : "false"}>
                                <div
                                    key={index}
                                    className={`slide ${direction === 1 ? "next" : "prev"} ${animating ? "anim" : ""}`}
                                >
                                    {!isMobile && (
                                        <div className="page left-page">
                                            <div className="page-inner">
                                                {leftPage && (
                                                    <img
                                                        src={leftPage}
                                                        alt={`Página ${leftIndex + 1}`}
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="page right-page">
                                        <div className="page-inner">
                                            {rightPage && (
                                                <img
                                                    src={rightPage}
                                                    alt={`Página ${isMobile ? index + 1 : leftIndex + 2}`}
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="book-nav"
                                onClick={goNext}
                                disabled={animating}
                                aria-label="Página siguiente"
                            >
                                ›
                            </button>

                        </div>

                        <div className="dots" role="tablist">
                            {Array.from({ length: totalDots }).map((_, i) => {
                                const dotIndex = isMobile ? i : i * 2;

                                return (
                                    <button
                                        key={i}
                                        className={`dot ${leftIndex === dotIndex ? "active" : ""}`}
                                        onClick={() => handleDot(i)}
                                        disabled={animating}
                                    />
                                );
                            })}
                        </div>

                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}