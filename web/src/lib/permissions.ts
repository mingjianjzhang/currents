import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { timelineMembers, type MemberRole } from "@/db/schema";

export async function getRole(timelineId: number, userId: number | undefined): Promise<MemberRole | null> {
  if (!userId) return null;
  const [row] = await db
    .select({ role: timelineMembers.role })
    .from(timelineMembers)
    .where(and(eq(timelineMembers.timelineId, timelineId), eq(timelineMembers.userId, userId)))
    .limit(1);
  return row?.role ?? null;
}

export const canEdit = (role: MemberRole | null) => role === "owner" || role === "editor";
export const canManage = (role: MemberRole | null) => role === "owner";

export class ForbiddenError extends Error {
  constructor() {
    super("You don't have permission to do that.");
  }
}
