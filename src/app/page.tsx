import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const runtime = "edge";

export default async function Home() {
  const session = await getSession();
  if (!session) {
    // Sem sessão: passa pelo logout para limpar qualquer cookie inválido e
    // impedir que o middleware devolva para cá (loop de redirecionamento).
    redirect("/api/auth/logout");
  }
  redirect(session.role === "developer" ? "/meu-checkin" : "/dashboard");
}
