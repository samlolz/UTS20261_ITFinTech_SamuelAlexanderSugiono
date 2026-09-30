import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // items berisi: [{ id, name, price, emoji, quantity }]
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Ambil data keranjang yang tersimpan di browser saat pertama kali dibuka
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sams-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch (error) {
      console.error("Gagal membaca keranjang:", error);
    }
    setLoaded(true);
  }, []);

  // Simpan keranjang ke browser setiap kali isinya berubah
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("sams-cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  // Tambah produk ke keranjang (kalau sudah ada, quantity +1)
  function addItem(product) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          emoji: product.emoji,
          quantity: 1,
        },
      ];
    });
  }

  // Ubah quantity (kalau jadi 0, produk dihapus dari keranjang)
  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  }

  // Kosongkan keranjang (dipakai setelah checkout)
  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loaded,
        addItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
