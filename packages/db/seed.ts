import { PrismaClient, Gender } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const nike = await prisma.brand.upsert({
    where: { slug: "nike" },
    update: {},
    create: { name: "Nike", slug: "nike" },
  });

  const adidas = await prisma.brand.upsert({
    where: { slug: "adidas" },
    update: {},
    create: { name: "Adidas", slug: "adidas" },
  });

  const sneakers = await prisma.category.upsert({
    where: { slug: "sneakers" },
    update: {},
    create: { name: "Sneakers", slug: "sneakers" },
  });

  const running = await prisma.category.upsert({
    where: { slug: "running" },
    update: {},
    create: { name: "Running", slug: "running" },
  });

  const products = [
    {
      name: "Air Stride Runner",
      slug: "air-stride-runner",
      description:
        "Lightweight everyday runner with responsive cushioning and breathable mesh upper.",
      priceCents: 12999,
      compareAtPriceCents: 14999,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1606107557195-0f41c8383b8c?w=800&q=80",
      ],
      gender: Gender.MEN,
      sizes: ["40", "41", "42", "43", "44"],
      colors: ["Red", "White"],
      isFeatured: true,
      brandId: nike.id,
      categoryIds: [sneakers.id, running.id],
    },
    {
      name: "Urban Flex Low",
      slug: "urban-flex-low",
      description:
        "Clean low-profile sneaker for casual wear. Soft insole and durable rubber outsole.",
      priceCents: 8999,
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a6?w=800&q=80",
      ],
      gender: Gender.UNISEX,
      sizes: ["38", "39", "40", "41", "42", "43"],
      colors: ["Black", "White"],
      isFeatured: true,
      brandId: adidas.id,
      categoryIds: [sneakers.id],
    },
    {
      name: "Trail Grip Pro",
      slug: "trail-grip-pro",
      description:
        "All-terrain shoe with extra grip and ankle support for outdoor trails.",
      priceCents: 15999,
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d94?w=800&q=80",
      ],
      gender: Gender.WOMEN,
      sizes: ["36", "37", "38", "39", "40"],
      colors: ["Green", "Black"],
      brandId: nike.id,
      categoryIds: [running.id],
    },
    {
      name: "Classic Court",
      slug: "classic-court",
      description: "Timeless court silhouette with premium leather finish.",
      priceCents: 10999,
      compareAtPriceCents: 11999,
      images: [
        "https://images.unsplash.com/photo-1525966222134-fcfa99b3944a?w=800&q=80",
      ],
      gender: Gender.MEN,
      sizes: ["41", "42", "43", "44", "45"],
      colors: ["White", "Navy"],
      brandId: adidas.id,
      categoryIds: [sneakers.id],
    },
  ];

  for (const p of products) {
    const { categoryIds, ...data } = p;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        categories: { set: categoryIds.map((id) => ({ id })) },
      },
      create: {
        ...data,
        categories: { connect: categoryIds.map((id) => ({ id })) },
      },
    });
  }

  console.log("Seed complete:", products.length, "products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
