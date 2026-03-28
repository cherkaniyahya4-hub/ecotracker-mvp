const isHex = (value) => /^[0-9a-f]+$/i.test(value);

export const byteaHexToDataUrl = (value, mimeType = "application/octet-stream") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const hex = raw.startsWith("\\x") ? raw.slice(2) : raw;
  if (!hex || hex.length % 2 !== 0 || !isHex(hex)) {
    return "";
  }

  let binary = "";
  for (let index = 0; index < hex.length; index += 2) {
    const byte = Number.parseInt(hex.slice(index, index + 2), 16);
    binary += String.fromCharCode(byte);
  }

  return `data:${mimeType || "application/octet-stream"};base64,${btoa(binary)}`;
};

export const resolveDbImageSource = ({
  blob,
  mimeType,
  url,
  fallback = "",
} = {}) => {
  const blobUrl = byteaHexToDataUrl(blob, mimeType);
  if (blobUrl) return blobUrl;
  if (url) return String(url);
  return fallback;
};

export const buildSvgPlaceholderDataUrl = (label = "Eco") => {
  const safeLabel = String(label || "Eco").slice(0, 18);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 280"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1f5b36"/><stop offset="100%" stop-color="#0d2d1d"/></linearGradient></defs><rect width="420" height="280" fill="url(#g)"/><text x="50%" y="54%" font-size="34" text-anchor="middle" fill="#e8fff1" font-family="Arial, sans-serif">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
