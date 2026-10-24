import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-bits";
import { TrackOrder } from "@/components/order-views";

export const metadata: Metadata = { title: "Track order" };

export default async function TrackPage({ params }: PageProps<"/[lang]/track">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader eyebrow={ms ? "Jejak pesanan" : "Track order"} title={ms ? "Di mana seri saya?" : "Where's my glow?"} />
      <div className="container-lux py-12">
        <Suspense fallback={<div className="skeleton h-80" />}>
          <TrackOrder />
        </Suspense>
      </div>
    </>
  );
}
