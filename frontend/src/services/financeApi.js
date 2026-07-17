const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "finstart-auth-token";
const AUTH_USER_KEY = "finstart-auth-user";
const AUTH_EXPIRES_KEY = "finstart-auth-expires-at";
const PUBLIC_AUTH_PATHS = new Set([
  "/auth/login",
]);
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const RECENT_MUTATION_TTL_MS = 1500;
const inFlightMutations = new Map();
const recentMutations = new Map();

function storagePair() {
  if (typeof window === "undefined") return [];
  return [window.localStorage, window.sessionStorage];
}

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ||
    window.sessionStorage.getItem(AUTH_TOKEN_KEY) ||
    ""
  );
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(
      window.localStorage.getItem(AUTH_USER_KEY) ||
        window.sessionStorage.getItem(AUTH_USER_KEY) ||
        "null",
    );
  } catch {
    return null;
  }
}

export function saveAuthSession(session, remember = false) {
  if (typeof window === "undefined") return;
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  other.removeItem(AUTH_TOKEN_KEY);
  other.removeItem(AUTH_USER_KEY);
  other.removeItem(AUTH_EXPIRES_KEY);
  target.setItem(AUTH_TOKEN_KEY, session?.token || "");
  target.setItem(AUTH_USER_KEY, JSON.stringify(session?.user || null));
  target.setItem(AUTH_EXPIRES_KEY, session?.expires_at || "");
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  for (const storage of storagePair()) {
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(AUTH_USER_KEY);
    storage.removeItem(AUTH_EXPIRES_KEY);
  }
}

export function hasAuthSession() {
  if (typeof window === "undefined") return false;
  const token = getStoredToken();
  const expiresAt =
    window.localStorage.getItem(AUTH_EXPIRES_KEY) ||
    window.sessionStorage.getItem(AUTH_EXPIRES_KEY) ||
    "";
  return Boolean(token && (!expiresAt || Date.parse(expiresAt) > Date.now()));
}

function buildUrl(path, query = null) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);

  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function stableHash(value) {
  let hash = 2166136261;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

async function request(path, options = {}) {
  const { method = "GET", body, query, headers = {} } = options;
  const normalizedMethod = String(method || "GET").toUpperCase();
  const url = buildUrl(path, query);
  const requestBody = body !== undefined ? JSON.stringify(body) : undefined;
  const mutationKey = MUTATION_METHODS.has(normalizedMethod)
    ? `${normalizedMethod} ${url} ${requestBody || ""}`
    : "";
  const idempotencyKey = mutationKey
    ? `finstart-${stableHash(mutationKey)}`
    : "";

  if (mutationKey && inFlightMutations.has(mutationKey)) {
    return inFlightMutations.get(mutationKey);
  }
  if (mutationKey) {
    const recent = recentMutations.get(mutationKey);
    if (recent && recent.expiresAt > Date.now()) {
      return recent.task;
    }
    if (recent) recentMutations.delete(mutationKey);
  }

  const task = (async () => {
    try {
      const response = await fetch(url, {
        method: normalizedMethod,
        headers: {
          Accept: "application/json",
          ...(getStoredToken()
            ? { Authorization: `Bearer ${getStoredToken()}` }
            : {}),
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
          ...headers,
        },
        body: requestBody,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        // Endpoint non-JSON tetap dilaporkan dengan pesan yang jelas.
      }

      console.log(`API request to ${url}`, { method: normalizedMethod, responseStatus: response.status, responsePayload: payload });

    if (!response.ok || payload?.success === false) {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      const shouldExpireCurrentSession =
        response.status === 401 && !PUBLIC_AUTH_PATHS.has(normalizedPath);

      if (shouldExpireCurrentSession) {
        clearAuthSession();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("finstart-auth-expired"));
        }
      }

      const error = new Error(
        payload?.message || `Permintaan API gagal (${response.status}).`,
      );
      error.status = response.status;
      error.payload = payload;
      console.error("API Error Details:", { error, payload, response }); // Log full details!
      throw error;
    }

      return payload?.data;
    } catch (networkError) {
      console.error("Network error in API request:", networkError);
      throw networkError;
    }
  })();

  if (mutationKey) {
    inFlightMutations.set(mutationKey, task);
    task.then(
      () => {
        inFlightMutations.delete(mutationKey);
        recentMutations.set(mutationKey, {
          task,
          expiresAt: Date.now() + RECENT_MUTATION_TTL_MS,
        });
        globalThis.setTimeout?.(
          () => {
            const recent = recentMutations.get(mutationKey);
            if (recent?.task === task) recentMutations.delete(mutationKey);
          },
          RECENT_MUTATION_TTL_MS,
        );
      },
      () => inFlightMutations.delete(mutationKey),
    );
  }

  return task;
}

export const financeApi = {
  health: () => request("/health"),
  login: (email, password, rememberDevice = false) =>
    request("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
        remember_device: Boolean(rememberDevice),
      },
    }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST", body: {} }),
  get: (path, query) => request(path, { query }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export function getApiErrorMessage(
  error,
  fallback = "Gagal terhubung ke API FinStart.",
) {
  return error?.payload?.message || error?.message || fallback;
}
