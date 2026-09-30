// Data produk sementara.
// Nanti di Soal 3 data ini dipindahkan ke MongoDB.

const products = [
  { id: "p1", name: "Es Teh Manis", price: 5000, category: "Drinks", description: "Teh manis dingin yang segar", emoji: "🧋" },
  { id: "p2", name: "Kopi Susu Gula Aren", price: 18000, category: "Drinks", description: "Kopi susu dengan gula aren asli", emoji: "☕" },
  { id: "p3", name: "Jus Jeruk", price: 15000, category: "Drinks", description: "Jus jeruk peras tanpa pengawet", emoji: "🍊" },
  { id: "p4", name: "Keripik Kentang", price: 12000, category: "Snacks", description: "Keripik kentang renyah rasa original", emoji: "🥔" },
  { id: "p5", name: "Roti Bakar Cokelat", price: 15000, category: "Snacks", description: "Roti bakar dengan selai cokelat", emoji: "🍞" },
  { id: "p6", name: "Pisang Goreng", price: 10000, category: "Snacks", description: "Pisang goreng hangat isi 3", emoji: "🍌" },
  { id: "p7", name: "Paket Kopi + Roti", price: 30000, category: "Bundle", description: "Kopi susu gula aren + roti bakar cokelat", emoji: "🎁" },
  { id: "p8", name: "Paket Ngemil Berdua", price: 40000, category: "Bundle", description: "2 es teh + keripik + pisang goreng", emoji: "🧺" },
];

export default products;
