import playwrightConfig from "../../../playwright.config.js";

const CONTEXT_OPTION_KEYS = ["geolocation", "permissions"];

const parseGeo = (value) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

export function getPlaywrightContextOptions(settings = null) {
  const useOptions = playwrightConfig?.use ?? {};
  const baseOptions = CONTEXT_OPTION_KEYS.reduce((options, key) => {
    if (useOptions[key] !== undefined) {
      options[key] = useOptions[key];
    }
    return options;
  }, {});

  if (!settings) return baseOptions;

  const lat = parseGeo(settings.geoLat);
  const lng = parseGeo(settings.geoLng);
  if (lat !== null && lng !== null) {
    baseOptions.geolocation = { latitude: lat, longitude: lng };
    if (Array.isArray(baseOptions.permissions)) {
      if (!baseOptions.permissions.includes("geolocation")) {
        baseOptions.permissions = [...baseOptions.permissions, "geolocation"];
      }
    } else {
      baseOptions.permissions = ["geolocation"];
    }
  }

  return baseOptions;
}
