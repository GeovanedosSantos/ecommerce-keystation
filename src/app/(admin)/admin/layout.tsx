import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/infra/session-cookie";
import { AdminShell } from "./AdminShell";

async function AdminGuard({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminShell adminLabel="Administrador">{children}</AdminShell>;
}

export default function AdminSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
