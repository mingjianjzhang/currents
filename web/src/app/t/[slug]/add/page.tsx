import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { EntryForm } from "@/components/EntryForm";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canEdit, getRole } from "@/lib/permissions";
import { getTimelineBySlug } from "@/lib/timelines";

export const metadata: Metadata = { title: "Add a source" };

export default async function AddEntryPage({ params }: PageProps<"/t/[slug]/add">) {
  const { slug } = await params;
  const timeline = await getTimelineBySlug(slug);
  if (!timeline) notFound();
  const user = await requireUser(`/t/${slug}/add`);
  if (!canEdit(await getRole(timeline.id, user.id))) redirect(`/t/${slug}`);

  const tagRows = await db
    .select({ name: tags.name })
    .from(tags)
    .where(eq(tags.timelineId, timeline.id))
    .orderBy(asc(tags.name));

  return (
    <div className="container narrow" style={{ maxWidth: 680 }}>
      <p className="small">
        <Link href={`/t/${slug}`}>← {timeline.title}</Link>
      </p>
      <h1>Add a source</h1>
      <EntryForm timelineId={timeline.id} existingTags={tagRows.map((t) => t.name)} />
    </div>
  );
}
