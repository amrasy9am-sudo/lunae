import type { L10n } from "./types";

const t = (en: string, ms: string): L10n => ({ en, ms });

export const FN_MS: Record<string, string> = {
  Antioxidant: "Antioksidan",
  "Broad-spectrum UV filter": "Penapis UV spektrum luas",
  "Carrier oil": "Minyak pembawa",
  "Chelating agent (stability)": "Agen pengkelat (kestabilan)",
  "Co-surfactant (gentle foam)": "Ko-surfaktan (buih lembut)",
  "Colour pigment (by shade)": "Pigmen warna (ikut rona)",
  "Cooling, refreshing feel": "Rasa sejuk dan segar",
  "Emollient (softness)": "Emolien (kelembutan)",
  Emulsifier: "Pengemulsi",
  "Filler & silky texture": "Pengisi & tekstur sutera",
  "Film former (sweat/transfer resistance)": "Pembentuk filem (tahan peluh/pindah)",
  "Fine pearlescent glow": "Kilauan mutiara halus",
  "Gelling agent": "Agen pembentuk gel",
  "Humectant (draws moisture)": "Humektan (menarik kelembapan)",
  Hydration: "Penghidratan",
  "Lash/brow conditioning": "Perapi bulu mata/kening",
  "Local botanical (skin recovery)": "Botani tempatan (pemulihan kulit)",
  "Mild amino-acid surfactant": "Surfaktan asid amino lembut",
  "Oil absorber (mattifying)": "Penyerap minyak (kesan matte)",
  "Oil control & even tone": "Kawalan minyak & tona sekata",
  "Powder binder": "Pengikat bedak",
  Preservative: "Pengawet",
  "Preservative booster": "Penggalak pengawet",
  "Sebum control": "Kawalan sebum",
  "Shape hold": "Pegangan bentuk",
  "Skin-barrier support": "Sokongan halangan kulit",
  "Slip & spreadability": "Licin & mudah disapu",
  "Soft-focus pore blurring": "Kaburkan pori (soft-focus)",
  Solubiliser: "Pelarut",
  "Solvent / base": "Pelarut / asas",
  "Soothes heat-induced redness": "Menenangkan kemerahan akibat panas",
  "Structuring wax (plant)": "Lilin penstruktur (tumbuhan)",
  "Thickener & stabiliser": "Pemekat & penstabil",
  "UVA filter": "Penapis UVA",
  "UVB filter": "Penapis UVB",
  "Volatile carrier (fast-drying)": "Pembawa meruap (cepat kering)",
  "White pigment & coverage": "Pigmen putih & liputan",
  "pH adjuster": "Pelaras pH",
};

export const fnL = (fn: string): L10n => ({ en: fn, ms: FN_MS[fn] ?? fn });

const PLANT = [
  "glycerin",
  "caprylic-capric-triglyceride",
  "coco-glucoside",
  "sodium-cocoyl-glycinate",
  "cocamidopropyl-betaine",
  "squalane",
  "stearic-acid",
  "glyceryl-stearate",
  "magnesium-stearate",
  "polysorbate-20",
  "laureth-21",
  "polyglyceryl-4-isostearate",
  "octyldodecanol",
  "diisostearyl-malate",
];
const BOTANICAL = ["centella-asiatica-extract", "calophyllum-inophyllum-seed-oil", "copernicia-cerifera-wax", "euphorbia-cerifera-wax", "ricinus-communis-seed-oil", "zea-mays-starch", "xanthan-gum"];
const MINERAL = ["titanium-dioxide", "iron-oxides", "mica", "silica", "tin-oxide", "boron-nitride", "sodium-chloride", "zinc-pca", "ci-77266"];

export function halalNote(key: string): { status: L10n; tone: "ok" | "check" } {
  if (key === "aqua") return { status: t("Water — no halal risk", "Air — tiada risiko halal"), tone: "ok" };
  if (MINERAL.some((m) => key.startsWith(m))) return { status: t("Mineral source · carrier & processing aids verified", "Sumber mineral · pembawa & bahan pemprosesan disahkan"), tone: "ok" };
  if (BOTANICAL.some((m) => key.startsWith(m)))
    return {
      status: t("Plant source · extraction solvent must not be ethanol from alcoholic beverages", "Sumber tumbuhan · pelarut pengekstrakan bukan etanol daripada minuman beralkohol"),
      tone: "check",
    };
  if (PLANT.some((m) => key.startsWith(m)))
    return { status: t("Halal-critical: plant-derived (palm/coconut) with supplier halal certificate", "Kritikal halal: daripada tumbuhan (sawit/kelapa) dengan sijil halal pembekal"), tone: "check" };
  if (key.includes("peg") || key.includes("dimethicone") || key.includes("polysorbate"))
    return { status: t("Synthetic · fatty-acid source verified for PEGs/emulsifiers", "Sintetik · sumber asid lemak disahkan untuk PEG/pengemulsi"), tone: "check" };
  if (key.includes("colourant") || key.includes("pigment")) return { status: t("Permitted colourants only · no carmine", "Pewarna dibenarkan sahaja · tiada karmin"), tone: "ok" };
  return { status: t("Synthetic · low halal risk, supplier documents on file", "Sintetik · risiko halal rendah, dokumen pembekal disimpan"), tone: "ok" };
}
