import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/forms";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const target = typeof next === "string" ? safeNext(next) : undefined;
  if (await getCurrentUser()) redirect(target ?? "/dashboard");
  return (
    <div className="narrow container">
      <h1>Create an account</h1>
      <p className="muted">Subscribe to timelines, start your own, and help curate others.</p>
      <SignupForm next={target} />
    </div>
  );
}
