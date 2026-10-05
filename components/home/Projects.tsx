"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import shared from "@/app/page.module.scss";
import styles from "./Projects.module.scss";
import store from "@/public/projects/aurora/devices/store.webp";
import admin from "@/public/projects/aurora/devices/admin.webp";
import pwa from "@/public/projects/aurora/devices/pwa.webp";
import sladostiStore from "@/public/projects/sladosti/devices/store.webp";
import sladostiAdmin from "@/public/projects/sladosti/devices/admin.webp";
import sladostiPwa from "@/public/projects/sladosti/devices/pwa.webp";
import woodcraftStore from "@/public/projects/woodcraft/devices/store.webp";
import woodcraftAdmin from "@/public/projects/woodcraft/devices/admin.webp";
import woodcraftPwa from "@/public/projects/woodcraft/devices/pwa.webp";

const auroraScreens = [
  {
    id: "store",
    label: "Магазин",
    image: store,
    description: "Витрина, каталог и выбор товаров",
  },
  {
    id: "admin",
    label: "Админка",
    image: admin,
    description: "Заказы, товары и аналитика магазина",
  },
  {
    id: "pwa",
    label: "PWA",
    image: pwa,
    description: "Мобильный магазин в формате приложения",
  },
] as const;
type View = "all" | (typeof auroraScreens)[number]["id"];
const views: { id: View; label: string }[] = [
  { id: "all", label: "Весь проект" },
  ...auroraScreens,
];

const projects = [
  {
    name: "AURORA",
    category: "интернет-магазин",
    description: "Витрина, управление магазином и мобильное приложение.",
    price: "49 000",
    screens: auroraScreens,
  },
  {
    name: "Сладости",
    category: "онлайн-кондитерская",
    description: "Каталог десертов, управление заказами и мобильное приложение.",
    price: "49 000",
    screens: auroraScreens.map((screen) => ({
      ...screen,
      image: { store: sladostiStore, admin: sladostiAdmin, pwa: sladostiPwa }[screen.id],
    })),
  },
  {
    name: "WOODCRAFT",
    category: "мебельная мастерская",
    description: "Премиальный сайт, управление заказами и мобильная версия.",
    price: "29 900",
    screens: auroraScreens.map((screen) => ({
      ...screen,
      image: { store: woodcraftStore, admin: woodcraftAdmin, pwa: woodcraftPwa }[screen.id],
      description: {
        store: "Сайт мебельной мастерской и коллекции мебели",
        admin: "Заявки, заказы и управление производством",
        pwa: "Мобильная версия сайта мебельной мастерской",
      }[screen.id],
    })),
  },
] as const;
const projectCount = String(projects.length).padStart(2, "0");

export default function Projects() {
  const [project, setProject] = useState(0);
  const [view, setView] = useState<View>("all");
  const [transition, setTransition] = useState<"idle" | "out" | "in">("idle");
  const direction = useRef(1);
  const changeProject = (step = 1) => {
    if (transition !== "idle") return;
    direction.current = step;
    setTransition("out");
  };
  const currentProject = projects[project];
  const screens = currentProject.screens;
  const touch = useRef<{ x: number; y: number } | null>(null);


  return (
    <section
      className={`${shared.section} ${styles.section}`}
      id="projects"
      aria-labelledby="projects-title"
    >
      <header className={styles.heading}>
        <div>
          <p className={shared.eyebrow}>КОНЦЕПТЫ / {projectCount}</p>
          <h2 id="projects-title">
            Проекты и решения<span>.</span>
          </h2>
        </div>
        <p className={styles.intro}>
          От первого экрана
          <br />
          до управления бизнесом.
        </p>
      </header>

      <div
        className={styles.views}
        role="group"
        aria-label="Выбрать вид проекта"
      >
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={view === item.id}
            aria-controls="project-screens"
            onClick={() => setView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        id="project-screens"
        className={styles.stage}
        data-view={view}
        data-project={currentProject.name}
        data-transition={transition}
        aria-busy={transition !== "idle"}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          if (transition === "out") {
            setProject((current) => (current + direction.current + projects.length) % projects.length);
            setView("all");
            setTransition("in");
          } else if (transition === "in") {
            setTransition("idle");
          }
        }}
        role="region"
        aria-roledescription="карусель"
        aria-label="Слайдер проектов"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            changeProject(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        onTouchStart={(event) => {
          touch.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        }}
        onTouchCancel={() => {
          touch.current = null;
        }}
        onTouchEnd={(event) => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
            changeProject(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        {screens.map((screen) => (
          <button
            type="button"
            key={`${project}-${screen.id}`}
            className={`${styles.device} ${styles[screen.id]}`}
            data-active={view === screen.id}
            aria-label={`Показать экран: ${screen.label}`}
            aria-pressed={view === screen.id}
            onClick={() => setView(screen.id)}
          >
            <Image
              className={styles.screen}
              src={screen.image}
              alt={`${currentProject.name} — ${screen.description}`}
              sizes={
                screen.id === "pwa"
                  ? "(max-width: 760px) 62vw, (max-width: 1440px) 30vw, 430px"
                  : "(max-width: 760px) 94vw, (max-width: 1440px) 54vw, 760px"
              }
              draggable={false}
            />
          </button>
        ))}
      </div>

      <footer className={styles.footer}>
        <div className={styles.projectInfo} data-transition={transition}>
          <h3>
            {currentProject.name} <span>— {currentProject.category}</span>
          </h3>
          <p className={styles.description}>
            {currentProject.description}
          </p>
          <p className={styles.price}><span>от</span> {currentProject.price} ₽</p>
          <div className={styles.tags}>
            <span>Next.js</span>
            <span>TypeScript</span>
            <span>PWA</span>
            <span>Концепт</span>
          </div>
        </div>
        <div className={styles.controls}>
          <span className={styles.counter} aria-live="polite">
            {`${String(project + 1).padStart(2, "0")} / ${projectCount}`}
          </span>
          <button
            type="button"
            onClick={() => changeProject(-1)}
            aria-label="Предыдущий проект"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => changeProject(1)}
            aria-label="Следующий проект"
          >
            →
          </button>
          <button type="button" className={styles.open} onClick={() => changeProject(1)}>
            Следующий проект <span aria-hidden="true">↗</span>
          </button>
        </div>
      </footer>
    </section>
  );
}
