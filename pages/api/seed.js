import connectDB from "../../lib/mongodb";
import Product from "../../models/Product";
import products from "../../data/products";

// Mengisi data produk awal ke database.
// Hanya bisa dijalankan saat development (npm run dev).
export default async function handler(req, res) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ message: "Seed hanya bisa dijalankan saat development." });
  }

  try {
    await connectDB();

    // Hapus data lama supaya tidak dobel, lalu isi ulang
    await Product.deleteMany({});
    const data = products.map(({ id, ...rest }) => rest);
    const created = await Product.insertMany(data);

    res.status(200).json({
      message: "Data produk berhasil diisi ke database",
      count: created.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengisi data", error: error.message });
  }
}
