export type Locale = "en" | "ms";
export type L10n = { en: string; ms: string };

export type CategoryKey = "face" | "lips-cheeks" | "eyes" | "skincare";
export type ConcernKey = "sweat-proof-base" | "oil-control" | "transfer-proof-colour" | "smudge-proof-eyes" | "barrier-glow" | "daily-spf";
export type Undertone = "cool" | "neutral" | "warm" | "olive";
export type Finish = "matte" | "soft-matte" | "satin" | "dewy" | "glow" | "natural";

export interface Shade {
  name: string;
  code?: string;
  hex: string;
  undertone?: Undertone;
  /** 0 (lightest) … 11 (deepest) for base shades */
  depth?: number;
}

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  type: L10n;
  category: CategoryKey;
  sub: "base" | "concealer" | "powder" | "setting" | "lips" | "cheeks" | "highlight" | "brows" | "liner" | "mascara" | "cleanse" | "serum" | "moisturise" | "spf";
  size: string;
  price: number; // RM
  wave: 1 | 2;
  tagline: L10n;
  description: L10n;
  claims: string[];
  concerns: ConcernKey[];
  finish: Finish;
  shades: Shade[];
  badges: ("bestseller" | "halal" | "new" | "refillable" | "spf")[];
  tint: "sand" | "clay" | "blush" | "sage" | "cocoa";
  howTo: L10n;
  fragranceFree: boolean;
  refillable: boolean;
  night?: boolean;
}

export interface FormulaIngredient {
  inci: string;
  fn: string;
  key: string;
}

export interface Formula {
  base: string;
  performance: string;
  ingredients: FormulaIngredient[];
  ph?: string | null;
  spf?: string | null;
  pao?: string | null;
  shelfLife?: string | null;
  texture?: string | null;
  freeFrom: string[];
  halalPoints: string[];
  packaging: string;
}

export interface GlossaryEntry {
  key: string;
  name: string;
  fns: string[];
  products: string[];
}

export interface CartLine {
  slug: string;
  shade?: string;
  qty: number;
}
