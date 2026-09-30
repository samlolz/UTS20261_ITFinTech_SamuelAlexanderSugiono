import mongoose from "mongoose";
import connectDB from "../../../lib/mongodb";
import Payment from "../../../models/Payment";
import "../../../models/Checkout";

// GET /api/payment/[id] -> ambil status pembayaran beserta detail pesanan
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Pembayaran tidak ditemukan." });
  }

  try {
    await connectDB();
    const payment = await Payment.findById(id).populate("checkout").lean();

    if (!payment) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan." });
    }

    const checkout = payment.checkout;

    res.status(200).json({
      id: payment._id.toString(),
      externalId: payment.externalId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentChannel: payment.paymentChannel || null,
      paidAt: payment.paidAt || null,
      invoiceUrl: payment.invoiceUrl || null,
      customerName: checkout?.customer?.name || "-",
      items: (checkout?.items || []).map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal: checkout?.subtotal ?? 0,
      tax: checkout?.tax ?? 0,
      shippingFee: checkout?.shippingFee ?? 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil status pembayaran" });
  }
}
