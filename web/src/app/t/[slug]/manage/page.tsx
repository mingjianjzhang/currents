import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq, ne } from "drizzle-orm";
import { deleteTimeline, removeEditor, respondToRequest } from "@/app/actions/timelines";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/db";
import { timelineMembers, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canManage, getRole } from "@/lib/permissions";
import { getTimelineBySlug } from "@/lib/timelines";

export const metadata: Metadata = { title: "Manage timeline" };

export default async function ManagePage({ params }: PageProps<"/t/[slug]/manage">) {
  const { slug } = await params;
  const timeline = await getTimelineBySlug(slug);
  if (!timeline) notFound();
  const user = await requireUser(`/t/${slug}/manage`);
  if (!canManage(await getRole(timeline.id, user.id))) redirect(`/t/${slug}`);

  const members = await db
    .select({
      userId: users.id,
      name: users.name,
      username: users.username,
      role: timelineMembers.role,
      editRequestedAt: timelineMembers.editRequestedAt,
    })
    .from(timelineMembers)
    .innerJoin(users, eq(users.id, timelineMembers.userId))
    .where(and(eq(timelineMembers.timelineId, timeline.id), ne(timelineMembers.role, "owner")))
    .orderBy(asc(users.name));

  const requests = members.filter((m) => m.role === "subscriber" && m.editRequestedAt);
  const editors = members.filter((m) => m.role === "editor");
  const subscriberCount = members.filter((m) => m.role === "subscriber").length;

  return (
    <div className="container narrow" style={{ maxWidth: 720 }}>
      <p className="small">
        <Link href={`/t/${slug}`}>← {timeline.title}</Link>
      </p>
      <h1>Manage timeline</h1>
      <p className="muted">
        {subscriberCount} {subscriberCount === 1 ? "subscriber" : "subscribers"}
      </p>

      <section className="section card">
        <h2>Edit requests</h2>
        {requests.length === 0 ? (
          <p className="muted">No pending requests.</p>
        ) : (
          <ul className="list">
            {requests.map((m) => (
              <li key={m.userId}>
                <span>
                  {m.name} <span className="muted">@{m.username}</span>
                </span>
                <span className="row">
                  <form action={respondToRequest.bind(null, timeline.id, m.userId, true)}>
                    <SubmitButton>Approve</SubmitButton>
                  </form>
                  <form action={respondToRequest.bind(null, timeline.id, m.userId, false)}>
                    <SubmitButton className="secondary">Decline</SubmitButton>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section card">
        <h2>Editors</h2>
        {editors.length === 0 ? (
          <p className="muted">Only you can add sources right now.</p>
        ) : (
          <ul className="list">
            {editors.map((m) => (
              <li key={m.userId}>
                <span>
                  {m.name} <span className="muted">@{m.username}</span>
                </span>
                <form action={removeEditor.bind(null, timeline.id, m.userId)}>
                  <SubmitButton className="link" confirm={`Remove ${m.name} as an editor?`}>
                    Remove editor
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section card">
        <h2>Danger zone</h2>
        <p className="muted">Deleting a timeline removes all of its sources and tags. This can&apos;t be undone.</p>
        <form action={deleteTimeline.bind(null, timeline.id)}>
          <SubmitButton className="danger" confirm={`Delete “${timeline.title}” and everything in it?`}>
            Delete timeline
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
