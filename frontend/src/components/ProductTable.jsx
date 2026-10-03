import ProductRow from "./ProductRow.jsx";

function StateRow({ children }) {
  return (
    <tr className="state-row">
      <td colSpan={5}>{children}</td>
    </tr>
  );
}

export default function ProductTable({ products, status, error, onRefresh, onSave, onDelete }) {
  return (
    <section className="ledger" aria-labelledby="ledger-heading">
      <div className="ledger-head">
        <h2 id="ledger-heading">Current stock</h2>
        <button className="ghost-btn" type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Item</th>
              <th scope="col" className="num">Price</th>
              <th scope="col" className="num">Qty</th>
              <th scope="col" className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" && <StateRow>Loading ledger…</StateRow>}

            {status === "error" && <StateRow>{error}</StateRow>}

            {status === "ready" && products.length === 0 && (
              <StateRow>No entries on the ledger yet. Add one on the left.</StateRow>
            )}

            {status === "ready" &&
              products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onSave={onSave}
                  onDelete={onDelete}
                />
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
