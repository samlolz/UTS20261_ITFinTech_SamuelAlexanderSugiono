// Daftar metode pembayaran yang ditampilkan di halaman Payment.
// - value         : kode internal aplikasi kita
// - xenditMethods : kode channel Xendit (dipakai di Soal 4 saat membuat tagihan)
// - logos         : logo yang ditampilkan. Simpan file gambar di public/logos/
//                   dengan nama file persis seperti di bawah. Kalau file belum ada,
//                   yang tampil adalah nama mereknya.

export const PAYMENT_METHODS = [
  {
    value: "CARD",
    label: "Credit/Debit Card",
    xenditMethods: ["CREDIT_CARD"],
    logos: [
      { name: "Visa", file: "/logos/visa.png" },
      { name: "Mastercard", file: "/logos/mastercard.png" },
      { name: "JCB", file: "/logos/jcb.png" },
      { name: "Amex", file: "/logos/amex.png" },
      { name: "GPN", file: "/logos/gpn.png" },
    ],
  },
  {
    value: "EWALLET",
    label: "E-Wallet / QRIS",
    xenditMethods: ["OVO", "DANA", "SHOPEEPAY", "LINKAJA", "QRIS"],
    logos: [
      { name: "OVO", file: "/logos/ovo.png" },
      { name: "DANA", file: "/logos/dana.png" },
      { name: "ShopeePay", file: "/logos/shopeepay.png" },
      { name: "LinkAja", file: "/logos/linkaja.png" },
      { name: "QRIS", file: "/logos/qris.png" },
    ],
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer (Virtual Account)",
    xenditMethods: ["BCA", "MANDIRI", "BNI", "BRI", "PERMATA", "BSI"],
    logos: [
      { name: "BCA", file: "/logos/bca.png" },
      { name: "Mandiri", file: "/logos/mandiri.png" },
      { name: "BNI", file: "/logos/bni.png" },
      { name: "BRI", file: "/logos/bri.png" },
      { name: "Permata", file: "/logos/permata.png" },
      { name: "BSI", file: "/logos/bsi.png" },
    ],
  },
];
