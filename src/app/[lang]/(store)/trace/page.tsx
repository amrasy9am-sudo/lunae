import type { Metadata } from "next";
import { PageHeader } from "@/components/page-bits";
import { TraceLookup } from "@/components/trace-lookup";

export const metadata: Metadata = { title: "Batch & halal trace" };

export default async function TracePage({ params }: PageProps<"/[lang]/trace">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader
        eyebrow={ms ? "Semakan kelompok & halal" : "Batch & halal trace"}
        title={
          <>
            {ms ? "Tahu dengan tepat" : "Know exactly"} <em>{ms ? "apa yang anda pakai." : "what you're wearing."}</em>
          </>
        }
        intro={
          ms
            ? "Imbas kod QR pada kotak atau masukkan nombor kelompok untuk lihat tarikh pembuatan & luput, sijil halal, notifikasi NPRA, ringkasan COA, status penarikan balik dan semakan ketulenan."
            : "Scan the QR on your box or enter the batch number to see manufacture & expiry dates, the halal certificate, NPRA notification, COA summary, recall status and an authenticity check."
        }
      />
      <div className="container-lux py-12">
        <TraceLookup />
      </div>
    </>
  );
}
