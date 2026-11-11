"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/infra/session-cookie";

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}