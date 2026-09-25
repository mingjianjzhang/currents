import { z } from "zod";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  /** Submitted values, echoed back so React's post-action form reset restores them. Never include passwords. */
  values?: Record<string, string>;
}

export function fromZodError(error: z.ZodError, values?: Record<string, string>): FormState {
  return { error: "Please fix the highlighted fields.", fieldErrors: z.flattenError(error).fieldErrors, values };
}

export function formObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData) if (typeof v === "string") out[k] = v;
  return out;
}

export function slugify(title: string): string {
  return (
    title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "timeline"
  );
}

/** Splits "a, b ,a" into ["a", "b"]. */
export function parseTagList(raw: string): string[] {
  return [...new Set(raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}

/** Only allow same-site relative redirects after login. */
export function safeNext(raw: string | undefined | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/dashboard";
}
