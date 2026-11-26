"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { clipboardImage } from "../../config/evidence";

export function handleImagePaste(event, select, setError) {
  const pasted = clipboardImage(event.clipboardData);
  if (!pasted) return;
  event.preventDefault();
  if (pasted.error) return setError(pasted.error);
  select(pasted.file);
}

export function PendingAttachment({ file, remove, disabled, w }) {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="pending-attachment">
      {file.type.startsWith("image/") && preview && (
        <Image src={preview} unoptimized width={64} height={64} alt="" />
      )}
      <span role="status">{file.name}</span>
      <button type="button" className="portal-secondary" disabled={disabled} onClick={remove} aria-label={w("evidenceRemove")}>
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
