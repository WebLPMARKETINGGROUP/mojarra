require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {

    // =========================
    // CATEGORÍAS
    // =========================
    const mariscos = await prisma.category.upsert({
        where: { slug: "mariscos" },
        update: {},
        create: { name: "Mariscos", slug: "mariscos" },
    });

    const bebidas = await prisma.category.upsert({
        where: { slug: "bebidas" },
        update: {},
        create: { name: "Bebidas", slug: "bebidas" },
    });

    // =========================
    // PLATILLOS
    // =========================
    const mojarra = await prisma.dish.upsert({
        where: { slug: "mojarra-frita" },
        update: {
            imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
            price: 180,
        },
        create: {
            name: "Mojarra frita",
            slug: "mojarra-frita",
            price: 180,
            imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
            categoryId: mariscos.id,
        },
    });

    const ceviche = await prisma.dish.upsert({
        where: { slug: "ceviche" },
        update: {
            imageUrl: "https://images.unsplash.com/photo-1562967916-eb82221dfb36",
            price: 150,
            description: "Fresco ceviche de pescado con limón",
        },
        create: {
            name: "Ceviche",
            slug: "ceviche",
            price: 150,
            description: "Fresco ceviche de pescado con limón",
            imageUrl: "https://images.unsplash.com/photo-1562967916-eb82221dfb36",
            categoryId: mariscos.id,
        },
    });

    const horchata = await prisma.dish.upsert({
        where: { slug: "horchata" },
        update: {
            imageUrl: "https://images.unsplash.com/photo-1625944525533-473f1c7d54c1",
            price: 40,
            description: "Refrescante bebida tradicional",
        },
        create: {
            name: "Agua de horchata",
            slug: "horchata",
            price: 40,
            description: "Refrescante bebida tradicional",
            imageUrl: "https://images.unsplash.com/photo-1625944525533-473f1c7d54c1",
            categoryId: bebidas.id,
        },
    });

    // =========================
    // MODIFIER GROUP
    // =========================
    let grupo = await prisma.modifierGroup.findFirst({
        where: {
            name: "Preparación",
            dishId: mojarra.id,
        },
    });

    if (!grupo) {
        grupo = await prisma.modifierGroup.create({
            data: {
                name: "Preparación",
                dishId: mojarra.id,
            },
        });
    }

    // =========================
    // MODIFIERS
    // =========================
    const modifiersData = [
        { name: "Sin salsa", price: 0 },
        { name: "Sin ensalada", price: 0 },
        { name: "Extra picante", price: 10 },
    ];

    for (const mod of modifiersData) {
        const existe = await prisma.modifier.findFirst({
            where: {
                name: mod.name,
                groupId: grupo.id,
            },
        });

        if (!existe) {
            await prisma.modifier.create({
                data: {
                    ...mod,
                    groupId: grupo.id,
                },
            });
        }
    }

    console.log("🌱 Seed OK");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());