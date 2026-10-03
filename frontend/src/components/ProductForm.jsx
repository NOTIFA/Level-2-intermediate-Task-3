import { useState } from "react";

const EMPTY_FORM = { name: "", price: "", quantity: "" };

/**
 * Reusable "add a product" form. Owns its own field state and submit/loading
 * state; delegates the actual network call to the `onCreate` prop so it has
 * no knowledge of the API layer.
 */
export default function ProductForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "Adding…", type: "" });

    try {
      const created = await onCreate({
        name: form.name.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
      });
      setForm(EMPTY_FORM);
      setMessage({ text: `Added "${created.name}" to the ledger.`, type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="ticket" aria-labelledby="entry-heading">
      <h2 id="entry-heading">New entry</h2>
      <p className="ticket-hint">Add a product to the ledger.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="fName">Item name</label>
        <input
          type="text"
          id="fName"
          name="name"
          placeholder="e.g. Desk Lamp"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="field-row">
          <div>
            <label htmlFor="fPrice">Price (USD)</label>
            <input
              type="number"
              id="fPrice"
              name="price"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="fQuantity">Quantity</label>
            <input
              type="number"
              id="fQuantity"
              name="quantity"
              min="0"
              step="1"
              placeholder="0"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add to ledger"}
        </button>
        <p className={`form-msg ${message.type}`} role="status">
          {message.text}
        </p>
      </form>
    </section>
  );
}
