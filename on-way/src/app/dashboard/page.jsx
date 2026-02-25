import { redirect } from "next/navigation";

export default function DashboardPage() {
  const role = "passenger"; // change manually for testing

  if (role === "admin") {
    redirect("/dashboard/admin");
  }

  if (role === "rider") {
    redirect("/dashboard/rider");
  }

  if (role === "supportAgent") {
    redirect("/dashboard/supportAgent");
  }

  redirect("/dashboard/passenger");
}