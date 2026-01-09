import fs from "fs/promises";
import path from "path";

export const DEFAULT_SETTINGS = {
  language: "id",
  maxTimeoutMs: 5000,
  geoLat: "",
  geoLng: "",
};

const SETTINGS_PATH = path.join(process.cwd(), "files", "settings.json");

const normalizeNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallback;
};

const normalizeString = (value) => (value === null || value === undefined ? "" : String(value));

export const normalizeSettings = (input) => {
  const payload = input && typeof input === "object" ? input : {};
  return {
    language: normalizeString(payload.language) || DEFAULT_SETTINGS.language,
    maxTimeoutMs: normalizeNumber(payload.maxTimeoutMs, DEFAULT_SETTINGS.maxTimeoutMs),
    geoLat: normalizeString(payload.geoLat),
    geoLng: normalizeString(payload.geoLng),
  };
};

export async function readSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return normalizeSettings({ ...DEFAULT_SETTINGS, ...parsed });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS };
  }
}

export async function writeSettings(nextSettings) {
  const normalized = normalizeSettings(nextSettings);
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(normalized, null, 2), "utf-8");
  return normalized;
}
