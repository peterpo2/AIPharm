const normalizeBase = (value: string): string =>
  value.trim().replace(/\/+$/, "");

const collectCandidateBases = (): string[] => {
  const envCandidates = [
    import.meta.env.VITE_API_BASE_URL as string | undefined,
    import.meta.env.VITE_API_URL as string | undefined,
    import.meta.env.VITE_API_URL_DOCKER as string | undefined,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  const browserCandidates: string[] = [];
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https" : "http";
    const host = window.location.hostname || "localhost";
    const defaults = [
      `${protocol}://${host}:5000/api`,
      `${protocol}://${host}:8080/api`,
    ];

    for (const candidate of defaults) {
      if (!browserCandidates.includes(candidate)) {
        browserCandidates.push(candidate);
      }
    }
  }

  const staticFallbacks = [
    "http://localhost:5000/api",
    "http://localhost:8080/api",
  ];

  return [...envCandidates, ...browserCandidates, ...staticFallbacks];
};

const API_BASE_URL = (() => {
  const candidates = collectCandidateBases();
  const firstDefined = candidates.find((value) => value && value.trim().length > 0);
  const base = firstDefined ?? "http://localhost:5000/api";
  return normalizeBase(base);
})();

let hasLoggedBase = false;
export const logResolvedApiBase = () => {
  if (!hasLoggedBase && typeof console !== "undefined") {
    console.info(`[API] Using backend base URL: ${API_BASE_URL}`);
    hasLoggedBase = true;
  }
};

export const buildApiUrl = (path: string): string => {
  const cleanPath = path.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleanPath}`;
};

export const getApiBaseUrl = (): string => API_BASE_URL;
