"use server";

import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth";
import { formObject, fromZodError, safeNext, type FormState } from "@/lib/forms";
import { hashPassword, verifyPassword } from "@/lib/password";

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Required").max(100),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]{3,30}$/, "3–30 letters, numbers or underscores"),
    email: z.email("Enter a valid email").trim().toLowerCase(),
    password: z.string().min(8, "At least 8 characters").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formObject(formData);
  const values = { name: raw.name ?? "", username: raw.username ?? "", email: raw.email ?? "" };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error, values);
  const { name, username, email, password } = parsed.data;

  const [taken] = await db
    .select({ username: users.username, email: users.email })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1);
  if (taken) {
    return taken.username === username
      ? { fieldErrors: { username: ["That username is taken"] }, values }
      : { fieldErrors: { email: ["An account with that email already exists"] }, values };
  }

  const [user] = await db
    .insert(users)
    .values({ name, username, email, passwordHash: await hashPassword(password) })
    .returning({ id: users.id });
  await createSession(user.id);
  redirect(safeNext(formData.get("next") as string | null));
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const login = String(formData.get("login") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(or(eq(users.username, login), eq(users.email, login)))
    .limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "That username/email and password don't match.", values: { login } };
  }
  await createSession(user.id);
  redirect(safeNext(formData.get("next") as string | null));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
