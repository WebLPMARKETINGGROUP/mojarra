import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inicio from "./pages/Inicio";
import Nosotros from "./pages/Nosotros";
import Sucursales from "./pages/Sucursales";
import Menu from "./pages/Menu";
import Pedidos from "./pages/Pedidos";

function App() {
    return (
        <BrowserRouter basename="/test_mojarra_v4">

            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/sucursales" element={<Sucursales />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/pedidos" element={<Pedidos />} />
            </Routes>

        </BrowserRouter>
    )
}

export default App