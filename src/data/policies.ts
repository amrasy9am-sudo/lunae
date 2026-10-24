import type { L10n } from "@/lib/types";

const t = (en: string, ms: string): L10n => ({ en, ms });

export const policies: { slug: string; title: L10n; updated: string; sections: { h: L10n; p: L10n[] }[] }[] = [
  {
    slug: "shipping",
    title: t("Shipping & delivery", "Penghantaran"),
    updated: "2026-10-20",
    sections: [
      {
        h: t("Dispatch", "Penghantaran keluar"),
        p: [
          t(
            "Orders paid before 2 pm on working days ship the same day from our temperature-controlled 3PL warehouse in the Klang Valley.",
            "Pesanan yang dibayar sebelum 2 petang pada hari bekerja dihantar pada hari yang sama dari gudang 3PL berkawal suhu kami di Lembah Klang.",
          ),
          t(
            "Every parcel is barcode-scanned at packing (target accuracy ≥ 99.5%) and sealed with a tamper seal. We use a printed box and paper void-fill — no bubble wrap.",
            "Setiap bungkusan diimbas kod bar semasa pembungkusan (sasaran ketepatan ≥ 99.5%) dan dimeterai dengan pelekat keselamatan. Kami guna kotak bercetak dan pengisi kertas — tiada balutan gelembung.",
          ),
        ],
      },
      {
        h: t("Delivery times & fees", "Tempoh & caj penghantaran"),
        p: [
          t(
            "Peninsular Malaysia: 1–3 working days. Free on orders of RM80 and above; RM6 flat rate below. Express (Klang Valley next day): RM8.",
            "Semenanjung Malaysia: 1–3 hari bekerja. Percuma untuk pesanan RM80 ke atas; kadar rata RM6 di bawahnya. Ekspres (Lembah Klang hari berikutnya): RM8.",
          ),
          t(
            "Sabah, Sarawak & Labuan: 3–7 working days. Free on orders of RM80 and above; RM12 flat rate below.",
            "Sabah, Sarawak & Labuan: 3–7 hari bekerja. Percuma untuk pesanan RM80 ke atas; kadar rata RM12 di bawahnya.",
          ),
        ],
      },
      {
        h: t("Tracking", "Penjejakan"),
        p: [
          t(
            "Your tracking number is sent by WhatsApp and email, and you can follow the live timeline on our tracking page — no sign-in needed.",
            "Nombor penjejakan dihantar melalui WhatsApp dan e-mel, dan anda boleh ikuti status terkini di halaman jejak kami — tanpa perlu log masuk.",
          ),
        ],
      },
      {
        h: t("Freshness", "Kesegaran"),
        p: [
          t(
            "Stock is allocated first-expiry-first-out (FEFO). We never ship products with less than 9 months of remaining shelf life to customers.",
            "Stok diagihkan mengikut tarikh luput terawal dahulu (FEFO). Kami tidak menghantar produk dengan baki jangka hayat kurang daripada 9 bulan kepada pelanggan.",
          ),
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: t("Returns & Shade-Match Guarantee", "Pemulangan & Jaminan Padanan Rona"),
    updated: "2026-10-20",
    sections: [
      {
        h: t("Shade-Match Guarantee", "Jaminan Padanan Rona"),
        p: [
          t(
            "If your base shade isn't right, swap it once for free within 30 days of delivery — even if opened. Start the swap in 3 taps from Account → Orders; we'll send the new shade with a prepaid return label.",
            "Jika rona alas solek anda tidak sesuai, tukar sekali secara percuma dalam 30 hari dari penghantaran — walaupun sudah dibuka. Mulakan pertukaran dengan 3 ketikan di Akaun → Pesanan; kami hantar rona baharu bersama label pemulangan prabayar.",
          ),
          t(
            "Swap reasons help retrain the AI Shade Finder so the next match is better for everyone.",
            "Sebab pertukaran membantu melatih semula Pencari Rona AI supaya padanan seterusnya lebih tepat untuk semua.",
          ),
        ],
      },
      {
        h: t("Returns", "Pemulangan"),
        p: [
          t(
            "Unopened products can be returned within 14 days for a refund to the original payment method.",
            "Produk yang belum dibuka boleh dipulangkan dalam 14 hari untuk bayaran balik ke kaedah pembayaran asal.",
          ),
          t(
            "Damaged or wrongly shipped items are replaced or fully refunded, with return postage paid by LUNAE.",
            "Barang rosak atau tersalah hantar akan diganti atau dibayar balik sepenuhnya, dengan kos pos pemulangan ditanggung LUNAE.",
          ),
          t(
            "For hygiene reasons, products opened for reasons other than the Shade-Match Guarantee cannot be returned.",
            "Atas sebab kebersihan, produk yang dibuka atas sebab selain Jaminan Padanan Rona tidak boleh dipulangkan.",
          ),
        ],
      },
      {
        h: t("Skin reactions", "Reaksi kulit"),
        p: [
          t(
            "If you experience a reaction, stop use and contact us. We log every case with its batch number and our Regulatory Executive reviews it; serious cases are reported to NPRA.",
            "Jika berlaku reaksi, hentikan penggunaan dan hubungi kami. Kami rekod setiap kes bersama nombor kelompok dan Eksekutif Regulatori kami akan menyemaknya; kes serius dilaporkan kepada NPRA.",
          ),
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: t("Privacy notice (PDPA)", "Notis privasi (PDPA)"),
    updated: "2026-10-20",
    sections: [
      {
        h: t("What we collect", "Apa yang kami kumpul"),
        p: [
          t(
            "Account and order details (name, email, phone, delivery address), your skin & shade profile (colour values only), consents, and how you use the site if you allow analytics.",
            "Butiran akaun dan pesanan (nama, e-mel, telefon, alamat penghantaran), profil kulit & rona anda (nilai warna sahaja), persetujuan, dan cara anda menggunakan laman jika anda membenarkan analitik.",
          ),
          t(
            "Shade Finder and AR try-on run on your device. Camera images are never uploaded or stored — only the resulting colour values, and only if you choose to save your profile.",
            "Pencari Rona dan cuba AR berjalan dalam peranti anda. Imej kamera tidak pernah dimuat naik atau disimpan — hanya nilai warna yang terhasil, dan hanya jika anda memilih untuk menyimpan profil.",
          ),
          t(
            "Card data never touches our servers: payments are handled on a licensed, PCI-DSS gateway's hosted page.",
            "Data kad tidak pernah sampai ke pelayan kami: pembayaran dikendalikan di halaman gerbang berlesen PCI-DSS.",
          ),
        ],
      },
      {
        h: t("Why we use it", "Kenapa kami gunakannya"),
        p: [
          t(
            "To fulfil orders, provide customer service, personalise shade recommendations, run Lunae Circle, and — only with your separate consent — send marketing by email, WhatsApp or push (max one message per channel per day, never 10 pm–8 am).",
            "Untuk memenuhi pesanan, menyediakan khidmat pelanggan, memperibadikan cadangan rona, menjalankan Lunae Circle, dan — hanya dengan persetujuan berasingan anda — menghantar pemasaran melalui e-mel, WhatsApp atau notifikasi (maksimum satu mesej setiap saluran sehari, tidak sekali-kali 10 malam–8 pagi).",
          ),
        ],
      },
      {
        h: t("Your rights", "Hak anda"),
        p: [
          t(
            "Access, correct, download or delete your data and withdraw any consent at any time from Account → Privacy centre. Data is hosted in a Malaysian cloud region. Data Protection Officer: dpo@lunae.my.",
            "Akses, betulkan, muat turun atau padam data anda dan tarik balik sebarang persetujuan pada bila-bila masa di Akaun → Pusat privasi. Data dihoskan di rantau awan Malaysia. Pegawai Perlindungan Data: dpo@lunae.my.",
          ),
        ],
      },
      {
        h: t("Breaches", "Pelanggaran data"),
        p: [
          t(
            "If a breach affects your personal data, we notify the PDP Commissioner within 72 hours where required, and contact you directly.",
            "Jika berlaku pelanggaran yang menjejaskan data peribadi anda, kami memaklumkan Pesuruhjaya PDP dalam 72 jam jika diperlukan, dan menghubungi anda secara terus.",
          ),
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: t("Terms of sale", "Terma jualan"),
    updated: "2026-10-20",
    sections: [
      {
        h: t("Pre-launch preview", "Pratonton pra-pelancaran"),
        p: [
          t(
            "This website is a preview ahead of the LUNAE launch (Wave 1: August 2027). Checkout currently runs in demo mode: no payment is taken and no goods are shipped.",
            "Laman web ini ialah pratonton sebelum pelancaran LUNAE (Gelombang 1: Ogos 2027). Checkout kini dalam mod demo: tiada bayaran diambil dan tiada barang dihantar.",
          ),
        ],
      },
      {
        h: t("Prices", "Harga"),
        p: [
          t(
            "Prices are in Malaysian Ringgit and include SST where applicable. All prices, discounts and points are recalculated on our server at checkout.",
            "Harga dalam Ringgit Malaysia dan termasuk SST jika berkenaan. Semua harga, diskaun dan mata dikira semula di pelayan kami semasa checkout.",
          ),
        ],
      },
      {
        h: t("Orders", "Pesanan"),
        p: [
          t(
            "An order is confirmed only once our payment gateway sends a verified, signed confirmation. Unpaid orders are cancelled after 30 minutes and reserved stock is released.",
            "Pesanan disahkan hanya selepas gerbang pembayaran kami menghantar pengesahan bertandatangan yang disahkan. Pesanan tidak berbayar dibatalkan selepas 30 minit dan stok yang ditempah dilepaskan.",
          ),
        ],
      },
      {
        h: t("Lunae Circle", "Lunae Circle"),
        p: [
          t(
            "1 point per RM1 spent; 100 points = RM1. Points can cover up to 30% of an order. Points expire after 12 months of account inactivity, with 30 days' notice.",
            "1 mata bagi setiap RM1 dibelanjakan; 100 mata = RM1. Mata boleh menampung sehingga 30% pesanan. Mata luput selepas 12 bulan akaun tidak aktif, dengan notis 30 hari.",
          ),
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: t("Cookie policy", "Polisi kuki"),
    updated: "2026-10-20",
    sections: [
      {
        h: t("Essential", "Penting"),
        p: [t("Bag, checkout, language, theme and security cookies/local storage. Always on.", "Kuki/storan setempat untuk troli, checkout, bahasa, tema dan keselamatan. Sentiasa aktif.")],
      },
      {
        h: t("Personalisation", "Pemperibadian"),
        p: [t("Remembers your shade profile and recently viewed products to sort recommendations. Optional.", "Mengingati profil rona dan produk yang baru dilihat untuk menyusun cadangan. Pilihan.")],
      },
      {
        h: t("Analytics", "Analitik"),
        p: [
          t(
            "First-party, server-side measurement with consent mode. No third-party advertising pixels load before you choose.",
            "Pengukuran pihak pertama di sisi pelayan dengan mod persetujuan. Tiada piksel iklan pihak ketiga dimuat sebelum anda memilih.",
          ),
        ],
      },
    ],
  },
];
