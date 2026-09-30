import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { formatRupiah } from "../lib/format";
import { PAYMENT_METHODS } from "../lib/paymentMethods";

// Menampilkan logo dari public/logos/. Kalau file belum ada, tampilkan nama merek.
function ChannelLogo({ logo }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setAvailable(true);
    img.onerror = () => setAvailable(false);
    img.src = logo.file;
  }, [logo.file]);

  return (
    <span className="logo-chip" title={logo.name}>
      {available ? <img src={logo.file} alt={logo.name} /> : logo.name}
    </span>
  );
}

export default function Payment() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const { clearCart } = useCart();

  // Data checkout dari database
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("CARD");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const fieldRefs = { name: nameRef, phone: phoneRef, address: addressRef };

  // Ambil data checkout berdasarkan checkoutId di URL
  useEffect(() => {
    if (!router.isReady) return;

    if (!checkoutId) {
      setLoadError("Data checkout tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/${checkoutId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat checkout");
        return data;
      })
      .then((data) => setCheckout(data))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [router.isReady, checkoutId]);

  function validate() {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama penerima wajib diisi.";
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Nomor HP wajib diisi.";
    } else if (!/^(\+62|62|0)8\d{7,11}$/.test(cleanPhone)) {
      newErrors.phone = "Format nomor HP tidak valid (contoh: 08123456789).";
    }

    if (!address.trim()) {
      newErrors.address = "Alamat pengiriman wajib diisi.";
    } else if (address.trim().length < 10) {
      newErrors.address = "Alamat terlalu pendek, tulis alamat lengkap.";
    }

    return newErrors;
  }

  function handleChange(field, setter) {
    return (e) => {
      setter(e.target.value);
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  async function handleConfirm() {
    const newErrors = validate();
    setErrors(newErrors);

    const firstInvalid = ["name", "phone", "address"].find((f) => newErrors[f]);
    if (firstInvalid) {
      const el = fieldRefs[firstInvalid].current;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId,
          customer: { name, phone, address },
          paymentMethod: method,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal membuat pembayaran");

      // Tagihan berhasil dibuat: kosongkan keranjang, lalu pindah ke halaman Xendit
      clearCart();
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  }

  const hasErrors = Object.values(errors).some(Boolean);

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

        {loading ? (
          <p className="empty">Memuat...</p>
        ) : loadError ? (
          <div className="empty">
            <p>{loadError}</p>
            <Link href="/checkout" className="btn" style={{ marginTop: 12 }}>
              Kembali ke Checkout
            </Link>
          </div>
        ) : (
          <>
            {/* Shipping Address */}
            <div className="section">
              <h2 className="section-title">Shipping Address</h2>

              <input
                ref={nameRef}
                className={`field ${errors.name ? "invalid" : ""}`}
                type="text"
                placeholder="Nama penerima"
                value={name}
                onChange={handleChange("name", setName)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}

              <input
                ref={phoneRef}
                className={`field ${errors.phone ? "invalid" : ""}`}
                type="tel"
                placeholder="Nomor HP (contoh: 08123456789)"
                value={phone}
                onChange={handleChange("phone", setPhone)}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}

              <textarea
                ref={addressRef}
                className={`field ${errors.address ? "invalid" : ""}`}
                rows={3}
                placeholder="Alamat lengkap"
                value={address}
                onChange={handleChange("address", setAddress)}
              />
              {errors.address && <p className="field-error">{errors.address}</p>}
            </div>

            {/* Payment Method */}
            <div className="section">
              <h2 className="section-title">Payment Method</h2>
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.value}
                  className={`method-card ${method === pm.value ? "selected" : ""}`}
                >
                  <div className="method-header">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={method === pm.value}
                      onChange={() => setMethod(pm.value)}
                    />
                    <span>{pm.label}</span>
                  </div>
                  <div className="logo-row">
                    {pm.logos.map((logo) => (
                      <ChannelLogo key={logo.name} logo={logo} />
                    ))}
                  </div>
                </label>
              ))}
            </div>

            {/* Order Summary (dari database) */}
            <div className="section">
              <h2 className="section-title">Order Summary</h2>
              <div className="summary-row">
                <span>Item(s)</span>
                <span>{formatRupiah(checkout.subtotal + checkout.tax)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatRupiah(checkout.shippingFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatRupiah(checkout.total)}</span>
              </div>
            </div>

            {/* Confirm & Pay */}
            <div className="bottom-bar">
              <button
                className="btn btn-primary btn-block"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? "Membuat tagihan..." : "Confirm & Pay"}
              </button>
              {hasErrors && (
                <p className="error">Lengkapi data yang ditandai merah terlebih dahulu.</p>
              )}
              {submitError && <p className="error">{submitError}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
