import mongoose from "mongoose";
import connectDB from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";

// GET /api/checkout/[id] -> ambil data checkout
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Checkout tidak ditemukan." });
  }

  try {
    await connectDB();
    const checkout = await Checkout.findById(id).lean();

    if (!checkout) {
      return res.status(404).json({ message: "Checkout tidak ditemukan." });
    }

    res.status(200).json({
      id: checkout._id.toString(),
      items: checkout.items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal: checkout.subtotal,
      tax: checkout.tax,
      shippingFee: checkout.shippingFee,
      total: checkout.total,
      status: checkout.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data checkout" });
  }
}
