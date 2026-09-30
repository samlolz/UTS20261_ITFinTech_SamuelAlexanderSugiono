// Aturan perhitungan harga (dipakai di halaman Checkout dan Payment)
export const TAX_RATE = 0.11; // PPN 11%
export const SHIPPING_FEE = 10000; // Ongkos kirim flat Rp10.000

export function calculateTotals(subtotal) {
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}
