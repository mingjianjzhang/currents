import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/forms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const target = typeof next === "string" ? safeNext(next) : undefined;
  if (await getCurrentUser()) redirect(target ?? "/dashboard");
  return (
    <div className="narrow container">
      <h1>Log in</h1>
      <LoginForm next={target} />
    </div>
  );
}
