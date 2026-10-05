import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import LoginForm from "@/components/admin/LoginForm";
import styles from "../admin.module.scss";

const errors: Record<string, string> = {
  invalid: "Неверный пароль",
  limited: "Слишком много попыток. Попробуйте позже.",
  config: "Авторизация не настроена",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; password?: string }>;
}) {
  const query = await searchParams;
  if (query.password !== undefined) redirect("/admin/login");
  const session = (await cookies()).get(adminCookieName)?.value;
  if (isValidAdminSession(session)) redirect("/admin/chat");

  return <main className={styles.loginPage}>
    <div className={styles.loginGlow}/>
    <LoginForm error={query.error ? errors[query.error] ?? "Не удалось войти" : undefined}/>
  </main>;
}
