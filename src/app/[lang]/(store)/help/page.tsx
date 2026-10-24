import type { Metadata } from "next";
import { PageHeader } from "@/components/page-bits";
import { HelpCenter } from "@/components/help-center";

export const metadata: Metadata = { title: "Help centre" };

export default async function HelpPage({ params }: PageProps<"/[lang]/help">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader eyebrow={ms ? "Pusat bantuan" : "Help centre"} title={ms ? "Apa yang boleh kami bantu?" : "How can we help?"} />
      <div className="container-lux py-12">
        <HelpCenter />
      </div>
    </>
  );
}
