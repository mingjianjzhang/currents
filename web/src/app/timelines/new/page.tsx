import type { Metadata } from "next";
import { TimelineForm } from "@/components/TimelineForm";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New timeline" };

export default async function NewTimelinePage() {
  await requireUser("/timelines/new");
  return (
    <div className="narrow container">
      <h1>New timeline</h1>
      <p className="muted">You&apos;ll be its owner, and you can approve other people as editors.</p>
      <TimelineForm />
    </div>
  );
}
