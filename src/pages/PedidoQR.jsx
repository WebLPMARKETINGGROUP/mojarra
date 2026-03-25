import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../style/pedidoQR.css";

const API_URL = import.meta.env.VITE_API_URL || "http://mojarra-backend.onrender.com";
const FRONT_URL = import.meta.env.VITE_FRONT_URL || window.location.origin;

function PedidoQR() {
    const { folio } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!folio) {
            setError("No se encontró el folio del pedido.");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API_URL}/order/${encodeURIComponent(folio)}`);

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "No se pudo obtener la orden.");
                }

                const data = await res.json();
                setOrder(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError("No se pudo cargar la información del pedido.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadOrder();

        return () => controller.abort();
    }, [folio]);

    const subtotal = useMemo(() => {
        if (!order?.items?.length) return 0;

        return order.items.reduce((acc, item) => {
            const qty = Number(item.quantity || 0);
            const price = Number(item.price || 0);
            return acc + qty * price;
        }, 0);
    }, [order]);

    const paymentLabel = useMemo(() => {
        if (!order?.paymentMethod) return "No especificado";
        return order.paymentMethod === "cash" ? "Efectivo" : "Tarjeta";
    }, [order]);

    const paymentStatusLabel = useMemo(() => {
        if (!order?.paymentStatus) return "Pendiente";
        return order.paymentStatus === "paid" ? "Pagado" : "Pendiente";
    }, [order]);

    const formatCurrency = (value) => {
        const number = Number(value || 0);
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(number);
    };

    const openMapsUrl = order?.establishment?.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.establishment.address)}`
        : "#";

    if (loading) {
        return (
            <div className="pedidoqr-page">
                <div className="pedidoqr-loader-card">
                    <div className="pedidoqr-spinner" />
                    <h2>Cargando pedido</h2>
                    <p>Estamos obteniendo la información del QR.</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="pedidoqr-page">
                <div className="pedidoqr-error-card">
                    <div className="pedidoqr-error-icon">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <h1>Pedido no encontrado</h1>
                    <p>{error || "No existe información para este folio."}</p>
                    <Link to="/" className="pedidoqr-primary-btn">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pedidoqr-page">
            <div className="pedidoqr-bg-blur pedidoqr-bg-one" />
            <div className="pedidoqr-bg-blur pedidoqr-bg-two" />

            <div className="pedidoqr-shell">
                <section className="pedidoqr-hero">
                    <div className="pedidoqr-hero-top">
                        <div className="pedidoqr-brand">
                            <div className="pedidoqr-brand-badge">
                                <i className="bi bi-qr-code-scan"></i>
                            </div>
                            <div>
                                <p className="pedidoqr-kicker">Pedido confirmado</p>
                                <h1>Tu orden está lista para consulta</h1>
                            </div>
                        </div>

                        <div className="pedidoqr-status-group">
                            <span className={`pedidoqr-chip ${paymentStatusLabel === "Pagado" ? "chip-paid" : "chip-pending"}`}>
                                {paymentStatusLabel}
                            </span>
                            <span className="pedidoqr-chip chip-soft">{paymentLabel}</span>
                        </div>
                    </div>

                    <div className="pedidoqr-folio-card">
                        <span>Folio</span>
                        <strong>{order.folio}</strong>
                    </div>
                </section>

                <section className="pedidoqr-grid">
                    <article className="pedidoqr-card pedidoqr-main-card">
                        <div className="pedidoqr-card-header">
                            <h2>Resumen del pedido</h2>
                            <p>Información completa de tu orden, tal como aparece en confirmación.</p>
                        </div>

                        <div className="pedidoqr-block">
                            <div className="pedidoqr-block-title">
                                <i className="bi bi-person-circle"></i>
                                <h3>Datos del cliente</h3>
                            </div>

                            <div className="pedidoqr-info-grid">
                                <div>
                                    <span>Nombre</span>
                                    <strong>{order.customerName || "No capturado"}</strong>
                                </div>
                                <div>
                                    <span>Teléfono</span>
                                    <strong>{order.customerPhone || "No capturado"}</strong>
                                </div>
                                <div>
                                    <span>Correo</span>
                                    <strong>{order.customerEmail || "No capturado"}</strong>
                                </div>
                                <div>
                                    <span>Método de pago</span>
                                    <strong>{paymentLabel}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="pedidoqr-block">
                            <div className="pedidoqr-block-title">
                                <i className="bi bi-shop"></i>
                                <h3>Sucursal</h3>
                            </div>

                            <div className="pedidoqr-branch-card">
                                <div className="pedidoqr-branch-icon">
                                    <i className="bi bi-geo-alt-fill"></i>
                                </div>

                                <div className="pedidoqr-branch-body">
                                    <strong>{order.establishment?.name || "Sucursal"}</strong>
                                    <p>{order.establishment?.address || "Sin dirección disponible"}</p>

                                    {order.establishment?.phone && (
                                        <a href={`tel:${order.establishment.phone}`} className="pedidoqr-link">
                                            <i className="bi bi-telephone-fill"></i>
                                            {order.establishment.phone}
                                        </a>
                                    )}

                                    <a href={openMapsUrl} target="_blank" rel="noreferrer" className="pedidoqr-link pedidoqr-link-accent">
                                        <i className="bi bi-map-fill"></i>
                                        Abrir en Maps
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="pedidoqr-block">
                            <div className="pedidoqr-block-title">
                                <i className="bi bi-bag-check-fill"></i>
                                <h3>Detalle de platillos</h3>
                            </div>

                            <div className="pedidoqr-items">
                                {order.items?.map((item) => {
                                    const qty = Number(item.quantity || 0);
                                    const price = Number(item.price || 0);
                                    const itemTotal = qty * price;

                                    return (
                                        <div className="pedidoqr-item" key={item.id}>
                                            <div className="pedidoqr-item-top">
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <span>{qty} pieza{qty !== 1 ? "s" : ""}</span>
                                                </div>

                                                <div className="pedidoqr-item-price">
                                                    {formatCurrency(itemTotal)}
                                                </div>
                                            </div>

                                            {item.modifiers?.length > 0 && (
                                                <div className="pedidoqr-modifiers">
                                                    {item.modifiers.map((mod) => (
                                                        <div className="pedidoqr-modifier" key={mod.id}>
                                                            <i className="bi bi-dot"></i>
                                                            <span>
                                                                {mod.name}
                                                                {Number(mod.price || 0) > 0 ? ` (+${formatCurrency(mod.price)})` : ""}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </article>

                    <aside className="pedidoqr-card pedidoqr-side-card">
                        <div className="pedidoqr-summary">
                            <div className="pedidoqr-summary-top">
                                <h2>Comprobante</h2>
                                <p>Versión elegante para validar el pedido al recoger.</p>
                            </div>

                            <div className="pedidoqr-summary-box">
                                <div className="pedidoqr-summary-row">
                                    <span>Folio</span>
                                    <strong>{order.folio}</strong>
                                </div>
                                <div className="pedidoqr-summary-row">
                                    <span>Sucursal</span>
                                    <strong>{order.establishment?.name || "-"}</strong>
                                </div>
                                <div className="pedidoqr-summary-row">
                                    <span>Fecha de consulta</span>
                                    <strong>{new Date(order.createdAt || Date.now()).toLocaleString("es-MX")}</strong>
                                </div>
                                <div className="pedidoqr-summary-row">
                                    <span>Subtotal</span>
                                    <strong>{formatCurrency(subtotal)}</strong>
                                </div>
                                <div className="pedidoqr-summary-row pedidoqr-total-row">
                                    <span>Total</span>
                                    <strong>{formatCurrency(order.total)}</strong>
                                </div>
                            </div>

                            <div className="pedidoqr-actions">
                                <Link to="/" className="pedidoqr-secondary-btn">
                                    Volver al inicio
                                </Link>

                                <a href={openMapsUrl} target="_blank" rel="noreferrer" className="pedidoqr-primary-btn">
                                    Ver sucursal
                                </a>
                            </div>

                            <div className="pedidoqr-note">
                                <i className="bi bi-shield-check"></i>
                                <span>Información segura y validada desde el sistema de pedidos.</span>
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
}

export default PedidoQR;