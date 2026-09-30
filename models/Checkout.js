import mongoose from "mongoose";

// Satu baris item di dalam checkout
const CheckoutItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CheckoutSchema = new mongoose.Schema(
  {
    items: { type: [CheckoutItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true }, // total yang harus dibayar

    // Diisi di halaman Payment
    customer: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ["CARD", "EWALLET", "BANK_TRANSFER"],
    },

    status: {
      type: String,
      enum: ["MENUNGGU_PEMBAYARAN", "LUNAS", "EXPIRED"],
      default: "MENUNGGU_PEMBAYARAN",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Checkout ||
  mongoose.model("Checkout", CheckoutSchema);
