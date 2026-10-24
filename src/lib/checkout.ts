import { z } from "zod";

export function stateFromPostcode(pc: string): string | null {
  if (!/^\d{5}$/.test(pc)) return null;
  const n = parseInt(pc.slice(0, 2), 10);
  if (n >= 1 && n <= 2) return "Perlis";
  if (n >= 5 && n <= 9) return "Kedah";
  if (n >= 10 && n <= 14) return "Pulau Pinang";
  if (n >= 15 && n <= 18) return "Kelantan";
  if (n >= 20 && n <= 24) return "Terengganu";
  if ((n >= 25 && n <= 28) || n === 39 || n === 49 || n === 69) return "Pahang";
  if (n >= 30 && n <= 36) return "Perak";
  if (n >= 40 && n <= 48) return "Selangor";
  if (n >= 50 && n <= 60) return "W.P. Kuala Lumpur";
  if (n === 62) return "W.P. Putrajaya";
  if (n >= 63 && n <= 68) return "Selangor";
  if (n >= 70 && n <= 73) return "Negeri Sembilan";
  if (n >= 75 && n <= 78) return "Melaka";
  if (n >= 79 && n <= 86) return "Johor";
  if (n === 87) return "W.P. Labuan";
  if (n >= 88 && n <= 91) return "Sabah";
  if (n >= 93 && n <= 98) return "Sarawak";
  return null;
}

/** Malaysian mobile numbers: 01x-xxx xxxx (10–11 digits), optional +60. */
export function normaliseMyPhone(v: string) {
  let d = v.replace(/[^\d+]/g, "");
  if (d.startsWith("+60")) d = "0" + d.slice(3);
  else if (d.startsWith("60")) d = "0" + d.slice(2);
  return /^01\d{8,9}$/.test(d) ? d : null;
}

export const CheckoutSchema = z.object({
  lines: z
    .array(z.object({ slug: z.string(), shade: z.string().optional(), qty: z.number().int().min(1).max(10) }))
    .min(1)
    .max(30),
  voucher: z.string().max(30).optional(),
  pointsToUse: z.number().int().min(0).max(1_000_000).default(0),
  pointsBalance: z.number().int().min(0).default(0),
  shipping: z.enum(["standard", "express"]),
  contact: z.object({ email: z.string().email(), phone: z.string().min(9).max(16), marketing: z.boolean() }),
  address: z.object({ name: z.string().min(2).max(80), line1: z.string().min(5).max(160), postcode: z.string().regex(/^\d{5}$/), city: z.string().min(2).max(60), state: z.string().min(3).max(40) }),
  gift: z.object({ on: z.boolean(), message: z.string().max(200).optional() }),
  payment: z.enum(["fpx", "card", "duitnow", "ewallet", "bnpl", "passkey"]),
  bank: z.string().max(40).optional(),
});
export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export const BANKS = ["Maybank2u", "CIMB Clicks", "Public Bank", "RHB Now", "Bank Islam", "Hong Leong", "AmBank", "Bank Rakyat"];
