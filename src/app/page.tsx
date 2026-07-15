import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const runtime = "edge";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(session.role === "developer" ? "/meu-checkin" : "/dashboard");
}
