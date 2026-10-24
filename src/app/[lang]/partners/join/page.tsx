import type { Metadata } from "next";
import { PartnerApply } from "@/components/partner-apply";

export const metadata: Metadata = { title: "Apply" };

export default async function JoinPage({ params }: PageProps<"/[lang]/partners/join">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <div className="container-lux grid gap-12 py-14 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <p className="eyebrow text-accent-deep">{ms ? "Mohon & KYC" : "Apply & KYC"}</p>
        <h1 className="display-l mt-4">{ms ? "Jadi rakan LUNAE." : "Become a LUNAE partner."}</h1>
        <ol className="text-ink-2 mt-8 space-y-4 text-[15.5px]">
          <li>1 · {ms ? "Hantar borang ini" : "Send this form"}</li>
          <li>2 · {ms ? "Semakan & panggilan pengenalan (5 hari bekerja)" : "Review & intro call (5 working days)"}</li>
          <li>3 · {ms ? "Muat naik dokumen SSM/IC dengan selamat" : "Upload SSM/ID documents securely"}</li>
          <li>4 · {ms ? "Tandatangan perjanjian secara elektronik" : "e-Sign your agreement"}</li>
          <li>5 · {ms ? "Akses portal, pautan & bank aset" : "Get portal access, links & asset bank"}</li>
        </ol>
      </div>
      <div className="border-line bg-surface rounded-[24px] border p-6 sm:p-8">
        <PartnerApply />
      </div>
    </div>
  );
}
