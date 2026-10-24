import type { Metadata } from "next";
import { ThankYou } from "@/components/order-views";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export function generateStaticParams() {
  return [{ no: "LN-00000" }];
}

export default async function ThanksPage({ params }: PageProps<"/[lang]/order/[no]/thanks">) {
  const { no } = await params;
  return (
    <div className="container-lux py-14">
      <ThankYou no={decodeURIComponent(no)} />
    </div>
  );
}
