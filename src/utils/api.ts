const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string) =>
  value.startsWith('/') ? value : `/${value}`;

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const pickEnvApiBase = (): string | undefined => {
  const candidates = [
    import.meta.env.VITE_API_BASE_URL,
    import.meta.env.VITE_API_URL,
    import.meta.env.VITE_API_URL_DOCKER,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
};

const isLocalHostname = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();

  if (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('.local')
  ) {
    return true;
  }

  const segments = normalized.split('.');
  if (segments.length >= 4) {
    const first = Number.parseInt(segments[0], 10);
    const second = Number.parseInt(segments[1], 10);

    if (Number.isInteger(first) && Number.isInteger(second)) {
      if (first === 10) {
        return true;
      }

      if (first === 192 && second === 168) {
        return true;
      }

      if (first === 172 && second >= 16 && second <= 31) {
        return true;
      }
    }
  }

  return false;
};

const resolveDefaultBase = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname && isLocalHostname(hostname)) {
      return 'http://localhost:8080/api';
    }
  }

  return '/api';
};

const normalizeBase = (rawBase: string): string => {
  if (rawBase.trim().length === 0) {
    return '';
  }

  if (isHttpUrl(rawBase)) {
    return stripTrailingSlashes(rawBase);
  }

  return stripTrailingSlashes(ensureLeadingSlash(rawBase));
};

const RAW_BASE = pickEnvApiBase() ?? resolveDefaultBase();

export const API_BASE = normalizeBase(RAW_BASE);

export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.replace(/^\/+/, '');

  if (!normalizedPath) {
    return API_BASE;
  }

  if (isHttpUrl(API_BASE)) {
    return `${API_BASE}/${normalizedPath}`;
  }

  const baseWithSlash = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
  return `${baseWithSlash}${normalizedPath}`;
};

