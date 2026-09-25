import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card empty">
      <h1>Not found</h1>
      <p>That page doesn&apos;t exist, or the timeline was deleted.</p>
      <Link href="/">Browse timelines</Link>
    </div>
  );
}
