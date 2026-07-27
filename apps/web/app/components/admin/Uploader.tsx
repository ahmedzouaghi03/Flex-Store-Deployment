"use client";

import React, { useRef, useState } from "react";
import { useUploadThing } from "@/uploadthing";
import type { OurFileRouter } from "@/api/uploadthing/core";
import { toast } from "react-hot-toast";
import { Upload } from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton"; // adjust path if needed

interface UploadResponse {
  ufsUrl: string;
  url: string;
}

interface UploaderProps {
  handleUploadComplete: (res: UploadResponse[]) => void;
  value?: string | null;
  buttonText?: string;
  maxFileCount?: number;
  endpoint?: keyof OurFileRouter;
}

export default function Uploader({
  handleUploadComplete,
  value,
  buttonText = "Upload Photo",
  maxFileCount = 1,
  endpoint = "productImage",
}: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        handleUploadComplete(res as UploadResponse[]);
        toast.success("Image uploaded successfully!");
      }
      setProgress(null);
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setProgress(null);
    },
    onUploadProgress: (p) => setProgress(p),
  });

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await startUpload(Array.from(files));
    e.target.value = "";
  };

  // Hide button if already has value (and not uploading)
  if (value && !isUploading) return null;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxFileCount > 1}
        className="hidden"
        onChange={handleFileChange}
      />

      <PrimaryButton
        as="button"
        onClick={handleClick}
        disabled={isUploading}
        loading={isUploading}
        loadingText={
          progress !== null ? `${progress}%` : "Uploading..."
        }
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4 flex-shrink-0" />
        {buttonText}
      </PrimaryButton>
    </>
  );
}
