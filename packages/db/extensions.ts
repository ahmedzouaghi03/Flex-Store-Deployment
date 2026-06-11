import { Prisma } from "@prisma/client";

const modelsWithIsDeleted = ["Brand", "Category", "Product"];

export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async findMany({ args, query, model }) {
          if (modelsWithIsDeleted.includes(model)) {
            args.where = { ...args.where, isDeleted: false };
          }
          return query(args);
        },
        async findUnique({ args, query, model }) {
          if (modelsWithIsDeleted.includes(model)) {
            args.where = { ...args.where, isDeleted: false };
          }
          return query(args);
        },
        async findFirst({ args, query, model }) {
          if (modelsWithIsDeleted.includes(model)) {
            args.where = { ...args.where, isDeleted: false };
          }
          return query(args);
        },
      },
    },
  });
});
