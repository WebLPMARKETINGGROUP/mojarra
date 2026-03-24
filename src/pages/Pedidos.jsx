import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../style/pedidos.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFish,
    faGlassWater,
    faIceCream,
    faMartiniGlass,
    faBowlFood,
    faLocationDot,
    faShrimp,
    faUtensils,
    faDrumstickBite,
    faBurger,
    faChild,
    faPlus,
    faStar,
    faPlateWheat
} from "@fortawesome/free-solid-svg-icons";

function Pedidos() {
    const [loading, setLoading] = useState(false);

    const [menu, setMenu] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [animateCart, setAnimateCart] = useState(false);
    const [selectedMods, setSelectedMods] = useState({});
    const [selectedDish, setSelectedDish] = useState(null);
    const [closing, setClosing] = useState(false);

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showBranchPicker, setShowBranchPicker] = useState(true);

    const [branches, setBranches] = useState([]);

    const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
    const [cardInfoOpen, setCardInfoOpen] = useState(false);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);

    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [customerData, setCustomerData] = useState({
        name: "",
        phone: "",
        email: ""
    });

    const [folio, setFolio] = useState(null);

    const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);

    const closeOrderSuccessModal = () => {
        setOrderSuccessOpen(false);
    };

    useEffect(() => {
        fetch("https://mojarra-backend.onrender.com/establishments")
            //fetch("http://localhost:3001/establishments")
            .then(res => {
                return res.json();
            })
            .then(data => {
                setBranches(data);
            })
            .catch(err => console.error(err));
    }, []);

    const fetchMenu = (establishmentId) => {
        fetch(`http://mojarra-backend.onrender.com/menu?establishmentId=${establishmentId}`)
            .then(res => res.json())
            .then(data => setMenu(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (branches.length === 0) return;

        const storedId = localStorage.getItem("establishmentId");

        if (storedId) {
            const branch = branches.find(b => String(b.id) === String(storedId));

            if (branch) {
                setSelectedBranch(branch);
                setShowBranchPicker(false);
                fetchMenu(branch.id);
            }
        }
    }, [branches]);

    useEffect(() => {
        return () => {
            localStorage.removeItem("establishmentId");
            localStorage.removeItem("establishmentName");
        };
    }, []);

    const handleSelectBranch = (branch) => {

        setSelectedBranch(branch);
        localStorage.setItem("establishmentId", String(branch.id));
        localStorage.setItem("establishmentName", branch.name);
        setShowBranchPicker(false);

        setCarrito([]);
        setSelectedMods({});
        setSelectedDish(null);
        setDrawerOpen(false);
        setPaymentMethodOpen(false);
        setCardInfoOpen(false);
        setReceiptOpen(false);
        setCustomerModalOpen(false);
        setPaymentMethod(null);
        setCustomerData({ name: "", phone: "", email: "" });

        fetchMenu(branch.id);
    };

    const handleChangeBranch = () => {
        localStorage.removeItem("establishmentId");
        localStorage.removeItem("establishmentName");

        setSelectedBranch(null);
        setShowBranchPicker(true);
        setMenu([]);
        setCarrito([]);
        setSelectedMods({});
        setSelectedDish(null);
        setDrawerOpen(false);
        setPaymentMethodOpen(false);
        setCardInfoOpen(false);
        setReceiptOpen(false);
        setCustomerModalOpen(false);
        setPaymentMethod(null);
        setCustomerData({ name: "", phone: "", email: "" });
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const getSelectedMods = (dishId) => selectedMods[dishId] || [];

    const toggleModifier = (dishId, modifier) => {
        setSelectedMods(prev => {
            const current = prev[dishId] || [];
            const exists = current.some(m => m.id === modifier.id);

            return {
                ...prev,
                [dishId]: exists
                    ? current.filter(m => m.id !== modifier.id)
                    : [...current, modifier]
            };
        });
    };

    const getPrecioFinal = (dish) => {
        const mods = getSelectedMods(dish.id);
        const extra = mods.reduce((acc, mod) => acc + (mod.price || 0), 0);
        return dish.price + extra;
    };

    const getCartKey = (dishId, modifiers = []) => {
        const modIds = modifiers.map(mod => mod.id).sort((a, b) => a - b).join("-");
        return `${dishId}-${modIds || "base"}`;
    };

    const agregarAlCarrito = (dish) => {
        const mods = getSelectedMods(dish.id);
        const key = getCartKey(dish.id, mods);
        const price = getPrecioFinal(dish);

        setCarrito(prev => {
            const existe = prev.find(p => p.key === key);

            if (existe) {
                return prev.map(p =>
                    p.key === key
                        ? { ...p, cantidad: p.cantidad + 1 }
                        : p
                );
            }

            return [
                ...prev,
                {
                    key,
                    id: dish.id,
                    name: dish.name,
                    price,
                    cantidad: 1,
                    modifiers: mods,
                    imageUrl: dish.imageUrl
                }
            ];
        });

        setAnimateCart(true);
        setSelectedDish(null);
    };

    const reducirCantidad = (dish) => {
        const mods = getSelectedMods(dish.id);
        const key = getCartKey(dish.id, mods);

        setCarrito(prev =>
            prev
                .map(p =>
                    p.key === key
                        ? { ...p, cantidad: p.cantidad - 1 }
                        : p
                )
                .filter(p => p.cantidad > 0)
        );
    };

    const eliminarDelCarrito = (item) => {
        setCarrito(prev => prev.filter(p => p.key !== item.key));
    };

    useEffect(() => {
        if (animateCart) {
            const timeout = setTimeout(() => setAnimateCart(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [animateCart]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") closeDishModal();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [selectedDish]);

    const total = carrito.reduce(
        (acc, item) => acc + item.price * item.cantidad,
        0
    );

    const getCantidad = (dish) => {
        const mods = getSelectedMods(dish.id);
        const key = getCartKey(dish.id, mods);
        const prod = carrito.find(p => p.key === key);
        return prod ? prod.cantidad : 0;
    };

    const iconosCategorias = {
        mariscos: faFish,
        bebidas: faGlassWater,
        "platillos-mas-populares": faStar,
        ceviches: faShrimp,
        tostadas: faPlateWheat,
        mojarras: faFish,
        "platos-fuertes": faDrumstickBite,
        postres: faIceCream,
        cocteleria: faMartiniGlass,
        entradas: faUtensils,
        carnes: faDrumstickBite,
        burgers: faBurger,
        ninos: faChild,
        extras: faPlus
    };

    const openDishModal = (dish) => {
        setSelectedDish(dish);
        setClosing(false);
    };

    const closeDishModal = () => {
        setClosing(true);
        setTimeout(() => {
            setSelectedDish(null);
            setClosing(false);
        }, 250);
    };

    const handlePay = () => {
        setPaymentMethodOpen(true);
    };

    const closePaymentOptions = () => {
        setPaymentMethodOpen(false);
    };

    const handleSelectCash = () => {
        setPaymentMethod("cash");
        setPaymentMethodOpen(false);
        setReceiptOpen(true);
    };

    const handleSelectCard = () => {
        setPaymentMethod("card");
        setPaymentMethodOpen(false);
        setCardInfoOpen(true);
    };

    const closeCardInfo = () => {
        setCardInfoOpen(false);
        setPaymentMethodOpen(true);
    };

    const continueFromCard = () => {
        setCardInfoOpen(false);
        setReceiptOpen(true);
    };

    const closeReceipt = () => {
        setReceiptOpen(false);
        setPaymentMethod(null);
    };

    const handleConfirmOrder = () => {
        setReceiptOpen(false);
        setCustomerModalOpen(true);
    };

    const closeCustomerModal = () => {
        setCustomerModalOpen(false);
        setReceiptOpen(true);
    };

    const normalizePhoneForWhatsApp = (phone) => {
        const digits = String(phone || "").replace(/\D/g, "");

        if (!digits) return "";
        if (digits.startsWith("52")) return digits;
        if (digits.length === 10) return `52${digits}`;

        return digits;
    };

    const buildOrderSummaryText = () => {
        const lines = [];

        lines.push("🧾 ORDEN PARA RECOGER");
        lines.push(`Folio: ${folio}`);
        lines.push("");
        lines.push(`Sucursal: ${selectedBranch?.name || ""}`);
        lines.push(`Dirección: ${selectedBranch?.address || ""}`);
        lines.push(`Tel. sucursal: ${selectedBranch?.phone || ""}`);
        lines.push("");
        lines.push(`Cliente: ${customerData.name}`);
        lines.push(`Teléfono: ${customerData.phone}`);
        lines.push(`Correo: ${customerData.email}`);
        lines.push("");
        lines.push("Detalle:");

        carrito.forEach(item => {
            lines.push(`• ${item.name} x${item.cantidad} - $${item.price * item.cantidad}`);

            if (item.modifiers?.length > 0) {
                item.modifiers.forEach(mod => {
                    lines.push(`   + ${mod.name}${mod.price > 0 ? ` ($${mod.price})` : ""}`);
                });
            }
        });

        lines.push("");
        lines.push(`Total: $${total}`);
        lines.push("");
        lines.push(`Método de pago: ${paymentMethod === "cash" ? "Efectivo" : "Tarjeta"}`);
        lines.push("");
        lines.push("Orden para recoger en sucursal.");
        lines.push("Por favor menciona tu folio al llegar.");
        lines.push("Tiempo estimado: 20-30 minutos");

        return lines.join("\n");
    };

    const handleSubmitCustomer = async () => {
        if (!customerData.name || !customerData.phone || !customerData.email) {
            alert("Por favor completa nombre, teléfono y correo.");
            return;
        }

        setLoading(true); // 👈 ACTIVAR LOADER

        try {
            const orderRes = await fetch("http://mojarra-backend.onrender.com/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items: carrito,
                    total,
                    establishmentId: selectedBranch?.id,
                    customer: customerData,
                    paymentMethod
                })
            });

            if (!orderRes.ok) {
                const errorText = await orderRes.text();
                console.error("Error backend:", errorText);
                throw new Error("Error creando la orden en backend");
            }

            const orderData = await orderRes.json();

            if (!orderData?.folio) {
                throw new Error("Respuesta inválida del servidor");
            }

            const newFolio = orderData.folio;
            setFolio(newFolio);

            const response = await fetch("http://mojarra-backend.onrender.com/send-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer: customerData,
                    order: {
                        folio: newFolio,
                        total,
                        items: carrito
                    },
                    branch: selectedBranch,
                    paymentMethod
                })
            });

            const data = await response.json();

            if (!data.ok) {
                throw new Error("Error al enviar pedido");
            }

            //alert(`Pedido confirmado 🎉\nFolio: ${newFolio}`);
            setOrderSuccessOpen(true);

            // limpiar
            setCustomerModalOpen(false);
            setReceiptOpen(false);
            setPaymentMethodOpen(false);
            setCardInfoOpen(false);
            setPaymentMethod(null);

            setCarrito([]);
            setSelectedMods({});
            setSelectedDish(null);
            setDrawerOpen(false);
            setCustomerData({ name: "", phone: "", email: "" });

        } catch (error) {
            console.error(error);
            alert("Hubo un error al procesar tu pedido 😢");
        } finally {
            setLoading(false); // 👈 SIEMPRE APAGAR LOADER
        }
    };

    if (showBranchPicker) {
        return (
            <div className="branch-picker-page">
                <div className="branch-picker-overlay"></div>

                <div className="branch-picker-content">
                    <div className="branch-picker-header">
                        <p className="branch-picker-kicker">Selecciona tu sucursal</p>
                        <h1>¿Desde qué sucursal ordenarás?</h1>
                        <p>
                            Elige la más cercana para ver el menú y más adelante dirigir el pago a la información bancaria correcta.
                        </p>
                    </div>

                    <div className="branch-grid">
                        {branches.map(branch => (
                            <button
                                key={branch.id}
                                className="branch-card"
                                onClick={() => handleSelectBranch(branch)}
                            >
                                <div className="branch-card-icon">
                                    <FontAwesomeIcon icon={faLocationDot} />
                                </div>
                                <div className="branch-card-body">
                                    <h3>{branch.name}</h3>
                                    <p>{branch.address}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <main className="pedidos-container">
                <section className="pedidos-hero text-center">
                    <p className="subtitulo">
                        FRESCURA DEL MAR, DIRECTO A TU MESA
                    </p>
                    <h1 className="titulo">Nuestro Menú</h1>

                    {selectedBranch && (
                        <div className="branch-selected-pill">
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                {selectedBranch.name}
                            </span>

                            <button
                                type="button"
                                onClick={handleChangeBranch}
                                style={{
                                    border: "none",
                                    background: "rgba(255,255,255,0.18)",
                                    color: "#fff",
                                    padding: "7px 12px",
                                    borderRadius: "999px",
                                    fontWeight: "700",
                                    fontSize: "12px",
                                    cursor: "pointer"
                                }}
                            >
                                Cambiar sucursal
                            </button>
                        </div>
                    )}

                    <div className="categorias">
                        {menu.map(cat => (
                            <button
                                key={cat.id}
                                className="btn-categoria"
                                onClick={() => scrollToSection(cat.slug)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="container pb-5">
                    {menu.map(category => (
                        <div key={category.id} id={category.slug} className="mb-5">
                            <h3 className="categoria-title">
                                <FontAwesomeIcon
                                    icon={iconosCategorias[category.slug] ?? faBowlFood}
                                />{" "}
                                {category.name}
                            </h3>

                            <div className="row g-4">
                                {category.dishes.map(dish => (
                                    <div className="col-6 col-md-4 col-lg-3" key={dish.id}>
                                        <div
                                            className="card platillo-card platillo-card-clickable"
                                            onClick={() => openDishModal(dish)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    openDishModal(dish);
                                                }
                                            }}
                                        >
                                            {/* <img
                                                src={dish.imageUrl || "https://via.placeholder.com/300"}
                                                alt={dish.name}
                                            /> */}

                                            <img
                                                src={dish.imageUrl
                                                    ? `/test_mojarra_v4/${dish.imageUrl}.png`
                                                    : "https://lamojarrafeliz.mx/wp-content/uploads/2025/01/MOJARRAS-2022-LOGO-1.png"}
                                                alt={dish.name}
                                            />

                                            <div className="card-body">
                                                <h6>{dish.name}</h6>
                                                <p className="desc">
                                                    {dish.description || "Delicioso platillo"}
                                                </p>

                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <span className="precio">
                                                        ${dish.price}
                                                    </span>

                                                    <button
                                                        className="btn-ver-opciones"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDishModal(dish);
                                                        }}
                                                    >
                                                        Ver opciones
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {selectedDish && (
                <div
                    className={`dish-modal-overlay ${closing ? "closing" : ""}`}
                    onClick={closeDishModal}
                >
                    <div
                        className="dish-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="dish-modal-close" onClick={closeDishModal}>
                            ×
                        </button>

                        {/* <img
                            className="dish-modal-image"
                            src={selectedDish.imageUrl || "https://via.placeholder.com/600"}
                            alt={selectedDish.name}
                        /> */}

                        <img
                            className="dish-modal-image"
                            src={selectedDish.imageUrl
                                ? `/test_mojarra_v4/${selectedDish.imageUrl}.png`
                                : "https://via.placeholder.com/300"}
                            alt={selectedDish.name}
                        />

                        <div className="dish-modal-body">
                            <h2>{selectedDish.name}</h2>
                            <p className="dish-modal-desc">
                                {selectedDish.description || "Delicioso platillo"}
                            </p>

                            <div className="dish-modal-price">
                                ${getPrecioFinal(selectedDish)}
                            </div>

                            {selectedDish.modifierGroups?.length > 0 && (
                                <div className="dish-modal-modifiers">
                                    {selectedDish.modifierGroups.map(group => (
                                        <div key={group.id} className="modifier-group">
                                            <h4>{group.name}</h4>

                                            {group.modifiers?.map(mod => (
                                                <label key={mod.id} className="modifier-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={getSelectedMods(selectedDish.id).some(m => m.id === mod.id)}
                                                        onChange={() => toggleModifier(selectedDish.id, mod)}
                                                    />
                                                    <span>
                                                        {mod.name}
                                                        {mod.price > 0 && ` (+$${mod.price})`}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="dish-modal-actions">
                                <button
                                    className="btn-modal-add"
                                    onClick={() => agregarAlCarrito(selectedDish)}
                                >
                                    Agregar al carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`carrito-drawer ${drawerOpen ? "open" : ""}`}>
                <div className="drawer-header">
                    <h5>🛒 Tu pedido</h5>
                    <button onClick={() => setDrawerOpen(false)}>X</button>
                </div>

                {carrito.length === 0 ? (
                    <p className="carrito-vacio">Agrega productos</p>
                ) : (
                    <>
                        <ul>
                            {carrito.map(item => (
                                <li key={item.key} className="carrito-item">
                                    <div>
                                        <span>{item.name} x {item.cantidad}</span>

                                        {item.modifiers.length > 0 && (
                                            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                                                {item.modifiers.map(mod => (
                                                    <div key={mod.id}>
                                                        + {mod.name}{mod.price > 0 ? ` ($${mod.price})` : ""}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <span>${item.price * item.cantidad}</span>

                                    <button onClick={() => eliminarDelCarrito(item)}>
                                        🗑
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="carrito-total">
                            <strong>Total:</strong>
                            <span>${total}</span>
                        </div>

                        <button className="btn-pagar" onClick={handlePay}>
                            Pagar ahora
                        </button>
                    </>
                )}
            </div>

            <button
                className={`btn-carrito-float ${animateCart ? "animate" : ""}`}
                onClick={() => setDrawerOpen(true)}
            >
                🛒
                {carrito.length > 0 && (
                    <span className="badge">
                        {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
                    </span>
                )}
            </button>

            <button className="btn-top" onClick={scrollToTop}>
                ↑
            </button>

            <Footer />

            {paymentMethodOpen && (
                <div className="payment-modal-overlay" onClick={closePaymentOptions}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <h3>Selecciona tu método de pago</h3>
                            <button onClick={closePaymentOptions}>×</button>
                        </div>

                        <div className="payment-method-grid">
                            <button className="payment-method-card cash" onClick={handleSelectCash}>
                                <i className="bi bi-cash-coin"></i>
                                <span>Efectivo</span>
                                <small>Pagar al recoger tu pedido</small>
                            </button>

                            <button className="payment-method-card card" onClick={handleSelectCard}>
                                <i className="bi bi-credit-card-2-front"></i>
                                <span>Tarjeta</span>
                                <small>Pagar con tarjeta</small>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {cardInfoOpen && (
                <div className="payment-modal-overlay" onClick={closeCardInfo}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <h3>Pago con tarjeta</h3>
                            <button onClick={closeCardInfo}>×</button>
                        </div>

                        <div className="card-coming-soon">
                            <i className="bi bi-credit-card"></i>
                            <p>El pago con tarjeta todavía no está habilitado.</p>
                            <p>Por ahora, te mostraremos tu comprobante de pedido.</p>
                        </div>

                        <div className="payment-modal-actions">
                            <button className="btn-modal-secondary" onClick={closeCardInfo}>
                                Cancelar
                            </button>
                            <button className="btn-modal-primary" onClick={continueFromCard}>
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {receiptOpen && (
                <div className="payment-modal-overlay" onClick={closeReceipt}>
                    <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <h3>Tu pedido está listo</h3>
                            <button onClick={closeReceipt}>×</button>
                        </div>

                        {/* <div className="receipt-folio">
                            <i className="bi bi-receipt-cutoff"></i>
                            <div>
                                <span>Folio</span>
                                <strong>{folio || "Generando..."}</strong>
                            </div>
                        </div> */}

                        <div className="receipt-branch">
                            <i className="bi bi-geo-alt"></i>
                            <div>
                                <span>Sucursal</span>
                                <strong>{selectedBranch?.name}</strong>
                                <p>{selectedBranch?.address}</p>
                                <p style={{ marginTop: "8px" }}>
                                    <a
                                        href={`tel:${selectedBranch?.phone || ""}`}
                                        style={{ color: "#0f9fa5", fontWeight: "700", textDecoration: "none" }}
                                    >
                                        <i className="bi bi-telephone" style={{ marginRight: "6px" }}></i>
                                        {selectedBranch?.phone}
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="receipt-map-link">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBranch?.address || "")}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <i className="bi bi-map"></i>
                                Ver en Maps
                            </a>
                        </div>

                        <div className="receipt-items">
                            {carrito.map(item => (
                                <div key={item.key} className="receipt-item">
                                    <div className="receipt-item-main">
                                        <strong>{item.name}</strong>
                                        <span>x{item.cantidad}</span>
                                    </div>

                                    <div className="receipt-item-price">
                                        ${item.price} c/u
                                    </div>

                                    {item.modifiers?.length > 0 && (
                                        <div className="receipt-modifiers">
                                            {item.modifiers.map(mod => (
                                                <div key={mod.id}>
                                                    <i className="bi bi-dot"></i>
                                                    {mod.name}{mod.price > 0 ? ` (+$${mod.price})` : ""}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="receipt-total">
                            <span>Total</span>
                            <strong>${total}</strong>
                        </div>

                        <div className="payment-method-summary">
                            <i className={paymentMethod === "cash" ? "bi bi-cash-coin" : "bi bi-credit-card-2-front"}></i>
                            <span>
                                {paymentMethod === "cash" ? "Pago en efectivo" : "Pago con tarjeta"}
                            </span>
                        </div>

                        <div className="payment-modal-actions">
                            <button className="btn-modal-secondary" onClick={closeReceipt}>
                                Volver
                            </button>
                            <button className="btn-modal-primary" onClick={handleConfirmOrder}>
                                Confirmar pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {customerModalOpen && (
                <div className="payment-modal-overlay" onClick={closeCustomerModal}>
                    <div
                        className="payment-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "520px" }}
                    >
                        <div className="payment-modal-header">
                            <h3>Datos para recoger</h3>
                            <button onClick={closeCustomerModal}>×</button>
                        </div>

                        <div className="card-coming-soon" style={{ textAlign: "left", padding: "0 0 14px" }}>
                            <p style={{ margin: 0, color: "#5d6f72" }}>
                                Captura tus datos para generar la orden y enviar la confirmación por WhatsApp y correo.
                            </p>
                            <p style={{ marginTop: "10px", color: "#0f9fa5", fontWeight: "700" }}>
                                Dudas con la sucursal: {selectedBranch?.phone}
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={customerData.name}
                                onChange={(e) =>
                                    setCustomerData({ ...customerData, name: e.target.value })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    fontSize: "14px",
                                    outline: "none"
                                }}
                            />

                            <input
                                type="tel"
                                placeholder="Teléfono"
                                value={customerData.phone}
                                onChange={(e) =>
                                    setCustomerData({ ...customerData, phone: e.target.value })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    fontSize: "14px",
                                    outline: "none"
                                }}
                            />

                            <input
                                type="email"
                                placeholder="Correo"
                                value={customerData.email}
                                onChange={(e) =>
                                    setCustomerData({ ...customerData, email: e.target.value })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    fontSize: "14px",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <div className="payment-modal-actions">
                            <button className="btn-modal-secondary" onClick={closeCustomerModal}>
                                Volver
                            </button>
                            <button className="btn-modal-primary" onClick={handleSubmitCustomer}>
                                <i className="bi bi-whatsapp" style={{ marginRight: "8px" }}></i>
                                Confirmar pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {orderSuccessOpen && (
                <div className="payment-modal-overlay" onClick={closeOrderSuccessModal}>
                    <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <h3>¡Pedido confirmado!</h3>
                            <button onClick={closeOrderSuccessModal}>×</button>
                        </div>

                        <div className="receipt-branch">
                            <i className="bi bi-receipt-cutoff"></i>
                            <div>
                                <span>Folio de compra</span>
                                <strong>{folio}</strong>
                            </div>
                        </div>

                        <div className="receipt-branch">
                            <i className="bi bi-geo-alt"></i>
                            <div>
                                <span>Ubicación del establecimiento</span>
                                <strong>{selectedBranch?.name}</strong>
                                <p>{selectedBranch?.address}</p>
                                <p style={{ marginTop: "8px" }}>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBranch?.address || "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: "#0f9fa5", fontWeight: "700", textDecoration: "none" }}
                                    >
                                        <i className="bi bi-map" style={{ marginRight: "6px" }}></i>
                                        Abrir en Maps
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="payment-modal-actions">
                            <button className="btn-modal-primary" onClick={closeOrderSuccessModal}>
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="global-loader">
                    <div className="loader-card">
                        <div className="loader-spinner"></div>
                        <p className="loader-text">Procesando tu pedido</p>
                        <div className="loader-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Pedidos;