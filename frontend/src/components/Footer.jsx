import { API_BASE } from "../api/products.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      Talking to <code>{API_BASE}</code> — start the API server first.
    </footer>
  );
}
