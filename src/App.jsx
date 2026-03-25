import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Inicio from "./pages/Inicio";
import Nosotros from "./pages/Nosotros";
import Sucursales from "./pages/Sucursales";
import Menu from "./pages/Menu";
import Pedidos from "./pages/Pedidos";
import PedidoQR from "./pages/PedidoQR";

import Loader from "./components/Loader.jsx";

function App() {
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let value = 0;

        const interval = setInterval(() => {
            value += Math.random() * 15; // avance variable

            if (value >= 90) {
                value = 90; // se frena antes del final
                clearInterval(interval);
            }

            setProgress(Math.floor(value));
        }, 200);

        const finish = setTimeout(() => {
            setProgress(100); // llega a 100 exacto
            setLoading(false);

            setTimeout(() => {
                setVisible(false);
            }, 600);
        }, 3500);

        return () => {
            clearInterval(interval);
            clearTimeout(finish);
        };
    }, []);

    return (
        <>
            <BrowserRouter basename="/test_mojarra_v6">
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/sucursales" element={<Sucursales />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/pedidos" element={<Pedidos />} />
                    <Route path="/pedido/:folio" element={<PedidoQR />} />
                </Routes>
            </BrowserRouter>

            {visible && <Loader loading={loading} progress={progress} />}
        </>
    );
}

export default App;