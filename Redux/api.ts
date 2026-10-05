import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export type LandingData = {
  capabilities: { title: string; description: string }[];
  services: { title: string; description: string }[];
  stack: string[];
  steps: { title: string; description: string }[];
};

export const landingData: LandingData = {
  capabilities: [
    { title: "Корпоративные сайты", description: "Имидж и рост бизнеса" },
    { title: "E-commerce", description: "Интернет-магазины и каталоги" },
    { title: "Веб-приложения", description: "Сервисы и внутренние системы" },
  ],
  services: [
    { title: "Корпоративные сайты", description: "Сайты для бизнеса с продуманной структурой, современным дизайном и удобной CMS. Легко обновлять и масштабировать." },
    { title: "Интернет-магазины", description: "Полноценные онлайн-магазины с каталогом, корзиной, оплатой и интеграциями. Удобные для ваших клиентов и простые в управлении." },
    { title: "Веб-приложения", description: "Личные кабинеты, внутренние системы и сложные сервисы с интеграциями. От идеи до работающего продукта." },
  ],
  stack: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL"],
  steps: [
    { title: "Задача", description: "Разбираем ваши цели и требования." },
    { title: "Прототип", description: "Согласовываем структуру и ключевые экраны." },
    { title: "Разработка", description: "Реализую фронтенд, бэкенд и интеграции." },
    { title: "Запуск", description: "Тестируем, дорабатываем и запускаем проект." },
  ],
};

export const landingApi = createApi({
  reducerPath: "landingApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getLanding: builder.query<LandingData, void>({ queryFn: async () => ({ data: landingData }) }),
  }),
});

export const { useGetLandingQuery } = landingApi;
