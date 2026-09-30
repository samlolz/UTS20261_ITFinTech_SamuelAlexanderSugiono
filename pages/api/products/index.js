import connectDB from "../../../lib/mongodb";
import Product from "../../../models/Product";

// GET /api/products -> daftar semua produk dari database
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    const products = await Product.find().sort({ _id: 1 }).lean();

    res.status(200).json(
      products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        emoji: p.emoji,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data produk" });
  }
}
