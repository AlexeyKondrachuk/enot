import styles from "@/app/admin/admin.module.scss";

export default function LoginForm({ error }: { error?: string }) {
  return <form className={styles.loginCard} method="post" action="/api/admin/login-form">
    <div className={styles.loginMark}>Е</div>
    <div><p className={styles.loginKicker}>ENOT CONTROL</p><h1>Вход в чат</h1><p>Введите пароль администратора</p></div>
    <label><span>Пароль</span><input name="password" type="password" required autoComplete="current-password" autoCapitalize="none" spellCheck={false} autoFocus placeholder="••••••••••••"/></label>
    {error && <p className={styles.loginError}>{error}</p>}
    <button type="submit">Продолжить</button>
    <small>Защищённая HttpOnly-сессия на 12 часов</small>
  </form>;
}
