import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { formatRupiah } from "../lib/format";
import { calculateTotals, SHIPPING_FEE } from "../lib/pricing";

// Pilihan metode pembayaran (value dipakai nanti saat integrasi Xendit)
const paymentMethods = [
  { value: "CARD", label: "Credit/Debit Card" },
  { value: "EWALLET", label: "E-Wallet / QRIS (OVO, DANA, ShopeePay, dll.)" },
  { value: "BANK_TRANSFER", label: "Bank Transfer (Virtual Account)" },
];

export default function Payment() {
  const { items, loaded, subtotal } = useCart();
  const { total: itemsTotal } = calculateTotals(subtotal);
  const grandTotal = itemsTotal + SHIPPING_FEE;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("CARD");
  const [error, setError] = useState("");

  function handleConfirm() {
    // Validasi sederhana: semua data pengiriman wajib diisi
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Lengkapi nama, nomor HP, dan alamat pengiriman terlebih dahulu.");
      return;
    }
    setError("");

    // SEMENTARA: nanti di Soal 4 bagian ini diganti dengan pembuatan tagihan Xendit
    alert(
      `Data siap dibayar:\n` +
        `Nama: ${name}\nMetode: ${method}\nTotal: ${formatRupiah(grandTotal)}\n\n` +
        `(Integrasi Xendit dibuat di Soal 4)`
    );
  }

  return (
    <div className="page">
      <Head>
        <title>Payment | Sam&apos;s Cafe</title>
      </Head>

      <div className="container">
        {/* Top bar */}
        <div className="top-bar">
          <Link href="/checkout" className="back-link">
            ‹ Back
          </Link>
          <span className="top-bar-title">Secure Checkout</span>
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
            {/* Shipping Address */}
            <div className="section">
              <h2 className="section-title">Shipping Address</h2>
              <input
                className="field"
                type="text"
                placeholder="Nama penerima"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="field"
                type="tel"
                placeholder="Nomor HP (contoh: 08123456789)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <textarea
                className="field"
                rows={3}
                placeholder="Alamat lengkap"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="section">
              <h2 className="section-title">Payment Method</h2>
              {paymentMethods.map((pm) => (
                <label key={pm.value} className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={method === pm.value}
                    onChange={() => setMethod(pm.value)}
                  />
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>

            {/* Order Summary */}
            <div className="section">
              <h2 className="section-title">Order Summary</h2>
              <div className="summary-row">
                <span>Item(s)</span>
                <span>{formatRupiah(itemsTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatRupiah(SHIPPING_FEE)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Confirm & Pay */}
            <div className="bottom-bar">
              <button className="btn btn-primary btn-block" onClick={handleConfirm}>
                Confirm &amp; Pay
              </button>
              {error && <p className="error">{error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
