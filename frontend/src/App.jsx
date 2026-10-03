import Header from "./components/Header.jsx";
import ProductForm from "./components/ProductForm.jsx";
import ProductTable from "./components/ProductTable.jsx";
import Footer from "./components/Footer.jsx";
import { useProducts } from "./hooks/useProducts.js";

export default function App() {
  const { products, status, error, connection, refresh, addProduct, saveProduct, removeProduct } =
    useProducts();

  return (
    <>
      <Header connection={connection} />

      <main className="desk">
        <ProductForm onCreate={addProduct} />

        <ProductTable
          products={products}
          status={status}
          error={error}
          onRefresh={refresh}
          onSave={saveProduct}
          onDelete={removeProduct}
        />
      </main>

      <Footer />
    </>
  );
}
