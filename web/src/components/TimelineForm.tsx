"use client";

import { useActionState } from "react";
import { createTimeline } from "@/app/actions/timelines";
import type { FormState } from "@/lib/forms";
import { Field, FormAlert } from "./Field";
import { SubmitButton } from "./SubmitButton";

export function TimelineForm() {
  const [state, action] = useActionState<FormState, FormData>(createTimeline, {});
  return (
    <form action={action} className="card">
      <FormAlert error={state.error} />
      <Field label="Title" name="title" errors={state.fieldErrors} hint="e.g. “The Syrian Civil War”">
        <input id="title" name="title" defaultValue={state.values?.title} required minLength={2} maxLength={120} />
      </Field>
      <Field label="Description" name="description" errors={state.fieldErrors} hint="Optional. What's this timeline about?">
        <textarea id="description" name="description" defaultValue={state.values?.description} maxLength={1000} />
      </Field>
      <SubmitButton pendingText="Creating…">Create timeline</SubmitButton>
    </form>
  );
}
