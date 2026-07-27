import { Prisma } from "@prisma/client";

const modelsWithIsDeleted = ["User"];

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
    model: {
      $allModels: {
        async softDelete<T extends { id: string }>(this: any, where: T) {
          if (modelsWithIsDeleted.includes(this.name)) {
            return this.update({ where, data: { isDeleted: true } });
          }
          throw new Error("Model does not support soft delete.");
        },
        async restore<T extends { id: string }>(this: any, where: T) {
          if (modelsWithIsDeleted.includes(this.name)) {
            return this.update({ where, data: { isDeleted: false } });
          }
          throw new Error("Model does not support restore.");
        },
        async findAll<T extends { where?: object }>(this: any, args?: T) {
          return this.findMany({ ...args, where: { ...args?.where } });
        },
      },
    },
  });
});
