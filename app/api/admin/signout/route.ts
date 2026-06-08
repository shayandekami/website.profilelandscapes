import { signOut } from "@/lib/auth";

export async function POST(request: Request) {
  await signOut({ redirect: false });
  return Response.redirect(new URL("/admin/login", request.url), 303);
}
