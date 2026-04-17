require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const data = require('./data.json');

async function upsertCategory(category) {
  return prisma.category.upsert({
    where: { slug: category.slug },
    update: { name: category.name },
    create: {
      name: category.name,
      slug: category.slug,
    },
  });
}

async function upsertEstablishment(establishment) {
  const existing = await prisma.establishment.findFirst({
    where: { name: establishment.name },
  });

  const payload = {
    name: establishment.name,
    address: establishment.address,
    phone: establishment.phone,
    mapUrl: establishment.mapUrl,
    whatsappUrl: establishment.whatsappUrl,
  };

  if (existing) {
    return prisma.establishment.update({
      where: { id: existing.id },
      data: payload,
    });
  }

  return prisma.establishment.create({
    data: payload,
  });
}

async function upsertModifier(modifier) {
  const existing = await prisma.modifier.findFirst({
    where: { name: modifier.name },
  });

  const payload = {
    name: modifier.name,
    price: modifier.price,
    groupId: null,
  };

  if (existing) {
    return prisma.modifier.update({
      where: { id: existing.id },
      data: {
        price: modifier.price,
      },
    });
  }

  return prisma.modifier.create({
    data: payload,
  });
}

async function upsertDish(dish, categoryMap) {
  const existing = await prisma.dish.findFirst({
    where: { slug: dish.slug },
  });

  const payload = {
    name: dish.name,
    slug: dish.slug,
    description: dish.description ?? null,
    price: dish.price,
    imageUrl: dish.imageUrl || 'logo',
    categoryId: categoryMap[dish.categorySlug],
  };

  if (!payload.categoryId) {
    throw new Error(`No existe la categoría "${dish.categorySlug}" para el platillo "${dish.name}"`);
  }

  if (existing) {
    return prisma.dish.update({
      where: { id: existing.id },
      data: payload,
    });
  }

  return prisma.dish.create({
    data: payload,
  });
}

async function main() {
  console.log('🌱 Iniciando seed...');

  // Categorías
  const categoryMap = {};
  for (const category of data.categories) {
    const created = await upsertCategory(category);
    categoryMap[created.slug] = created.id;
  }

  console.log(`✅ Categorías: ${Object.keys(categoryMap).length}`);

  // Establecimientos
  for (const establishment of data.establishments) {
    await upsertEstablishment(establishment);
  }

  console.log(`✅ Establecimientos: ${data.establishments.length}`);

  // Modifiers
  for (const modifier of data.modifiers) {
    await upsertModifier(modifier);
  }

  console.log(`✅ Modifiers: ${data.modifiers.length}`);

  // Dishes
  for (const dish of data.dishes) {
    await upsertDish(dish, categoryMap);
  }

  console.log(`✅ Platillos: ${data.dishes.length}`);
  console.log('🎉 Seed terminado');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });