import mongoose from "mongoose";
import connectDB from "../../../lib/mongodb";
import Product from "../../../models/Product";
import Checkout from "../../../models/Checkout";
import { calculateTotals, SHIPPING_FEE } from "../../../lib/pricing";

// POST /api/checkout -> simpan checkout baru
// Body: { items: [{ id, quantity }] }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Keranjang masih kosong." });
    }

    for (const item of items) {
      if (!mongoose.isValidObjectId(item.id)) {
        return res.status(400).json({
          message: "Ada produk yang tidak valid. Kosongkan keranjang lalu pilih ulang menu.",
        });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ message: "Jumlah produk tidak valid." });
      }
    }

    await connectDB();

    // Ambil harga ASLI dari database (bukan dari browser)
    const products = await Product.find({
      _id: { $in: items.map((i) => i.id) },
    }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const checkoutItems = [];
    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return res.status(400).json({
          message: "Ada produk yang sudah tidak tersedia. Kosongkan keranjang lalu pilih ulang menu.",
        });
      }
      checkoutItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const subtotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { tax, total } = calculateTotals(subtotal);

    const checkout = await Checkout.create({
      items: checkoutItems,
      subtotal,
      tax,
      shippingFee: SHIPPING_FEE,
      total: total + SHIPPING_FEE,
    });

    res.status(201).json({ checkoutId: checkout._id.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menyimpan checkout" });
  }
}
