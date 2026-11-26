export const maxEvidenceBytes = 10 * 1024 * 1024;
export const maxEvidenceFiles = 5;
export const evidenceAccept = ".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm";

export function clipboardImage(data) {
  if (!data) return null;
  const files = Array.from(data.files || []);
  if (!files.length) {
    for (const item of Array.from(data.items || [])) {
      if (item.kind !== "file") continue;
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  if (!files.length) return null;
  if (files.length > 1) return { error: "onePaste" };
  const [file] = files;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) &&
      (file.type || !/\.(png|jpe?g|webp)$/i.test(file.name)))
    return { error: "pasteFormats" };
  if (!file.size) return { error: "Select an image or video." };
  if (file.size > maxEvidenceBytes) return { error: "Each file must be 10 MB or smaller." };
  return { file };
}
