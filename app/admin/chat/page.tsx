import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import AdminChatDashboard from "@/components/admin/AdminChatDashboard";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  const session = (await cookies()).get(adminCookieName)?.value;
  if (!isValidAdminSession(session)) redirect("/admin/login");
  return <AdminChatDashboard/>;
}
