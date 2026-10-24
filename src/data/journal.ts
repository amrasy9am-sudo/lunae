import type { L10n } from "@/lib/types";

const t = (en: string, ms: string): L10n => ({ en, ms });

export interface Article {
  slug: string;
  kind: L10n;
  minutes: number;
  title: L10n;
  dek: L10n;
  image: string;
  author: string;
  reviewed: string;
  products: string[];
  body: { h?: L10n; p: L10n }[];
}

export const articles: Article[] = [
  {
    slug: "make-base-last-8-hours-in-kl-humidity",
    kind: t("Tutorial", "Tutorial"),
    minutes: 6,
    title: t("How to make base last 8 hours in KL humidity", "Cara buat alas solek tahan 8 jam dalam kelembapan KL"),
    dek: t("Thin layers, the right film formers, and setting only where you need it.", "Lapisan nipis, pembentuk filem yang betul, dan set hanya di tempat yang perlu."),
    image: "/img/collections/koleksi-face.webp",
    author: "LUNAE Studio",
    reviewed: "2026-10-01",
    products: ["daybreak-sun-gel", "eclipse-cushion", "crescent-concealer", "tide-setting-mist"],
    body: [
      {
        h: t("1 · Start with skin that isn't slippery", "1 · Mulakan dengan kulit yang tak licin"),
        p: t(
          "Heavy creams under base are the most common reason makeup slides by lunch. In humid weather, a water-gel moisturiser and a gel sunscreen give hydration and UV protection without leaving an oily layer for your base to float on. Give your SPF two to three minutes to settle before anything goes on top.",
          "Krim berat di bawah alas solek ialah sebab paling biasa solekan gelincir menjelang tengah hari. Dalam cuaca lembap, pelembap gel air dan pelindung matahari gel memberi kelembapan dan perlindungan UV tanpa meninggalkan lapisan berminyak. Beri SPF dua hingga tiga minit untuk set sebelum menyapu yang lain.",
        ),
      },
      {
        h: t("2 · Tap, don't drag", "2 · Tepuk, jangan sapu"),
        p: t(
          "Cushion formulas use volatile carriers that evaporate in seconds, leaving a flexible film. Tapping presses that film onto skin; dragging shifts it around. Build in two thin layers rather than one thick one — thin layers flex with your expressions and sweat instead of cracking.",
          "Formula kusyen menggunakan pembawa meruap yang sejat dalam beberapa saat, meninggalkan filem fleksibel. Menepuk menekan filem itu ke kulit; menyapu menggerakkannya. Bina dua lapisan nipis berbanding satu lapisan tebal — lapisan nipis lentur bersama ekspresi dan peluh tanpa merekah.",
        ),
      },
      {
        h: t("3 · Set the zones that actually move", "3 · Set zon yang benar-benar bergerak"),
        p: t(
          "Powder only where you shine first — usually the sides of the nose, chin and centre of the forehead. Leave the cheeks fresh. Finish with a setting mist held 20–25 cm away; it melts powder into base so nothing looks dusty by 4 pm.",
          "Bedak hanya di tempat yang cepat berkilat — biasanya tepi hidung, dagu dan tengah dahi. Biarkan pipi segar. Akhiri dengan semburan penetap pada jarak 20–25 cm; ia menyatukan bedak dengan alas supaya tak nampak berdebu menjelang 4 petang.",
        ),
      },
      {
        h: t("4 · The midday reset", "4 · Set semula tengah hari"),
        p: t(
          "Blot — don't wipe — with a tissue, re-mist, and reapply sunscreen around the UV peak (usually 1–2 pm in Malaysia). A cushion makes reapplying base easy on the go.",
          "Tekap — jangan lap — dengan tisu, sembur semula, dan ulang pelindung matahari sekitar puncak UV (biasanya 1–2 petang di Malaysia). Kusyen memudahkan sapuan semula di luar.",
        ),
      },
    ],
  },
  {
    slug: "transfer-proof-colour-that-stays-off-your-tudung",
    kind: t("Guide", "Panduan"),
    minutes: 4,
    title: t("Transfer-proof colour that stays off your tudung", "Warna kalis pindah yang tak melekat pada tudung"),
    dek: t("Why some tints transfer and others don't — and the 60-second rule.", "Kenapa sesetengah tint berpindah dan yang lain tidak — dan peraturan 60 saat."),
    image: "/img/collections/koleksi-lips-cheeks.webp",
    author: "LUNAE Studio",
    reviewed: "2026-10-05",
    products: ["nightbloom-lip-cheek-tint", "selene-matte-lipstick", "dusk-cream-blush"],
    body: [
      {
        h: t("Stains vs. creams", "Stain vs. krim"),
        p: t(
          "Creamy lipsticks sit on top of the lips in an oily film — that's what ends up on a tudung, mask or cup. Gel tints carry their colour in water with a light film former; once the water evaporates, the colour stays put and the surface feels dry to the touch.",
          "Gincu berkrim duduk di atas bibir dalam filem berminyak — itulah yang melekat pada tudung, pelitup atau cawan. Tint gel membawa warna dalam air dengan pembentuk filem ringan; bila air sejat, warna kekal dan permukaan terasa kering.",
        ),
      },
      {
        h: t("The 60-second rule", "Peraturan 60 saat"),
        p: t(
          "Apply, press your lips together once, and wait a full minute before putting on a mask or pinning your tudung. For cheeks, dot two drops and tap quickly — gel tints set fast, which is exactly why they last.",
          "Sapu, katup bibir sekali, dan tunggu seminit penuh sebelum memakai pelitup atau menyemat tudung. Untuk pipi, titik dua titis dan tepuk dengan cepat — tint gel cepat set, sebab itulah ia tahan lama.",
        ),
      },
      {
        h: t("Layer for intensity", "Lapis untuk keamatan"),
        p: t(
          "Want a deeper colour? Add a second thin layer after the first has dried. For a bold night look, a matte bullet over a tint gives the most hold.",
          "Nak warna lebih pekat? Tambah lapisan nipis kedua selepas yang pertama kering. Untuk gaya malam yang berani, gincu matte di atas tint memberi ketahanan paling baik.",
        ),
      },
    ],
  },
  {
    slug: "pegaga-tamanu-niacinamide-the-local-actives",
    kind: t("Ingredients", "Ramuan"),
    minutes: 5,
    title: t("Pegaga, tamanu & niacinamide: the local actives", "Pegaga, tamanu & niacinamide: ramuan aktif tempatan"),
    dek: t("What each one does, and why we put them together.", "Apa fungsi setiap satu, dan kenapa kami gabungkan."),
    image: "/img/collections/koleksi-skincare.webp",
    author: "LUNAE R&D",
    reviewed: "2026-10-08",
    products: ["full-moon-glow-serum", "tide-setting-mist", "moonbeam-skin-tint"],
    body: [
      {
        h: t("Pegaga (Centella asiatica)", "Pegaga (Centella asiatica)"),
        p: t(
          "A plant that grows across Malaysian kampungs and has long been used in traditional ulam. In skincare, centella extract is used to soothe skin that looks flushed after heat exposure.",
          "Tumbuhan yang tumbuh di kampung seluruh Malaysia dan lama digunakan sebagai ulam. Dalam penjagaan kulit, ekstrak pegaga digunakan untuk menenangkan kulit yang kemerahan selepas terdedah kepada panas.",
        ),
      },
      {
        h: t("Tamanu (bintangor) oil", "Minyak tamanu (bintangor)"),
        p: t(
          "Pressed from the nut of the coastal Calophyllum inophyllum tree, tamanu oil is a rich, green-gold oil traditionally used for skin recovery. We use it at a low level so the serum stays light.",
          "Diperah daripada kekacang pokok pesisir Calophyllum inophyllum, minyak tamanu berwarna hijau keemasan dan digunakan secara tradisi untuk pemulihan kulit. Kami gunakan pada kadar rendah supaya serum kekal ringan.",
        ),
      },
      {
        h: t("Niacinamide (vitamin B3)", "Niacinamide (vitamin B3)"),
        p: t(
          "Niacinamide helps regulate oil and even out the look of skin tone. At 5% it's well tolerated by most skin types and pairs well with sunscreen — the single most important step for uneven tone in the tropics.",
          "Niacinamide membantu mengawal minyak dan meratakan rupa tona kulit. Pada 5%, ia sesuai untuk kebanyakan jenis kulit dan sepadan dengan pelindung matahari — langkah paling penting untuk tona tidak sekata di kawasan tropika.",
        ),
      },
      {
        h: t("Halal from source", "Halal dari sumber"),
        p: t(
          "Botanical extracts are a halal critical point: the extraction solvent must not be ethanol from alcoholic beverages. Every supplier provides documentation before an ingredient enters a LUNAE formula.",
          "Ekstrak botani ialah titik kritikal halal: pelarut pengekstrakan tidak boleh etanol daripada minuman beralkohol. Setiap pembekal menyediakan dokumentasi sebelum ramuan dimasukkan ke dalam formula LUNAE.",
        ),
      },
    ],
  },
  {
    slug: "reading-the-uv-index-in-malaysia",
    kind: t("Science", "Sains"),
    minutes: 4,
    title: t("Reading the UV index in Malaysia", "Memahami indeks UV di Malaysia"),
    dek: t("Why 11 is normal here, and when to reapply.", "Kenapa 11 itu biasa di sini, dan bila perlu sapu semula."),
    image: "/img/collections/koleksi-eyes-setting.webp",
    author: "LUNAE Studio",
    reviewed: "2026-10-12",
    products: ["daybreak-sun-gel", "moonbeam-skin-tint"],
    body: [
      {
        h: t("Near the equator, the sun is high all year", "Dekat khatulistiwa, matahari tinggi sepanjang tahun"),
        p: t(
          "Because Malaysia sits close to the equator, the midday sun is almost overhead year-round. UV index readings of 10–12 around 1 pm are common even on hazy or cloudy days.",
          "Kerana Malaysia terletak dekat khatulistiwa, matahari tengah hari hampir tegak di atas kepala sepanjang tahun. Bacaan indeks UV 10–12 sekitar 1 petang adalah biasa walaupun hari berjerebu atau mendung.",
        ),
      },
      {
        h: t("How much is enough", "Berapa banyak yang cukup"),
        p: t(
          "Most people apply about a quarter of the sunscreen used in lab tests. A simple guide: two finger-lengths for face and neck. Reapply every two hours outdoors and after sweating heavily.",
          "Kebanyakan orang menyapu kira-kira suku daripada jumlah yang digunakan dalam ujian makmal. Panduan mudah: dua panjang jari untuk muka dan leher. Sapu semula setiap dua jam di luar dan selepas berpeluh banyak.",
        ),
      },
    ],
  },
];

export const articleBySlug = (s: string) => articles.find((a) => a.slug === s);
