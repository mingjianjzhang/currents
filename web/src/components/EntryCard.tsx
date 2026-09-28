import { deleteEntry } from "@/app/actions/entries";
import type { EntryWithTags } from "@/lib/timeline-query";
import { youtubeId } from "@/lib/metadata";
import { filterToQuery } from "@/lib/filters";
import { SubmitButton } from "./SubmitButton";

const KIND_LABEL = { article: "Article", video: "Video", book: "Book" } as const;

export function EntryCard({ entry, slug, editable }: { entry: EntryWithTags; slug: string; editable: boolean }) {
  const videoId = entry.kind === "video" ? youtubeId(entry.url) : null;
  const href = entry.url ?? (entry.isbn ? `https://books.google.com/books?vid=ISBN${entry.isbn}` : undefined);
  const showThumb = !videoId && entry.imageUrl;

  return (
    <article className={`card entry ${entry.kind}${showThumb ? "" : " no-image"}`} id={`entry-${entry.id}`}>
      {showThumb && (
        // Remote images come from arbitrary publishers, so skip next/image's allowlist.
        <img className="entry-thumb" src={entry.imageUrl!} alt="" loading="lazy" referrerPolicy="no-referrer" />
      )}
      <div>
        {videoId && (
          <div className="video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={entry.title}
              loading="lazy"
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        <div className="entry-meta">
          <span className="kind">{KIND_LABEL[entry.kind]}</span>
          {entry.source && <span>{entry.source}</span>}
        </div>
        <h3>
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {entry.title}
            </a>
          ) : (
            entry.title
          )}
        </h3>
        {entry.description && <p>{entry.description}</p>}
        <div className="entry-actions">
          {entry.tags.length > 0 && (
            <span className="tag-list">
              {entry.tags.map((t) => (
                <a key={t} className="chip" href={`/t/${slug}${filterToQuery({ tags: [t] })}`}>
                  {t}
                </a>
              ))}
            </span>
          )}
          {entry.isbn && (
            <a href={`https://search.worldcat.org/search?q=bn:${entry.isbn}`} target="_blank" rel="noopener noreferrer">
              Find in a library
            </a>
          )}
          {editable && (
            <form action={deleteEntry.bind(null, entry.timelineId, entry.id)}>
              <SubmitButton className="link" pendingText="Removing…" confirm={`Remove “${entry.title}”?`}>
                Remove
              </SubmitButton>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
