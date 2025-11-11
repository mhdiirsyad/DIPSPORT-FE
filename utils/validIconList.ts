export type FacilityIconOption = {
  name: string; 
  value: string;
};

export const availableIcons: FacilityIconOption[] = [
  // INFORMASI & SKOR
  { name: "Papan Skor", value: "heroicons:clipboard-document-list" },
  { name: "Papan Skor Digital", value: "lucide:monitor" },

  // AUDIO & VISUAL
  { name: "Sound System", value: "heroicons:speaker-wave" },
  { name: "Announcer / MC", value: "lucide:mic" },
  { name: "TV Layar Lebar", value: "heroicons:tv" },

  // KESEHATAN & KESELAMATAN
  { name: "P3K / Medis", value: "heroicons:plus-circle" },
  { name: "Kotak P3K", value: "lucide:package-plus" },
  { name: "APAR", value: "lucide:flame-kindling" },
  { name: "CCTV", value: "heroicons:video-camera" },
  { name: "Keamanan 24 Jam", value: "heroicons:shield-check" },

  // PENCAHAYAAN
  { name: "Lampu Sorot", value: "heroicons:light-bulb" },
  { name: "Tersedia Jam Malam", value: "lucide:moon" },

  // SANITASI & TOILET
  { name: "Toilet / WC", value: "lucide:shower-head" },
  { name: "Loker", value: "heroicons:lock-closed" },
  { name: "Ruang Ganti", value: "heroicons:users" },

  // PARKIR
  { name: "Parkir Motor", value: "lucide:bike" },
  { name: "Parkir Bus / Luas", value: "heroicons:truck" },

  // LISTRIK
  { name: "Charging Station", value: "heroicons:bolt" },
  { name: "Stop Kontak", value: "lucide:plug" },

  // KANTIN & MINUMAN
  { name: "Kantin / Coffee Shop", value: "lucide:coffee" },
  { name: "Kantin / Toko", value: "heroicons:building-storefront" },
  { name: "Air", value: "lucide:droplet" },
  { name: "Dispenser", value: "lucide:glass-water" },

  // KONEKTIVITAS
  { name: "WiFi Gratis", value: "heroicons:wifi" },

  // PENONTON
  { name: "Tribun / Kursi", value: "lucide:armchair" },
  { name: "Kapasitas Penonton", value: "heroicons:user-group" },

  // PERLENGKAPAN OLAHRAGA
  { name: "Bisa Turnamen", value: "heroicons:trophy" },
  { name: "Peralatan Lengkap", value: "lucide:package-check" },

  // FASILITAS KEAGAMAAN
  { name: "Mushola", value: "lucide:home" },

  // PERATURAN
  { name: "Dilarang Merokok", value: "lucide:cigarette-off" },
  { name: "Area Merokok", value: "lucide:cigarette" },
  { name: "Tempat Sampah", value: "lucide:trash-2" },

  // KONDISI LAPANGAN
  { name: "Beratap (Anti Hujan)", value: "lucide:umbrella" },
  { name: "Indoor (Tertutup)", value: "heroicons:building-office-2" },
  { name: "Outdoor", value: "lucide:sun" },

  // RATING & KUALITAS
  { name: "Premium / VIP", value: "heroicons:sparkles" },
  { name: "Rating Tinggi", value: "heroicons:star" },

  // PROMO & PEMBAYARAN
  { name: "Kartu Kredit/Debit", value: "heroicons:credit-card" },
  { name: "QRIS", value: "lucide:qr-code" },
  { name: "Tunai (Cash)", value: "heroicons:banknotes" },
  { name: "Loket / Tiket Fisik", value: "heroicons:ticket" },

  // EVENT & PENGUMAN
  { name: "Event", value: "lucide:megaphone" },

  // FASILITAS TAMBAHAN
  { name: "Kolam Renang", value: "lucide:waves" },

  // JENIS PERMUKAAN
  { name: "Permukaan Standar", value: "lucide:layers" },
  { name: "Rumput Asli", value: "lucide:leaf" },
  { name: "Rumput Sintetis", value: "lucide:grid-3x3" },

  // Lainnya
  { name: "Ruang Tunggu", value: "heroicons:clock" },
  { name: "Area Penitipan Barang", value: "lucide:briefcase" },
  { name: "Fasilitas Umum Lainnya", value: "lucide:more-horizontal" },
];

// --- DAFTAR PATEN (UNTUK VALIDATOR BE) ---
export const VALID_FACILITY_ICONS = availableIcons.map(
  (i) => i.value
) as readonly string[];