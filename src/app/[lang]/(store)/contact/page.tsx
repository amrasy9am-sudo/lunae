import type { Metadata } from "next";
import { MessageCircle, Mail, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-bits";
import { ContactForm } from "@/components/contact-form";
import { WHATSAPP } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader
        eyebrow={ms ? "Hubungi kami" : "Contact us"}
        title={ms ? "Kami di sini, 7 hari seminggu." : "We're here, 7 days a week."}
        intro={ms ? "WhatsApp ialah cara terpantas. Untuk perkara lain, guna borang di bawah." : "WhatsApp is the fastest way to reach us. For anything else, use the form below."}
      />
      <div className="container-lux grid gap-12 py-12 lg:grid-cols-[1.5fr_1fr]">
        <ContactForm />
        <aside className="space-y-4 self-start">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="border-line bg-surface flex items-start gap-4 rounded-[20px] border p-5">
            <MessageCircle className="text-sage mt-0.5 h-6 w-6" />
            <span>
              <span className="block font-semibold">WhatsApp</span>
              <span className="text-ink-2 block text-[14px]">{ms ? "Saluran utama · balasan pertama ≤ 15 minit" : "Primary channel · first reply ≤ 15 minutes"}</span>
            </span>
          </a>
          <div className="border-line bg-surface flex items-start gap-4 rounded-[20px] border p-5">
            <Mail className="text-accent-deep mt-0.5 h-6 w-6" />
            <span>
              <span className="block font-semibold">hello@lunae.my</span>
              <span className="text-ink-2 block text-[14px]">{ms ? "Media: press@lunae.my · Data peribadi: dpo@lunae.my" : "Press: press@lunae.my · Personal data: dpo@lunae.my"}</span>
            </span>
          </div>
          <div className="border-line bg-surface flex items-start gap-4 rounded-[20px] border p-5">
            <Clock className="text-ink-3 mt-0.5 h-6 w-6" />
            <span>
              <span className="block font-semibold">{ms ? "9 pagi – 9 malam, setiap hari" : "9 am – 9 pm, every day"}</span>
              <span className="text-ink-2 block text-[14px]">{ms ? "Chatbot 24 jam untuk soalan lazim & penjejakan" : "24-hour chatbot for FAQs & order tracking"}</span>
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
