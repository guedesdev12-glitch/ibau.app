"use client";

import { useState } from "react";
import { ImageCropModal } from "@/components/image-crop-modal";

export function useCroppedImagePicker(aspect: number) {
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [rawName, setRawName] = useState("");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawName(file.name);
    const reader = new FileReader();
    reader.onload = () => setRawSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function reset() {
    setCroppedFile(null);
  }

  const modal = rawSrc ? (
    <ImageCropModal
      imageSrc={rawSrc}
      fileName={rawName}
      aspect={aspect}
      onCancel={() => setRawSrc(null)}
      onConfirm={(file) => {
        setCroppedFile(file);
        setRawSrc(null);
      }}
    />
  ) : null;

  return { croppedFile, onSelect, modal, reset };
}
