import mongoose from "mongoose";
import connectDB from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";
import { PAYMENT_METHODS } from "../../../lib/paymentMethods";
import { createInvoice, toE164 } from "../../../lib/xendit";

// POST /api/payment/create
// 1. Simpan data pengiriman ke Checkout
// 2. Buat data Payment (PENDING)
// 3. Buat tagihan (invoice) di Xendit, lalu kirim link pembayarannya ke browser
// Body: { checkoutId, customer: { name, phone, address }, paymentMethod }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { checkoutId, customer, paymentMethod } = req.body || {};

    if (!mongoose.isValidObjectId(checkoutId)) {
      return res.status(400).json({ message: "Checkout tidak valid." });
    }

    const name = customer?.name?.trim();
    const phone = customer?.phone?.replace(/[\s-]/g, "");
    const address = customer?.address?.trim();

    if (!name || !phone || !address) {
      return res.status(400).json({ message: "Data pengiriman belum lengkap." });
    }
    if (!/^(\+62|62|0)8\d{7,11}$/.test(phone)) {
      return res.status(400).json({ message: "Format nomor HP tidak valid." });
    }

    const selectedMethod = PAYMENT_METHODS.find((m) => m.value === paymentMethod);
    if (!selectedMethod) {
      return res.status(400).json({ message: "Metode pembayaran tidak valid." });
    }

    await connectDB();

    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout tidak ditemukan." });
    }
    if (checkout.status === "LUNAS") {
      return res.status(400).json({ message: "Pesanan ini sudah lunas." });
    }

    // 1. Simpan data pengiriman & metode pembayaran
    checkout.customer = { name, phone, address };
    checkout.paymentMethod = paymentMethod;
    await checkout.save();

    // 2. Buat data Payment (PENDING)
    const externalId = `SAMSCAFE-${checkout._id}-${Date.now()}`;
    const payment = await Payment.create({
      checkout: checkout._id,
      externalId,
      amount: checkout.total,
      paymentMethod,
      status: "PENDING",
    });

    // 3. Buat invoice di Xendit
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const statusUrl = `${appUrl}/status/${payment._id}`;
    const description =
      "Pesanan Sam's Cafe: " +
      checkout.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");

    const basePayload = {
      external_id: externalId,
      amount: checkout.total,
      currency: "IDR",
      description,
      invoice_duration: 86400, // tagihan berlaku 24 jam
      customer: {
        given_names: name,
        mobile_number: toE164(phone),
      },
      success_redirect_url: statusUrl,
      failure_redirect_url: statusUrl,
    };

    let invoice;
    try {
      try {
        // Coba tampilkan hanya metode yang dipilih user
        invoice = await createInvoice({
          ...basePayload,
          payment_methods: selectedMethod.xenditMethods,
        });
      } catch (err) {
        // Kalau API key salah, jangan dicoba ulang
        if (err.status === 401 || err.status === 403) throw err;

        // Kalau metode belum aktif di akun Xendit, coba lagi tanpa filter metode
        console.warn("Coba ulang tanpa filter metode:", err.code, err.message);
        invoice = await createInvoice(basePayload);
      }
    } catch (err) {
      // Tagihan gagal dibuat: hapus data Payment yang tadi dibuat
      await Payment.deleteOne({ _id: payment._id });
      console.error("Xendit error:", err.code, err.message);
      return res.status(502).json({
        message: `Gagal membuat tagihan Xendit: ${err.message}`,
      });
    }

    payment.xenditInvoiceId = invoice.id;
    payment.invoiceUrl = invoice.invoice_url;
    await payment.save();

    res.status(201).json({
      paymentId: payment._id.toString(),
      invoiceUrl: invoice.invoice_url,
      status: payment.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat pembayaran" });
  }
}
