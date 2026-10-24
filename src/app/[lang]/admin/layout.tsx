import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · LUNAE Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
