require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const axios = require("axios");

const nodemailer = require("nodemailer");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const path = require("path");
const logoPath = path.join(__dirname, "../src/assets/img/logo.png");

const QRCode = require("qrcode");

const { Resend } = require('resend');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

function normalizeText(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, 'y')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

// Orden exacto que quieres en frontend
const menuOrder = [
    'Entradas',
    'Cocteleria',
    'Ceviches',
    'Caldos de mariscos',
    'Tostadas',
    'Mojarras',
    'Camarones',
    'Pulpo',
    'Atún & salmon',
    'Filetes de pescado',
    'Carnes',
    'Burgers',
    'Niños',
    'Extras',
    'Nuestra cocina',
    'Tacos & mas',
    'Ala leña',
    'Postres',
    'Café',
    'Bebidas y cervezas',
    'Jarras',
    'Bebidas',
];

const orderMap = new Map(
    menuOrder.map((name, index) => [normalizeText(name), index])
);

function getCategoryOrderValue(category) {
    const nameKey = normalizeText(category.name);
    const slugKey = normalizeText(category.slug);

    if (orderMap.has(nameKey)) return orderMap.get(nameKey);
    if (orderMap.has(slugKey)) return orderMap.get(slugKey);

    return Number.MAX_SAFE_INTEGER;
}

// =========================
// GET ESTABLISHMENTS
// =========================
app.get('/establishments', async (req, res) => {
    try {
        const establishments = await prisma.establishment.findMany({
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
            },
            orderBy: {
                id: 'asc'
            }
        });

        res.json(establishments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo sucursales' });
    }
});

app.get("/order/:folio", async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: {
                folio: req.params.folio
            },
            include: {
                items: {
                    include: {
                        modifiers: true
                    }
                },
                establishment: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: "Orden no encontrada" });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo orden" });
    }
});

