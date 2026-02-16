import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    redirect("/auth/sign-in");
  }

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (session.user.role === "MECHANIC") {
    redirect("/dashboard/mechanic");
  }

  redirect("/dashboard/client");
}
