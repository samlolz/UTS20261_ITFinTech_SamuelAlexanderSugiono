// Fungsi bantu untuk memanggil API Xendit
const XENDIT_API_URL = "https://api.xendit.co";

function getAuthHeader() {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) {
    throw new Error("XENDIT_SECRET_KEY belum diisi di file .env.local");
  }
  // Xendit memakai Basic Auth: secret key sebagai username, password kosong
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

// Membuat tagihan (invoice) baru di Xendit
export async function createInvoice(payload) {
  const res = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Gagal membuat invoice Xendit");
    error.code = data.error_code;
    error.status = res.status;
    throw error;
  }

  return data;
}

// Ubah nomor HP ke format internasional (08xx -> +628xx)
export function toE164(phone) {
  const clean = phone.replace(/[\s-]/g, "");
  if (clean.startsWith("+")) return clean;
  if (clean.startsWith("62")) return "+" + clean;
  if (clean.startsWith("0")) return "+62" + clean.slice(1);
  return clean;
}
