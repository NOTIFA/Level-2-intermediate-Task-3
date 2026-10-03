// Thin API client for the Oracle Ledger backend (server.js / Express, unchanged).
// Every function here returns the parsed `data` payload on success and throws
// a plain Error with a user-readable message on failure, so components never
// need to know about response shapes or status codes.

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const PRODUCTS_URL = `${API_BASE}/api/products`;

async function parseJsonSafely(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function handleResponse(res) {
  const body = await parseJsonSafely(res);

  if (!res.ok || !body || !body.success) {
    const message = body?.error || `Request failed with status ${res.status}.`;
    throw new Error(message);
  }

  return body.data;
}

/** GET / — used purely as a lightweight "is the API up" check. */
export async function pingApi() {
  const res = await fetch(API_BASE, { method: "GET" });
  if (!res.ok) throw new Error("Bad response from API root.");
  return true;
}

/** GET /api/products */
export async function fetchProducts() {
  const res = await fetch(PRODUCTS_URL);
  return handleResponse(res);
}

/** POST /api/products */
export async function createProduct(payload) {
  const res = await fetch(PRODUCTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** PUT /api/products/:id */
export async function updateProduct(id, payload) {
  const res = await fetch(`${PRODUCTS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** DELETE /api/products/:id */
export async function deleteProduct(id) {
  const res = await fetch(`${PRODUCTS_URL}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
