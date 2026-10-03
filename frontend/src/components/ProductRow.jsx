import { useState } from "react";

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

/**
 * Renders one row of the ledger table, in either read or edit mode.
 * All edit-state lives locally; saving/deleting delegate to props so this
 * component stays a pure, reusable presentation piece.
 */
export default function ProductRow({ product, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [draft, setDraft] = useState({
    name: product.name,
    price: product.price,
    quantity: product.quantity,
  });

  function startEdit() {
    setDraft({ name: product.name, price: product.price, quantity: product.quantity });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function handleDraftChange(e) {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setIsBusy(true);
    try {
      await onSave(product.id, {
        name: draft.name.trim(),
        price: parseFloat(draft.price),
        quantity: parseInt(draft.quantity, 10),
      });
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove "${product.name}" from the ledger?`)) return;
    setIsBusy(true);
    try {
      await onDelete(product.id);
    } catch (err) {
      alert(err.message);
      setIsBusy(false);
    }
  }

  if (isEditing) {
    return (
      <tr className="editing">
        <td className="id-cell">{product.id}</td>
        <td>
          <input
            type="text"
            className="edit-name"
            name="name"
            value={draft.name}
            onChange={handleDraftChange}
          />
        </td>
        <td className="num">
          <input
            type="number"
            className="edit-price"
            name="price"
            min="0"
            step="0.01"
            value={draft.price}
            onChange={handleDraftChange}
          />
        </td>
        <td className="num">
          <input
            type="number"
            className="edit-quantity"
            name="quantity"
            min="0"
            step="1"
            value={draft.quantity}
            onChange={handleDraftChange}
          />
        </td>
        <td className="actions-col">
          <div className="row-actions">
            <button type="button" className="save-btn" onClick={handleSave} disabled={isBusy}>
              {isBusy ? "Saving…" : "Save"}
            </button>
            <button type="button" className="cancel-btn" onClick={cancelEdit} disabled={isBusy}>
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="id-cell">{product.id}</td>
      <td>{product.name}</td>
      <td className="num">{formatPrice(product.price)}</td>
      <td className="num">{product.quantity}</td>
      <td className="actions-col">
        <div className="row-actions">
          <button type="button" className="edit-btn" onClick={startEdit} disabled={isBusy}>
            Edit
          </button>
          <button type="button" className="delete-btn" onClick={handleDelete} disabled={isBusy}>
            {isBusy ? "Removing…" : "Delete"}
          </button>
        </div>
      </td>
    </tr>
  );
}
