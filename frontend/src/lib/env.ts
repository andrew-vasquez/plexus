const fallbackApiBaseUrl = "http://localhost:8000";

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? fallbackApiBaseUrl;

export const apiTargetLabel = apiBaseUrl.replace(/^https?:\/\//, "");
