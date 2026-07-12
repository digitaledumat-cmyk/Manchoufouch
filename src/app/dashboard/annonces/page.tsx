import { redirect } from "next/navigation";

export default function DashboardAnnoncesRedirect() {
  redirect("/dashboard/articles");
}
