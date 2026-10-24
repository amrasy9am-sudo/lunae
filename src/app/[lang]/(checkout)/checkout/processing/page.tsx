import type { Metadata } from "next";
import { Processing } from "@/components/checkout/processing";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default function ProcessingPage() {
  return <Processing />;
}
