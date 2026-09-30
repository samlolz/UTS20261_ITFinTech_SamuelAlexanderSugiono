import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { formatRupiah } from "../lib/format";
import { calculateTotals } from "../lib/pricing";

export default function Checkout() {
  const router = useRouter();
  const { items, loaded, updateQuantity, subtotal } = useCart();
  const { tax, total } = calculateTotals(subtotal);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Simpan checkout ke database, lalu lanjut ke halaman Payment
  async function handleContinue() {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal menyimpan checkout");

      router.push(`/payment?checkoutId=${data.checkoutId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Head>
        <title>Checkout | Sam&apos;s Cafe</title>
      </Head>

      <div className="container">
        {/* Top bar */}
        <div className="top-bar">
          <Link href="/" className="back-link">
            ‹ Back
          </Link>
          <span className="top-bar-title">Checkout</span>
        </div>

        {!loaded ? (
          <p className="empty">Memuat...</p>
        ) : items.length === 0 ? (
          <div className="empty">
            <p>Keranjang masih kosong.</p>
            <Link href="/" className="btn" style={{ marginTop: 12 }}>
              Pilih Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Daftar produk yang dipilih */}
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="thumb small">{item.emoji}</div>
                <div className="cart-item-info">
                  <p className="product-name">{item.name}</p>
                  <div className="qty-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Kurangi"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Tambah"
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="item-price">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}

            {/* Ringkasan harga */}
            <div className="section">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (PPN 11%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Konfirmasi checkout */}
            <div className="bottom-bar">
              <button
                className="btn btn-primary btn-block"
                onClick={handleContinue}
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Continue to Payment →"}
              </button>
              {error && <p className="error">{error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
