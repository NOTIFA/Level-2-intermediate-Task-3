import { useCallback, useEffect, useState } from "react";
import {
  pingApi,
  fetchProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from "../api/products.js";

/**
 * Owns the ledger's data and connection state, and exposes the CRUD actions
 * components need. Keeping this in one hook means App and its children stay
 * declarative: they read `products` / `status` and call the action fns.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState("checking"); // "checking" | "online" | "offline"

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      await pingApi();
      setConnection("online");
    } catch {
      setConnection("offline");
      setStatus("error");
      setError("Can't reach the API. Start it with \"npm start\" in the API folder, then hit Refresh.");
      return;
    }

    try {
      const data = await fetchProducts();
      setProducts(data);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProduct = useCallback(async (payload) => {
    const created = await apiCreateProduct(payload);
    await refresh();
    return created;
  }, [refresh]);

  const saveProduct = useCallback(async (id, payload) => {
    const updated = await apiUpdateProduct(id, payload);
    await refresh();
    return updated;
  }, [refresh]);

  const removeProduct = useCallback(async (id) => {
    await apiDeleteProduct(id);
    await refresh();
  }, [refresh]);

  return {
    products,
    status,
    error,
    connection,
    refresh,
    addProduct,
    saveProduct,
    removeProduct,
  };
}