// =========================
// GET MENU
// =========================
app.get('/menu', async (req, res) => {

    try {
        const [categories, popularDishes] = await Promise.all([
            prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    dishes: {
                        orderBy: {
                            id: 'asc',
                        },
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            price: true,
                            description: true,
                            imageUrl: true,
                            timesSold: true,
                            modifierGroups: {
                                select: {
                                    id: true,
                                    name: true,
                                    modifiers: {
                                        select: {
                                            id: true,
                                            name: true,
                                            price: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            prisma.dish.findMany({
                orderBy: [
                    { timesSold: 'desc' },
                    { id: 'asc' },
                ],
                take: 4,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    description: true,
                    imageUrl: true,
                    timesSold: true,
                    modifierGroups: {
                        select: {
                            id: true,
                            name: true,
                            modifiers: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        // Solo dejamos las categorías que sí existen en el orden deseado
        const filteredCategories = categories
            .filter((category) => getCategoryOrderValue(category) !== Number.MAX_SAFE_INTEGER)
            .sort((a, b) => getCategoryOrderValue(a) - getCategoryOrderValue(b));

        const menu = [
            {
                id: 'populars',
                name: 'Platillos más populares',
                slug: 'platillos-mas-populares',
                dishes: popularDishes,
            },
            ...filteredCategories,
        ];

        res.json(menu);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo menú' });
    }
});

app.post("/send-order", async (req, res) => {
    const { customer, order, branch, paymentMethod } = req.body;

    const metodo = paymentMethod === "cash"
        ? "Efectivo"
        : "Pagado en linea";

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const qrDataUrl = await QRCode.toDataURL(
        `${frontendUrl}/pedido/${encodeURIComponent(order.folio)}`,
        {
            width: 300,
            margin: 2,
            color: {
                dark: "#0f9fa5",
                light: "#ffffff"
            }
        }
    );

    const qrBase64 = qrDataUrl.split(",")[1];

    // WHATSAPP (ejemplo con Meta Cloud API)
    try {
        // 🔥 formatear teléfono (solo números)
        const phone = customer.phone.replace(/\D/g, "");

        let formattedPhone = phone;

        // si son 10 dígitos → agrega 52 (México)
        if (phone.length === 10) {
            formattedPhone = `52${phone}`;
        }

        // si ya viene con 52 o 521 lo respeta

        console.log("📲 Enviando WhatsApp a:", formattedPhone);

        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: formattedPhone,
                type: "template",
                template: {
                    name: "pedido_confirmado",
                    language: { code: "es_MX" },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: customer.name },
                                { type: "text", text: order.folio },
                                { type: "text", text: String(order.total) },
                                { type: "text", text: branch.name }
                            ]
                        },
                        {
                            type: "button",
                            sub_type: "url",
                            index: "0",
                            parameters: [
                                {
                                    type: "text",
                                    text: order.folio // dinámico para tu link
                                }
                            ]
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ WhatsApp enviado:", response.data);

    } catch (error) {
        console.error("❌ Error enviando WhatsApp:");

        if (error.response) {
            console.error("📩 Meta respondió:", error.response.data);
        } else {
            console.error(error.message);
        }
    }

    // EMAIL

    try {

        const logoSrc = `${frontendUrl}/logo.png`;

        await resend.emails.send({
            from: 'Mojarra App <pedidos@lpmarketinggroup.com.mx>',
            //from: 'Mojarra App <onboarding@resend.dev>', // luego cambias dominio
            to: customer.email,
            //to: 'soporte@lpmarketinggroup.com.mx',
            //to: 'jl_mora@outlook.es',
            subject: `🧾 Pedido confirmado ${order.folio}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6f8; padding:30px;">
                    
                    <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.08);">

                        <!-- HEADER -->
                        <div style="background:linear-gradient(135deg,#0f9fa5,#0c7c80); padding:28px; text-align:center;">
                            <img src="${logoSrc}" style="width:110px; margin-bottom:10px;" />
                            <h2 style="color:#fff; margin:0;">Confirmación de pedido</h2>
                            <p style="color:#ff5f2e; margin:3px 0 0;">Gracias por tu compra 🙌</p>
                        </div>

                        <!-- FOLIO -->
                        <div style="padding:20px; text-align:center;">
                            <span style="font-size:12px; color:#999; letter-spacing:1px;">FOLIO</span>
                            <h1 style="margin:6px 0; color:#0f9fa5;">${order.folio}</h1>
                            <h2 style="margin:6px 0; color:#FFD700;">Metodo de pago: ${metodo}</h2>
                        </div>

                        <!-- CLIENTE -->
                        <div style="padding:20px; border-top:1px solid #eee;">
                            <h3 style="margin-bottom:12px;">👤 Datos del cliente</h3>
                            <p><strong>Nombre:</strong> ${customer.name}</p>
                            <p><strong>Teléfono:</strong> ${customer.phone}</p>
                            <p><strong>Correo:</strong> ${customer.email}</p>
                        </div>

                        <!-- SUCURSAL -->
                        <div style="padding:20px; border-top:1px solid #eee;">
                            <h3 style="margin-bottom:12px;">📍 Sucursal</h3>
                            <p><strong>${branch.name}</strong></p>
                            <p style="margin:4px 0 10px;">${branch.address}</p>
                            <p>📞 ${branch.phone}</p>

                            <a 
                                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address || "")}" 
                                target="_blank"
                                style="
                                    display:inline-block;
                                    margin-top:12px;
                                    padding:10px 16px;
                                    background:#0f9fa5;
                                    color:#fff;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-weight:600;
                                    font-size:14px;
                                "
                            >
                                📍 Ver ubicación en Maps
                            </a>
                        </div>

                        <!-- PRODUCTOS -->
                        <div style="padding:20px; border-top:1px solid #eee;">
                            <h3 style="margin-bottom:15px;">🛒 Tu pedido</h3>

                            ${order.items.map(item => {
                const qty = item.cantidad || item.quantity || 0;
                const price = Number(item.price) || 0;
                const subtotal = price * qty;

                return `
                                <div style="
                                    margin-bottom:14px; 
                                    padding:14px; 
                                    border-radius:10px; 
                                    background:#fafafa;
                                    border:1px solid #eee;
                                ">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <strong style="font-size:15px;">${item.name} x${qty}</strong>
                                        <span style="font-weight:600;">$${subtotal}</span>
                                    </div>

                                    ${(item.modifiers || []).map(mod => `
                                        <div style="font-size:13px; color:#666; margin-top:4px;">
                                            + ${mod.name} ${mod.price > 0 ? `($${mod.price})` : ""}
                                        </div>
                                    `).join("")}
                                </div>
                                `;
            }).join("")}
                        </div>

                        <!-- TOTAL -->
                        <div style="padding:20px; border-top:1px solid #eee;">
                            <div style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                                font-size:18px;
                                font-weight:bold;
                            ">
                                <span>Total</span>
                                <span style="color:#0f9fa5;">$${Number(order.total) || 0}</span>
                            </div>
                        </div>

                        <!-- QR -->
                        <div style="padding:20px; border-top:1px solid #eee; text-align:center;">
                            <div style="
                                display:inline-block;
                                padding:18px;
                                border-radius:18px;
                                background:linear-gradient(180deg,#f9fbfc,#eef8f8);
                                border:1px solid #dff1f1;
                                box-shadow:0 8px 22px rgba(15,159,165,0.08);
                            ">
                                <p style="margin:0 0 8px; font-size:12px; letter-spacing:1px; color:#7a8a8d; text-transform:uppercase;">
                                    Escanea tu QR
                                </p>

                                <img
                                    src="cid:qr-code"
                                    alt="QR del pedido"
                                    style="
                                        width:160px;
                                        height:160px;
                                        display:block;
                                        margin:0 auto;
                                        border-radius:14px;
                                        background:#fff;
                                        padding:10px;
                                    "
                                />

                                <p style="margin:10px 0 0; font-size:13px; color:#556264;">
                                    Folio: <strong style="color:#0f9fa5;">${order.folio}</strong>
                                </p>
                                <p style="margin:6px 0 0; font-size:12px; color:#7a8a8d;">
                                    Presenta este código al recoger tu pedido
                                </p>
                            </div>
                        </div>

                        <!-- FOOTER -->
                        <div style="background:#fafafa; padding:20px; text-align:center; font-size:13px; color:#777;">
                            <p style="margin:0;">⏱ Tiempo estimado: <strong>20-30 minutos</strong></p>
                            <p style="margin:6px 0;">Presenta tu folio al recoger tu pedido</p>
                            <p style="margin-top:10px;">Gracias por confiar en nosotros 💙</p>
                        </div>

                    </div>
                </div>
        `,
            attachments: [
                {
                    filename: `qr-${order.folio}.png`,
                    content: qrBase64,
                    contentId: "qr-code",
                }
            ]
        });

    } catch (err) {
        console.error("❌ ERROR RESEND:", err);
    }

    res.json({ ok: true });
});

app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("✅ Webhook verificado");
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
    console.log("📩 Evento WhatsApp:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// =========================
// CREAR ORDEN
// =========================
app.post('/orders', async (req, res) => {
    try {

        const { items, total, establishmentId, customer, paymentMethod } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "No hay productos en la orden" });
        }

        if (!items.every(item => item.id && Number(item.cantidad) > 0)) {
            return res.status(400).json({ error: "Items inválidos" });
        }

        const now = new Date();

        const dia = String(now.getDate()).padStart(2, '0');
        const mes = String(now.getMonth() + 1).padStart(2, '0');
        const anio = now.getFullYear();

        // 1. Crear orden con folio temporal
        const order = await prisma.order.create({
            data: {
                folio: "TEMP",
                total,
                paymentMethod: paymentMethod || 'cash',
                paymentStatus: 'pending',

                customerName: customer?.name || null,
                customerPhone: customer?.phone || null,
                customerEmail: customer?.email || null,

                establishmentId: establishmentId || 1,
                items: {
                    create: items.map(item => ({
                        dishId: item.id,
                        name: item.name,
                        quantity: item.cantidad,
                        price: item.price,
                        modifiers: {
                            create: (item.modifiers || []).map(mod => ({
                                modifierId: mod.id,
                                name: mod.name,
                                price: mod.price,
                            })),
                        },
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        modifiers: true,
                    },
                },
            },
        });

        // 🔥 MAPA PRO DE SUCURSALES
        const branchMap = {
            1: 'REF',
            2: 'MIL',
            3: 'TEJ',
            4: 'SGR'
        };

        // fallback dinámico si no existe en el mapa
        let abbr = branchMap[establishmentId];

        if (!abbr) {
            const establishment = await prisma.establishment.findUnique({
                where: { id: establishmentId || 1 }
            });

            abbr = (establishment?.name || 'GEN')
                .replace(/^(el|la|los|las)\s+/i, '')
                .trim()
                .substring(0, 3)
                .toUpperCase();
        }

        // 2. Generar folio final con ID
        const idFormateado = String(order.id).padStart(4, '0');
        const folioFinal = `ORD-${abbr}-${dia}${mes}${anio}-${idFormateado}`;

        // 3. Actualizar orden con folio real
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: { folio: folioFinal },
            include: {
                items: {
                    include: {
                        modifiers: true,
                    },
                },
            },
        });

        res.json(updatedOrder);

    } catch (error) {
        console.error("🔥 ERROR DETALLADO:", error);
        console.error("🔥 STACK:", error.stack);
        res.status(500).json({ error: 'Error creando orden' });
    }
});

// =========================
app.listen(3001, () => {
    console.log('🔥 http://mojarra-backend.onrender.com');
});