import mongoose from "mongoose";
import connectDB from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";
import { PAYMENT_METHODS } from "../../../lib/paymentMethods";

// POST /api/payment/create -> simpan data pengiriman & buat data Payment (PENDING)
// Body: { checkoutId, customer: { name, phone, address }, paymentMethod }
// Di Soal 4, file ini akan ditambah pembuatan tagihan Xendit.
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
    if (!PAYMENT_METHODS.some((m) => m.value === paymentMethod)) {
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

    // Simpan data pengiriman & metode pembayaran ke Checkout
    checkout.customer = { name, phone, address };
    checkout.paymentMethod = paymentMethod;
    await checkout.save();

    // Buat data Payment dengan status PENDING
    const externalId = `SAMSCAFE-${checkout._id}-${Date.now()}`;
    const payment = await Payment.create({
      checkout: checkout._id,
      externalId,
      amount: checkout.total,
      paymentMethod,
      status: "PENDING",
    });

    res.status(201).json({
      paymentId: payment._id.toString(),
      externalId: payment.externalId,
      amount: payment.amount,
      status: payment.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat pembayaran" });
  }
}
