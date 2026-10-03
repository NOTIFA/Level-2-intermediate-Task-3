require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const supplierRoutes = require("./routes/suppliers");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Allow the frontend (served from a different origin/port, e.g. Vite on :5173)
// to call this API. For a real production app, restrict this to your actual frontend domain.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Oracle Ledger API is running.",
    endpoints: {
      "GET /api/products": "List products (supports ?search, ?category, ?page, ?limit)",
      "GET /api/products/:id": "Get a single product",
      "POST /api/products": "Create a product",
      "PUT /api/products/:id": "Update a product",
      "DELETE /api/products/:id": "Delete a product",
      "GET|POST /api/categories": "List / create categories",
      "PUT|DELETE /api/categories/:id": "Update / delete a category",
      "GET|POST /api/suppliers": "List / create suppliers",
      "PUT|DELETE /api/suppliers/:id": "Update / delete a supplier",
    },
  });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);

app.use(notFound);
app.use(errorHandler);

// Connect to the database first — only start accepting HTTP requests once
// that succeeds, so no request can ever hit a controller with no DB behind it.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
