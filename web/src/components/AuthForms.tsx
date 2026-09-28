"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import type { FormState } from "@/lib/forms";
import { Field, FormAlert } from "./Field";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="card">
      <FormAlert error={state.error} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Username or email" name="login">
        <input id="login" name="login" autoComplete="username" defaultValue={state.values?.login} required />
      </Field>
      <Field label="Password" name="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="row">
        <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
        <span className="muted small">
          New here? <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>Create an account</Link>
        </span>
      </div>
    </form>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(signup, {});
  const e = state.fieldErrors;
  return (
    <form action={action} className="card">
      <FormAlert error={state.error} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Name" name="name" errors={e}>
        <input id="name" name="name" autoComplete="name" defaultValue={state.values?.name} required />
      </Field>
      <div className="grid-2">
        <Field label="Username" name="username" errors={e}>
          <input id="username" name="username" autoComplete="username" defaultValue={state.values?.username} required />
        </Field>
        <Field label="Email" name="email" errors={e}>
          <input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} required />
        </Field>
      </div>
      <div className="grid-2">
        <Field label="Password" name="password" errors={e} hint="At least 8 characters">
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm password" name="confirm" errors={e}>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <div className="row">
        <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
        <span className="muted small">
          Have an account? <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Log in</Link>
        </span>
      </div>
    </form>
  );
}
