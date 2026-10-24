import type { Metadata } from "next";
import { QueueRoom } from "@/components/queue-room";

export const metadata: Metadata = { title: "Waiting room", robots: { index: false } };

export default function QueuePage() {
  return <QueueRoom />;
}
