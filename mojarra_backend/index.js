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

    // const qrDataUrl = await QRCode.toDataURL(`Folio: ${order.folio}`);

    const qrDataUrl = await QRCode.toDataURL(
        JSON.stringify({
            folio: order.folio,
            customer: customer?.name || "",
            branch: branch?.name || "",
            total: order.total || 0
        }),
        {
            width: 300,
            margin: 2,
            color: {
                dark: "#0f9fa5",   // color marca 🔥
                light: "#ffffff"
            }
        }
    );

    /*
    const qrDataUrl = await QRCode.toDataURL(
        `https://tu-dominio.com/orden/${order.folio}`,
        {
            width: 300,
            margin: 2,
            color: {
                dark: "#0f9fa5",
                light: "#ffffff"
            }
        }
    );
    */

    const message = `
        🧾 *PEDIDO CONFIRMADO*

        📄 *Folio:* ${order.folio}
        💳 *Método de pago:* ${metodo}

        👤 *Cliente*
        ${customer.name}
        📞 ${customer.phone}

        📍 *Sucursal*
        ${branch.name}
        ${branch.address}
        📞 ${branch.phone}

        🛒 *Tu pedido*
        ${order.items.map(item => {
        const qty = item.cantidad || item.quantity || 0;
        const price = Number(item.price) || 0;
        const subtotal = price * qty;

        return `• *${item.name}* x${qty} - $${subtotal}
        ${(item.modifiers || []).map(mod =>
            `   + ${mod.name} ${mod.price > 0 ? `($${mod.price})` : ""}`
        ).join("\n")}`;
    }).join("\n\n")}

        💰 *Total:* $${Number(order.total) || 0}

        ⏱ Tiempo estimado: 20-30 minutos

        👉 Presenta tu folio al recoger tu pedido
        🙏 ¡Gracias por tu compra!
    `;

    // WHATSAPP (ejemplo con Meta Cloud API)
    // await axios.post(`https://graph.facebook.com/v18.0/TU_PHONE_ID/messages`, {
    //     messaging_product: "whatsapp",
    //     to: branch.phone,
    //     type: "text",
    //     text: { body: message }
    // }, {
    //     headers: {
    //         Authorization: `Bearer TU_TOKEN`
    //     }
    // });

    console.log("📲 WhatsApp (mock):");
    console.log(message);

    // EMAIL
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "jorgrey98@gmail.com",
            pass: "iyuwzdgopyghyqqt"
        }
    });

    await transporter.sendMail({
        from: `"Mojarra App" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `🧾 Pedido confirmado ${order.folio}`,
        html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6f8; padding:30px;">
                    
                    <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.08);">

                        <!-- HEADER -->
                        <div style="background:linear-gradient(135deg,#0f9fa5,#0c7c80); padding:28px; text-align:center;">
                            <img src="cid:logo" style="width:110px; margin-bottom:10px;" />
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

                            <!-- BOTÓN MAPS -->
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
                                    src="${qrDataUrl}"
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
                filename: "logo.png",
                path: logoPath,
                cid: "logo"
            }
        ]
    });

    res.json({ ok: true });
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
            console.log("ITEMS INVALIDOS:", items);
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
        const folioFinal = `ORD-${abbr}-${anio}${mes}${dia}-${idFormateado}`;

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
        console.error(error);
        res.status(500).json({ error: 'Error creando orden' });
    }
});

// =========================
app.listen(3001, () => {
    console.log('🔥 http://mojarra-backend.onrender.com');
});