import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = { title: "Bag", robots: { index: false } };

export default function Cart() {
  return (
    <div className="container-lux py-12">
      <CartPage />
    </div>
  );
}
