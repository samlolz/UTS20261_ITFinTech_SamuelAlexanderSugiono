import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    checkout: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout", required: true },
    externalId: { type: String, required: true, unique: true }, // ID tagihan dari sisi kita
    xenditInvoiceId: { type: String }, // ID tagihan dari Xendit
    invoiceUrl: { type: String }, // link halaman pembayaran Xendit
    amount: { type: Number, required: true },
    paymentMethod: { type: String },
    paymentChannel: { type: String }, // contoh: BCA, OVO (diisi dari webhook)
    status: {
      type: String,
      enum: ["PENDING", "LUNAS", "EXPIRED"],
      default: "PENDING",
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
