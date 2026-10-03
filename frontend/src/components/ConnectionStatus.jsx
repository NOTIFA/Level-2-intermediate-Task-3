const LABELS = {
  checking: "Checking connection…",
  online: "API connected",
  offline: "API unreachable — is the server running?",
};

/** Small reusable status pill: a colored dot plus a label. */
export default function ConnectionStatus({ state }) {
  return (
    <div className="conn">
      <span className={`conn-dot ${state}`} />
      <span>{LABELS[state] ?? LABELS.checking}</span>
    </div>
  );
}
