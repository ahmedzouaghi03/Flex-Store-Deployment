import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 20 },
  }).onUploadComplete(async ({ metadata, file }) => {
    const userId = (metadata as any).userId;
    console.log("Upload complete for userId:", userId);
    console.log("file url", file.ufsUrl);

    // we wanna keep this url for creating products
    const imageUrl = file.ufsUrl;
    return { imageUrl };
  }),

  storeImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { imageUrl: file.ufsUrl };
  }),

  storeVideo: f({
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { videoUrl: file.ufsUrl };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
