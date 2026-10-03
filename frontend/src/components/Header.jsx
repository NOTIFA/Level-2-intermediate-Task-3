import ConnectionStatus from "./ConnectionStatus.jsx";

export default function Header({ connection }) {
  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-mark">Oracle Ledger</span>
        <span className="brand-sub">Inventory deck · products API</span>
      </div>
      <ConnectionStatus state={connection} />
    </header>
  );
}
