"use client";

import { useActionState, useState, useTransition } from "react";
import { createEntry, lookupMetadata } from "@/app/actions/entries";
import type { EntryKind } from "@/db/schema";
import type { FormState } from "@/lib/forms";
import { Field, FormAlert } from "./Field";
import { SubmitButton } from "./SubmitButton";

const today = () => new Date().toISOString().slice(0, 10);

const blank = {
  kind: "article" as EntryKind,
  url: "",
  isbn: "",
  title: "",
  description: "",
  source: "",
  imageUrl: "",
  occurredOn: today(),
  tags: "",
};

export function EntryForm({ timelineId, existingTags }: { timelineId: number; existingTags: string[] }) {
  // Controlled fields so values survive a failed validation round-trip.
  const [v, setV] = useState(blank);

  const [state, action] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await createEntry(timelineId, prev, fd);
    // Keep kind and date so adding several sources from one day is quick.
    if (result.message) setV((p) => ({ ...blank, kind: p.kind, occurredOn: p.occurredOn }));
    return result;
  }, {});

  const [lookupError, setLookupError] = useState<string>();
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (k === "kind" || k === "url" || k === "isbn") setLookupError(undefined);
    setV((prev) => ({ ...prev, [k]: e.target.value }));
  };
  const [looking, startLookup] = useTransition();
  const isBook = v.kind === "book";
  const lookupValue = isBook ? v.isbn : v.url;

  function lookup() {
    setLookupError(undefined);
    startLookup(async () => {
      const res = await lookupMetadata(v.kind, lookupValue);
      if (!res.ok) return setLookupError(res.error);
      setV((p) => ({
        ...p,
        title: res.data.title || p.title,
        description: res.data.description || p.description,
        source: res.data.source || p.source,
        imageUrl: res.data.imageUrl ?? p.imageUrl,
      }));
    });
  }

  const e = state.fieldErrors;
  return (
    <form action={action} className="card">
      <FormAlert error={state.error} message={state.message} />

      <div className="grid-2">
        <Field label="Type" name="kind" errors={e}>
          <select id="kind" name="kind" value={v.kind} onChange={set("kind")}>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="book">Book</option>
          </select>
        </Field>
        <Field label="Date" name="occurredOn" errors={e} hint="When it was published or happened">
          <input id="occurredOn" name="occurredOn" type="date" value={v.occurredOn} onChange={set("occurredOn")} required />
        </Field>
      </div>

      {isBook ? (
        <Field label="ISBN" name="isbn" errors={e}>
          <input id="isbn" name="isbn" value={v.isbn} onChange={set("isbn")} inputMode="numeric" required />
        </Field>
      ) : (
        <Field label="Link" name="url" errors={e} hint={v.kind === "video" ? "YouTube links are embedded" : undefined}>
          <input id="url" name="url" type="url" value={v.url} onChange={set("url")} placeholder="https://" required />
        </Field>
      )}
      {isBook && <input type="hidden" name="url" value={v.url} />}

      <div className="row" style={{ marginBottom: "1rem" }}>
        <button type="button" className="secondary" onClick={lookup} disabled={looking || !lookupValue.trim()}>
          {looking ? "Looking up…" : "Fill in details"}
        </button>
        {lookupError && <span className="field-error">{lookupError}</span>}
      </div>

      {v.imageUrl && (
        <div className="preview">
          <img src={v.imageUrl} alt="" referrerPolicy="no-referrer" />
          <button type="button" className="link small" onClick={() => setV((p) => ({ ...p, imageUrl: "" }))}>
            Remove image
          </button>
        </div>
      )}
      <input type="hidden" name="imageUrl" value={v.imageUrl} />

      <Field label="Title" name="title" errors={e}>
        <input id="title" name="title" value={v.title} onChange={set("title")} required maxLength={300} />
      </Field>
      <Field label={isBook ? "Author" : "Source"} name="source" errors={e} hint={isBook ? undefined : "e.g. The Guardian"}>
        <input id="source" name="source" value={v.source} onChange={set("source")} maxLength={200} />
      </Field>
      <Field label="Description" name="description" errors={e}>
        <textarea id="description" name="description" value={v.description} onChange={set("description")} maxLength={5000} />
      </Field>
      <Field
        label="Tags"
        name="tags"
        errors={e}
        hint={existingTags.length ? `Comma separated. Existing: ${existingTags.join(", ")}` : "Comma separated"}
      >
        <input id="tags" name="tags" value={v.tags} onChange={set("tags")} />
      </Field>

      <SubmitButton pendingText="Adding…">Add to timeline</SubmitButton>
    </form>
  );
}
