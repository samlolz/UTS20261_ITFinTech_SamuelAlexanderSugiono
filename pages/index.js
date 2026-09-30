import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import products from "../data/products";
import { useCart } from "../context/CartContext";
import { formatRupiah } from "../lib/format";

// Daftar kategori diambil otomatis dari data produk
const categories = ["All", ...new Set(products.map((p) => p.category))];

export default function SelectItem() {
  const { items, addItem, updateQuantity, totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Filter produk berdasarkan kategori dan kata pencarian
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Cek berapa banyak produk ini sudah ada di keranjang
  function getQuantity(id) {
    const item = items.find((i) => i.id === id);
    return item ? item.quantity : 0;
  }

  return (
    <div className="page">
      <Head>
        <title>Sam&apos;s Cafe</title>
      </Head>

      <div className="container">
        {/* Header */}
        <header className="header">
          <button className="icon-btn" aria-label="Menu">
            ☰
          </button>
          <span className="logo">Sam&apos;s Cafe</span>
          <Link href="/checkout" className="cart-btn" aria-label="Keranjang">
            🛒
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </Link>
        </header>

        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span>🔍</span>
        </div>

        {/* Tab kategori */}
        <nav className="tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`tab ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* Daftar produk */}
        <main>
          {filteredProducts.length === 0 && (
            <p className="empty">Produk tidak ditemukan.</p>
          )}

          {filteredProducts.map((product) => {
            const quantity = getQuantity(product.id);
            return (
              <div key={product.id} className="product-card">
                <div className="thumb">{product.emoji}</div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">{formatRupiah(product.price)}</p>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-actions">
                    {quantity === 0 ? (
                      // Belum dipilih: tampilkan tombol Add +
                      <button className="btn" onClick={() => addItem(product)}>
                        Add +
                      </button>
                    ) : (
                      // Sudah dipilih: tampilkan tombol − jumlah +
                      <div className="qty-control">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Kurangi"
                        >
                          −
                        </button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label="Tambah"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* Tombol ke checkout, hanya muncul kalau ada produk dipilih */}
        {totalItems > 0 && (
          <div className="bottom-bar">
            <Link href="/checkout" className="btn btn-primary btn-block">
              Checkout ({totalItems} item) →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
