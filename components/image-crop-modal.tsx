"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Check, X, ZoomIn } from "lucide-react";
import { getCroppedFile, type PixelCrop } from "@/lib/crop-image";

export function ImageCropModal({
  imageSrc,
  fileName,
  aspect,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  fileName: string;
  aspect: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedFile(imageSrc, croppedAreaPixels, fileName);
      onConfirm(file);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="flex items-center gap-3 bg-black px-5 py-3">
        <ZoomIn size={16} className="text-white/60" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-white"
        />
      </div>

      <div className="flex items-center justify-between gap-3 bg-black px-5 pb-6 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-medium text-white"
        >
          <X size={16} /> Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-black disabled:opacity-60"
        >
          <Check size={16} /> {isProcessing ? "Ajustando..." : "Usar foto"}
        </button>
      </div>
    </div>
  );
}
