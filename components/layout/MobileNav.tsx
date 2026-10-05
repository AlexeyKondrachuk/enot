"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import styles from "@/app/layout.module.scss";

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}

const items = [
  {
    id: "home",
    label: "Главная",
    href: "/",
    path: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h5v-6h4v6h5V9" />
      </>
    ),
  },
  {
    id: "projects",
    label: "Проекты",
    href: "/#projects",
    path: (
      <>
        <path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5" />
      </>
    ),
  },
  {
    id: "about",
    label: "Обо мне",
    href: "/about",
    path: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
  },
  {
    id: "contact",
    label: "Написать",
    href: "#contact",
    path: (
      <>
        <path d="M20 15a3 3 0 0 1-3 3H9l-6 3V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v9Z" />
        <path d="M7 8h9M7 12h6" />
      </>
    ),
  },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => "",
  );
  const active =
    hash === "#contact"
      ? "contact"
      : pathname === "/about"
        ? "about"
        : pathname === "/" && hash === "#projects"
          ? "projects"
          : pathname === "/"
            ? "home"
            : null;

  return (
    <nav className={styles.mobileNav} aria-label="Мобильная навигация">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`${styles.mobileNavItem} ${active === item.id ? styles.mobileNavActive : ""}`}
          aria-current={
            active === item.id
              ? item.id === "home" || item.id === "about"
                ? "page"
                : "location"
              : undefined
          }
          onClick={() => {
            // Next's client-side hash navigation can update history without hashchange.
            window.setTimeout(
              () => window.dispatchEvent(new Event("hashchange")),
              0,
            );
          }}
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {item.path}
          </svg>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
