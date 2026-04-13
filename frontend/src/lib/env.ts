const fallbackApiBaseUrl = "http://localhost:8000";

function normalizeApiBaseUrl(value: string | undefined) {
  const raw = value?.trim();

  if (!raw) {
    return fallbackApiBaseUrl;
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const apiTargetLabel = apiBaseUrl.replace(/^https?:\/\//, "");
