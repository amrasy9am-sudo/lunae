import type { Metadata } from "next";
import { AccountShell } from "@/components/account/shell";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function AccountLayout({ children }: LayoutProps<"/[lang]/account">) {
  return <AccountShell>{children}</AccountShell>;
}
