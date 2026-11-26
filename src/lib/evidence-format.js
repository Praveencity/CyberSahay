const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const movieBrands = new Set(["isom", "iso2", "iso5", "iso6", "mp41", "mp42", "avc1", "M4V ", "MSNV", "dash"]);

export function evidenceMediaType(bytes) {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(pngSignature)) return "image/png";
  if (bytes.toString("latin1", 0, 4) === "RIFF" && bytes.toString("latin1", 8, 12) === "WEBP") return "image/webp";
  if (bytes.toString("latin1", 4, 8) === "ftyp") {
    const brand = bytes.toString("latin1", 8, 12);
    if (brand === "qt  ") return "video/quicktime";
    if (movieBrands.has(brand)) return "video/mp4";
  }
  if (bytes.readUInt32BE(0) === 0x1a45dfa3 && bytes.subarray(4, 128).includes(Buffer.from([0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d]))) {
    return "video/webm";
  }
  return null;
}

export function evidenceFilename(original) {
  return original.split(/[\\/]/).at(-1)
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .trim()
    .slice(0, 180)
    .toWellFormed() || "evidence";
}
