# Oracle Ledger

An inventory/products ledger: an Express REST API backed by **MongoDB**
(Mongoose), and a **React** frontend for managing stock (add / edit / delete
/ view products).

```
oracle-ledger/
├── backend/    Express REST API + MongoDB (Mongoose) — Task 3
└── frontend/   React (Vite) UI that calls the API — Task 1
```

## Run it

**1. Start MongoDB** (in one terminal).

```bash
cd backend
cp .env.example .env
open .env and paste your real connection string into MONGODB_URI — filling in your actual username/password and adding /oracle_ledger as the database name before any "?" in the URL.
npm install
npm run seed
npm start
You should see "MongoDB connected"
```

**2. Configure and seed the database** (in a second terminal):

```bash
cd backend
cp .env.example .env      
npm install
npm run seed               # wipes and re-populates categories/suppliers/products
```

**3. Start the API**:

```bash
npm start
```

Confirm it printed `MongoDB connected: ...` and then `Server running on
http://localhost:3000`.

**4. Start the React frontend** (in a third terminal):

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (`http://localhost:5173`).

To build a static production bundle instead: `npm run build` (output in
`frontend/dist/`), then `npm run preview` to serve it.

If your API runs somewhere other than `http://localhost:3000`, copy
`frontend/.env.example` to `frontend/.env` and change `VITE_API_BASE`.

## What you'll see

- A **connection dot** in the header that turns green once the app reaches the API.
- A **New entry** form on the left — add a product's name, price, and quantity;
  it POSTs to the API and the ledger refreshes.
- A **ledger table** on the right showing everything fetched from
  `GET /api/products`, with inline **Edit** (PUT) and **Delete** (DELETE)
  buttons per row.
- Clear **loading**, **error**, and **empty** states in the table instead of a
  blank screen while data is in flight or missing.

## How the frontend is put together (Task 1 objectives)

| Objective | Where |
|---|---|
| Project set up with a JS framework | React 18 + Vite (`frontend/`) |
| Functional components | Every component in `src/components/` is a function component; no classes |
| State management | `src/hooks/useProducts.js` — a custom hook holding products/status/error/connection and the CRUD actions; local `useState` in `ProductForm`/`ProductRow` for form-level and per-row state |
| API calls + loading states | `src/api/products.js` is the only module that calls `fetch`; `useProducts` exposes a `status` of `"loading" \| "ready" \| "error"` that `ProductTable` renders directly |
| Reusable UI components | `ConnectionStatus`, `ProductForm`, `ProductRow`, `ProductTable` all take props and have no hidden dependencies on where they're used |

```
frontend/src/
├── main.jsx                 # React root
├── App.jsx                  # wires the hook to the page
├── styles.css                # same visual identity as the original design
├── api/
│   └── products.js           # fetch wrapper — the only place URLs/HTTP live
├── hooks/
│   └── useProducts.js        # data + loading/error/connection state, CRUD actions
└── components/
    ├── Header.jsx
    ├── ConnectionStatus.jsx
    ├── ProductForm.jsx        # controlled form, own submit/loading state
    ├── ProductTable.jsx       # loading / error / empty / list states
    ├── ProductRow.jsx         # view mode <-> inline edit mode
    └── Footer.jsx
```

## Task 3 — Database Integration

The API now persists to MongoDB via Mongoose instead of an in-memory array.

| Objective | Where |
|---|---|
| MongoDB with Mongoose | `config/db.js` connects on boot; every model/query uses Mongoose |
| Models + relationships between collections | `models/Product.js` references `models/Category.js` and `models/Supplier.js` via `ObjectId` refs; `GET /api/products` populates both so responses include the category/supplier name, not just an id |
| Indexing and optimization | Unique index on `Product.sku`, a text index on `Product.name` (powers `?search=`), a compound `{ category, quantity }` index for filtered/sorted listing, unique indexes on `Category.name` and `Supplier.name`; list queries use `.lean()` and pagination (`?page`, `?limit`) instead of loading the whole collection |
| Data validation before saving | Schema-level Mongoose validators (`required`, `min`, `minlength`/`maxlength`, a custom integer check on quantity, an email-format validator on suppliers) run on every create/update; a `pre("save")` hook additionally confirms a product's `category`/`supplier` ids actually exist before saving; all of it is translated into clean `400`/`404`/`409` JSON responses by `middleware/errorHandler.js` |

New endpoints, same response shape as before (`{ success, data }` / `{ success, error }`):

```
GET    /api/categories        POST /api/categories
GET    /api/categories/:id    PUT  /api/categories/:id     DELETE /api/categories/:id
GET    /api/suppliers         POST /api/suppliers
GET    /api/suppliers/:id     PUT  /api/suppliers/:id      DELETE /api/suppliers/:id
```

`POST`/`PUT` on `/api/products` now accept optional `categoryId` and
`supplierId` fields. The existing React frontend never sends these, so the
API auto-assigns an `"Uncategorized"` category and `"Unknown Supplier"` the
first time they're needed — the old frontend keeps working unmodified. If you
want category/supplier pickers in the UI, that's a small addition to
`ProductForm.jsx` (a `<select>` populated from `GET /api/categories` /
`GET /api/suppliers`) — say the word and I'll add it.

**A note on how this was tested:** the sandbox I build in has no outbound
network access to MongoDB's install servers, so I couldn't boot a live
`mongod` here. What I verified directly: every file passes `node --check`
(no syntax errors), every module `require()`s cleanly with no import-time
errors, and — most importantly — the actual validation logic was exercised
with Mongoose's schema validator (missing fields, a negative price, a
fractional quantity, a too-short category name, and a malformed supplier
email all correctly produced the expected validation errors; a valid product
passed clean). What I couldn't test here is the live round-trip through an
actual `mongod` — do that once locally with `docker compose up -d && npm run
seed && npm start`, and if anything doesn't behave as expected, send me the
error and I'll fix it.

## Note on CORS

The frontend (Vite, port 5173) and the API (port 3000) are different origins.
`backend/server.js` includes a small CORS middleware
(`Access-Control-Allow-Origin: *`) so the browser's `fetch` calls are allowed
through. In a real deployment, restrict that to your actual frontend's domain
instead of `*`.

## Note on `npm audit`

`npm audit` in `frontend/` may report a moderate/high advisory in `esbuild`,
which is bundled inside Vite's dev server. It only affects the local dev
server accepting cross-origin requests during development — it does not
affect the production build (`npm run build`) or the API. Safe to ignore for
this project; run `npm audit fix --force` later if you want the newest Vite.
