import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { formatRupiah } from "../../lib/format";
import { PAYMENT_METHODS } from "../../lib/paymentMethods";

const STATUS_INFO = {
  PENDING: { label: "Menunggu Pembayaran", className: "pending", icon: "⏳" },
  LUNAS: { label: "LUNAS", className: "lunas", icon: "✅" },
  EXPIRED: { label: "Kedaluwarsa", className: "expired", icon: "⌛" },
};

export default function PaymentStatus() {
  const router = useRouter();
  const { id } = router.query;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ambil status pembayaran, dan cek ulang setiap 5 detik selama masih PENDING
  useEffect(() => {
    if (!router.isReady || !id) return;

    let intervalId;

    async function loadStatus() {
      try {
        const res = await fetch(`/api/payment/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat status");

        setPayment(data);
        setError("");

        if (data.status !== "PENDING") clearInterval(intervalId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
    intervalId = setInterval(loadStatus, 5000);

    return () => clearInterval(intervalId);
  }, [router.isReady, id]);

  const info = payment ? STATUS_INFO[payment.status] || STATUS_INFO.PENDING : null;
  const methodLabel = payment
    ? PAYMENT_METHODS.find((m) => m.value === payment.paymentMethod)?.label || "-"
    : "-";

  return (
    <div className="page">
      <Head>
        <title>Status Pembayaran | Sam&apos;s Cafe</title>
      </Head>

      <div className="container">
        <div className="top-bar">
          <Link href="/" className="back-link">
            ‹ Menu
          </Link>
          <span className="top-bar-title">Status Pembayaran</span>
        </div>

        {loading ? (
          <p className="empty">Memuat...</p>
        ) : error && !payment ? (
          <div className="empty">
            <p>{error}</p>
            <Link href="/" className="btn" style={{ marginTop: 12 }}>
              Kembali ke Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Status utama */}
            <div className="status-hero">
              <div className="status-icon">{info.icon}</div>
              <span className={`status ${info.className}`}>{info.label}</span>
              <p className="status-amount">{formatRupiah(payment.amount)}</p>
            </div>

            {/* Detail pembayaran */}
            <div className="section">
              <h2 className="section-title">Detail Pembayaran</h2>
              <div className="summary-row">
                <span>ID Pesanan</span>
                <span className="small-text">{payment.externalId}</span>
              </div>
              <div className="summary-row">
                <span>Nama</span>
                <span>{payment.customerName}</span>
              </div>
              <div className="summary-row">
                <span>Metode</span>
                <span>{methodLabel}</span>
              </div>
              {payment.paymentChannel && (
                <div className="summary-row">
                  <span>Channel</span>
                  <span>{payment.paymentChannel}</span>
                </div>
              )}
              {payment.paidAt && (
                <div className="summary-row">
                  <span>Dibayar pada</span>
                  <span>{new Date(payment.paidAt).toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            {/* Detail pesanan */}
            <div className="section">
              <h2 className="section-title">Pesanan</h2>
              {payment.items.map((item, index) => (
                <div key={index} className="summary-row">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatRupiah(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="summary-row">
                <span>Tax (PPN 11%)</span>
                <span>{formatRupiah(payment.tax)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatRupiah(payment.shippingFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatRupiah(payment.amount)}</span>
              </div>
            </div>

            {/* Aksi */}
            <div className="bottom-bar">
              {payment.status === "PENDING" && payment.invoiceUrl && (
                <>
                  <a href={payment.invoiceUrl} className="btn btn-primary btn-block">
                    Bayar Sekarang
                  </a>
                  <p className="status-note">
                    Halaman ini otomatis diperbarui setiap 5 detik.
                  </p>
                </>
              )}
              {payment.status !== "PENDING" && (
                <Link href="/" className="btn btn-primary btn-block">
                  Pesan Lagi
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
