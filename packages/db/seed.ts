import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
      basePrice: 129.99,
      isFeatured: true,
      isPublished: true,
      categoryId: running.id,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1606107557195-0f41c8383b8c?w=800&q=80",
      ],
      colors: [
        { name: "Red", hex: "#c0392b", sizes: ["40", "41", "42", "43", "44"] },
        { name: "White", hex: "#f5f5f5", sizes: ["40", "41", "42", "43", "44"] },
      ],
    },
    {
      name: "Urban Flex Low",
      slug: "urban-flex-low",
      description:
        "Clean low-profile sneaker for casual wear. Soft insole and durable rubber outsole.",
      basePrice: 89.99,
      isFeatured: true,
      isPublished: true,
      categoryId: sneakers.id,
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a6?w=800&q=80",
      ],
      colors: [
        {
          name: "Black",
          hex: "#111111",
          sizes: ["38", "39", "40", "41", "42", "43"],
        },
        {
          name: "White",
          hex: "#f5f5f5",
          sizes: ["38", "39", "40", "41", "42", "43"],
        },
      ],
    },
    {
      name: "Trail Grip Pro",
      slug: "trail-grip-pro",
      description:
        "All-terrain shoe with extra grip and ankle support for outdoor trails.",
      basePrice: 159.99,
      isFeatured: false,
      isPublished: true,
      categoryId: running.id,
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d94?w=800&q=80",
      ],
      colors: [
        { name: "Green", hex: "#4a7018", sizes: ["36", "37", "38", "39", "40"] },
        { name: "Black", hex: "#111111", sizes: ["36", "37", "38", "39", "40"] },
      ],
    },
    {
      name: "Classic Court",
      slug: "classic-court",
      description: "Timeless court silhouette with premium leather finish.",
      basePrice: 109.99,
      isFeatured: false,
      isPublished: true,
      categoryId: sneakers.id,
      images: [
        "https://images.unsplash.com/photo-1525966222134-fcfa99b3944a?w=800&q=80",
      ],
      colors: [
        {
          name: "White",
          hex: "#f5f5f5",
          sizes: ["41", "42", "43", "44", "45"],
        },
        { name: "Navy", hex: "#1a2a4a", sizes: ["41", "42", "43", "44", "45"] },
      ],
    },
  ];

  let seeded = 0;
  for (const { images, colors, ...data } of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) continue;

    await prisma.product.create({
      data: {
        ...data,
        images: {
          create: images.map((url, order) => ({ url, order })),
        },
        colors: {
          create: colors.map((color) => ({
            name: color.name,
            hex: color.hex,
            sizes: {
              create: color.sizes.map((size) => ({ size, stock: 20 })),
            },
          })),
        },
      },
    });
    seeded += 1;
  }

  console.log("Seed complete:", seeded, "products created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
