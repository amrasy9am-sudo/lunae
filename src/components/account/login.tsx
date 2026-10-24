"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { KeyRound, MessageSquare, ShieldCheck } from "lucide-react";
import { useHref, useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { useAccount, useUI } from "@/lib/store";
import { normaliseMyPhone } from "@/lib/checkout";

const b64 = (n: number) => crypto.getRandomValues(new Uint8Array(n));

export function Login() {
  const t = useT();
  const href = useHref();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/account";
  const acc = useAccount();
  const ui = useUI();
  const [tab, setTab] = useState<"otp" | "passkey">("otp");
  const [name, setName] = useState(acc.user?.name ?? "");
  const [email, setEmail] = useState(acc.user?.email ?? "");
  const [phone, setPhone] = useState(acc.user?.phone ?? "");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [sent, setSent] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [terms, setTerms] = useState(false);
  const [mkt, setMkt] = useState(false);
  const [busy, setBusy] = useState(false);

  const done = (u: { name: string; email: string; phone: string }) => {
    acc.signIn(u);
    if (mkt) acc.setConsent("marketingWhatsApp", true);
    ui.notify(t(tx("Welcome to Lunae Circle", "Selamat datang ke Lunae Circle")));
    router.replace(href(next));
  };

  const validate = () => {
    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !normaliseMyPhone(phone)) {
      ui.notify(t(tx("Please enter your name, a valid email and a Malaysian mobile number.", "Sila masukkan nama, e-mel sah dan nombor telefon Malaysia.")), "error");
      return false;
    }
    if (!terms) {
      ui.notify(t(tx("Please accept the terms & privacy notice.", "Sila terima terma & notis privasi.")), "warning");
      return false;
    }
    return true;
  };

  const createPasskey = async () => {
    if (!validate()) return;
    if (!window.PublicKeyCredential)
      return ui.notify(t(tx("Passkeys aren't supported on this browser — use a one-time code.", "Passkey tidak disokong pada pelayar ini — guna kod sekali guna.")), "info");
    setBusy(true);
    try {
      await navigator.credentials.create({
        publicKey: {
          rp: { name: "LUNAE", id: location.hostname },
          user: { id: b64(16), name: email, displayName: name },
          challenge: b64(32),
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
          timeout: 60_000,
        },
      });
      acc.addPasskey(
        navigator.userAgent.includes("Mac") ? "Mac / iPhone" : navigator.userAgent.includes("Android") ? "Android" : navigator.userAgent.includes("Windows") ? "Windows Hello" : "This device",
      );
      done({ name, email, phone: normaliseMyPhone(phone)! });
    } catch {
      ui.notify(t(tx("Passkey wasn't created. You can use a one-time code instead.", "Passkey tidak dicipta. Anda boleh guna kod sekali guna.")), "warning");
    } finally {
      setBusy(false);
    }
  };

  const signInPasskey = async () => {
    if (!acc.user || !acc.passkeys.length) return ui.notify(t(tx("No passkey on this device yet — create one below.", "Belum ada passkey pada peranti ini — cipta di bawah.")), "info");
    try {
      await navigator.credentials.get({ publicKey: { challenge: b64(32), rpId: location.hostname, userVerification: "preferred", timeout: 60_000 } });
      done(acc.user);
    } catch {
      ui.notify(t(tx("Sign-in cancelled.", "Log masuk dibatalkan.")), "info");
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-12 py-12 lg:grid-cols-[1fr_1fr] lg:py-20">
      <div>
        <p className="eyebrow text-accent-deep">Lunae Circle</p>
        <h1 className="display-l mt-4">{t(tx("Sign in or join — no password.", "Log masuk atau sertai — tanpa kata laluan."))}</h1>
        <p className="text-ink-2 mt-5 text-[16px]">
          {t(
            tx(
              "Use a passkey (Face ID, fingerprint or device PIN) or a one-time code by WhatsApp or SMS. New members get 200 welcome points.",
              "Guna passkey (Face ID, cap jari atau PIN peranti) atau kod sekali guna melalui WhatsApp atau SMS. Ahli baharu dapat 200 mata alu-aluan.",
            ),
          )}
        </p>
        {acc.user && acc.passkeys.length > 0 && (
          <button className="btn btn-primary mt-8" onClick={signInPasskey}>
            <KeyRound className="h-4 w-4" /> {t(tx("Sign in with passkey", "Log masuk dengan passkey"))}
          </button>
        )}
        <p className="text-ink-3 mt-8 flex items-start gap-2 text-[13px]">
          <ShieldCheck className="text-sage h-4 w-4 shrink-0" />
          {t(
            tx(
              "Preview: your account is stored only on this device. At launch, accounts move to LUNAE's Malaysian-region servers with short sessions and token rotation.",
              "Pratonton: akaun anda disimpan pada peranti ini sahaja. Semasa pelancaran, akaun dipindahkan ke pelayan rantau Malaysia LUNAE dengan sesi pendek dan putaran token.",
            ),
          )}
        </p>
      </div>
      <div className="border-line bg-surface rounded-[24px] border p-6 sm:p-8">
        <div role="tablist" className="bg-bg grid grid-cols-2 gap-2 rounded-full p-1">
          <button
            role="tab"
            aria-selected={tab === "otp"}
            onClick={() => setTab("otp")}
            className={`h-10 rounded-full text-[14px] font-semibold ${tab === "otp" ? "bg-primary text-primary-ink" : ""}`}
          >
            {t(tx("One-time code", "Kod sekali guna"))}
          </button>
          <button
            role="tab"
            aria-selected={tab === "passkey"}
            onClick={() => setTab("passkey")}
            className={`h-10 rounded-full text-[14px] font-semibold ${tab === "passkey" ? "bg-primary text-primary-ink" : ""}`}
          >
            Passkey
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[13px] font-medium">{t(tx("Name", "Nama"))}</span>
            <input className="field mt-1.5" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium">Email</span>
            <input className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium">{t(tx("Mobile (MY)", "Telefon bimbit (MY)"))}</span>
            <input className="field mt-1.5" type="tel" inputMode="tel" autoComplete="tel" placeholder="012-345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="flex items-start gap-2.5 text-[13.5px]">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--ink)]" />
            <span>
              {t(tx("I accept the", "Saya terima"))}{" "}
              <L href="/policies/terms" className="link">
                {t(tx("terms", "terma"))}
              </L>{" "}
              {t(tx("and", "dan"))}{" "}
              <L href="/policies/privacy" className="link">
                {t(tx("privacy notice (PDPA)", "notis privasi (PDPA)"))}
              </L>
              .
            </span>
          </label>
          <label className="text-ink-2 flex items-start gap-2.5 text-[13.5px]">
            <input type="checkbox" checked={mkt} onChange={(e) => setMkt(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--ink)]" />
            {t(tx("Send me drop reminders & offers on WhatsApp (optional, max 1/day).", "Hantar peringatan drop & tawaran di WhatsApp (pilihan, maks 1/hari)."))}
          </label>
          {tab === "passkey" ? (
            <button className="btn btn-primary w-full" disabled={busy} onClick={createPasskey}>
              <KeyRound className="h-4 w-4" /> {t(tx("Create passkey & join", "Cipta passkey & sertai"))}
            </button>
          ) : !sent ? (
            <>
              <div className="flex gap-2">
                {(["whatsapp", "sms"] as const).map((c) => (
                  <button key={c} className="chip flex-1 justify-center" aria-pressed={channel === c} onClick={() => setChannel(c)}>
                    {c === "whatsapp" ? "WhatsApp" : "SMS"}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  if (!validate()) return;
                  const c = String(Math.floor(100000 + Math.random() * 900000));
                  setSent(c);
                }}
              >
                <MessageSquare className="h-4 w-4" /> {t(tx("Send code", "Hantar kod"))}
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim() !== sent) return ui.notify(t(tx("That code doesn't match.", "Kod tidak sepadan.")), "error");
                done({ name, email, phone: normaliseMyPhone(phone)! });
              }}
              className="space-y-3"
            >
              <p className="bg-tint-sage rounded-[12px] p-3 text-[13.5px]">
                {t(tx(`Demo ${channel === "whatsapp" ? "WhatsApp" : "SMS"}: your LUNAE code is`, `Demo ${channel === "whatsapp" ? "WhatsApp" : "SMS"}: kod LUNAE anda ialah`))}{" "}
                <strong className="tracking-[0.2em]">{sent}</strong>
              </p>
              <input
                className="field text-center text-[22px] tracking-[0.5em]"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                aria-label={t(tx("6-digit code", "Kod 6 digit"))}
                autoFocus
              />
              <button className="btn btn-primary w-full">{t(tx("Verify & continue", "Sahkan & teruskan"))}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
