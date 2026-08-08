import { auth } from "@/lib/auth";

export type Role = "owner" | "editor" | "designer" | "nursery" | "contributor";

/**
 * Function-level authorization guard. Returns the session when the signed-in
 * user's role is allowed, otherwise throws (server actions surface it as an
 * error; API routes should catch it — see requireRoleApi).
 *
 * Defaults to owner+editor, the two full-access roles. Pass a wider/narrower
 * list per call site if a resource has its own role rules.
 */
export async function requireRole(allowed: Role[] = ["owner", "editor"]) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user || !role || !allowed.includes(role)) {
    throw new Error("Not authorised for this action.");
  }
  return session;
}

/**
 * API-route variant: returns { session } on success or { response } (401/403)
 * to return directly, so routes don't need a try/catch around the guard.
 */
export async function requireRoleApi(allowed: Role[] = ["owner", "editor"]) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user) {
    return {
      session: null,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!role || !allowed.includes(role)) {
    return {
      session: null,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, response: null as null };
}
