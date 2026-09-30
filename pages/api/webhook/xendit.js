import connectDB from "../../../lib/mongodb";
import Payment from "../../../models/Payment";
import Checkout from "../../../models/Checkout";

// POST /api/webhook/xendit
// Dipanggil oleh Xendit setiap kali status tagihan (invoice) berubah.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 1. Pastikan request benar-benar dari Xendit (cek token rahasia)
  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
  const receivedToken = req.headers["x-callback-token"];

  if (!expectedToken || receivedToken !== expectedToken) {
    console.warn("Webhook ditolak: callback token tidak cocok");
    return res.status(401).json({ message: "Invalid callback token" });
  }

  const { external_id, status, paid_at, payment_channel, payment_method } =
    req.body || {};

  console.log("Webhook Xendit diterima:", external_id, status);

  if (!external_id || !status) {
    return res.status(400).json({ message: "Data webhook tidak lengkap" });
  }

  try {
    await connectDB();

    // 2. Cari data Payment berdasarkan external_id
    const payment = await Payment.findOne({ externalId: external_id });

    if (!payment) {
      // Contoh: webhook percobaan dari dashboard Xendit. Balas 200 supaya tidak dikirim ulang.
      return res.status(200).json({ message: "Pembayaran tidak ditemukan, diabaikan" });
    }

    // 3. Update status sesuai kabar dari Xendit
    if (status === "PAID" || status === "SETTLED") {
      if (payment.status !== "LUNAS") {
        payment.status = "LUNAS";
        payment.paidAt = paid_at ? new Date(paid_at) : new Date();
        payment.paymentChannel = payment_channel || payment_method || null;
        await payment.save();

        await Checkout.updateOne({ _id: payment.checkout }, { status: "LUNAS" });
        console.log("Status pembayaran diubah menjadi LUNAS:", external_id);
      }
    } else if (status === "EXPIRED") {
      if (payment.status === "PENDING") {
        payment.status = "EXPIRED";
        await payment.save();

        await Checkout.updateOne(
          { _id: payment.checkout, status: { $ne: "LUNAS" } },
          { status: "EXPIRED" }
        );
      }
    }

    return res.status(200).json({ message: "Webhook diproses", status: payment.status });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal memproses webhook" });
  }
}
