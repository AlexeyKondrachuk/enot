# Графика для страницы Next.js

Все пути ниже доступны от корня сайта. Графика подключена к странице `/nextjs`; разметка находится в `app/nextjs/page.tsx`, hero и схема производительности — в `components/nextjs/`.

## Фоны

| Файл | Назначение |
| --- | --- |
| `/nextjs/section-background.webp` | Спокойная фоновая графика для основных секций; центр свободен для текста. |
| `/nextjs/contact-background.webp` | Фон контактов и нижней части страницы; световые акценты сосредоточены справа. |
| `/nextjs/section-background.png` | PNG-версия фона основных секций. |
| `/nextjs/contact-background.png` | PNG-версия фона контактов. |
| `/nextjs/glass-panel.svg` | Прозрачная стеклянная подложка для карточек схемы, без текста и значков. Соотношение сторон 240:132. |

Фоны имеют размер 1536 × 1024. Для сайта предпочтительны WebP. При размещении фона можно дополнительно использовать тёмный градиент по краям; изображения не являются бесшовными текстурами и рассчитаны на `background-repeat: no-repeat`. Подложку карточки можно использовать как фоновое изображение, а текст и значок разместить поверх в HTML.

## Новые значки

Все значки находятся в `/nextjs/icons/`, имеют прозрачный фон и масштабируются без потери качества.

| Файл | Где использовать |
| --- | --- |
| `user.svg` | Пользователь в схеме работы. |
| `globe.svg` | Edge / сервер в схеме работы. |
| `page.svg` | Страница в схеме работы. |
| `database.svg` | Данные и API в схеме работы; светлый вариант. |
| `lightning.svg` | Высокая производительность. |
| `layers.svg` | Гибкая архитектура и корпоративные решения. |
| `growth.svg` | Готовность к росту. |
| `rocket.svg` | Быстрый запуск. |
| `speed.svg` | Производительность в блоке преимуществ. |
| `search.svg` | Поисковая видимость. |
| `marketing.svg` | Маркетинговые сайты. |
| `apps.svg` | Веб-приложения. |
| `arrow-right.svg` | Стрелки между этапами схемы и в кнопках. |
| `paperclip.svg` | Прикрепление файлов в чате. |
| `telegram.svg` | Кнопка Telegram и ссылка в подвале. |
| `github.svg` | Ссылка GitHub в подвале. |

Значки схемы: 40 × 40, цвет `#BCCAD7`. Значки преимуществ: 40 × 40, цвет `#D4FF00`. Значки интерфейса: 24 × 24. Для смены цвета внешнего SVG используйте CSS-маску либо вставляйте SVG в разметку и меняйте stroke/fill; цвет внешнего SVG через обычный img не наследуется.

## Уже существующие ресурсы

| Путь | Назначение |
| --- | --- |
| `/nextjs/hero-next.webp` | Используемый hero, предоставленный пользователем (`hero_next.webp`). |
| `/nextjs-hero-artwork.png` | Предыдущая версия иллюстрации hero; на странице не используется. |
| `/enot-color.svg` | Логотип, также для шапки чата. |
| `/icons/stack-react.svg` | React. |
| `/icons/stack-typescript.svg` | TypeScript. |
| `/icons/stack-nodejs.svg` | Node.js. |
| `/icons/stack-postgresql.svg` | PostgreSQL. |
| `/icons/stack-nextjs.svg` | Next.js. |
| `/icons/shopping-cart.svg` | Интернет-магазины. |

## Что собирать в разметке

График загрузки страниц, индикаторы Core Web Vitals, карточки преимуществ, кнопки, разделители и окно чата следует создавать через HTML/CSS/SVG-компоненты. Числа и линии графика должны отражать реальные данные; статическое изображение из макета не является измерением производительности. Поэтому эти блоки не сохранены как растровые картинки.

## Создание

Фоны созданы встроенным image_gen по макету `/nextjs-page-concept.png`, затем сохранены в PNG и перекодированы в WebP с quality 85. Это отдельные иллюстрации по референсу, а не точные пиксельные вырезки. SVG созданы как отдельные векторные ресурсы в стиле макета.

### Промпты фоновых изображений

**section-background**

Use the attached website concept as a style reference. Create only a reusable background texture for its middle content sections, landscape 1536x1024 composition. Deep near-black blue (#061219), faint atmospheric blue glass reflections and soft abstract diagonal technical structures along the outer edges, very sparse subdued lime light accents at the extreme right edge. Central 75 percent remains dark, quiet, unobstructed for readable webpage text and cards. Seamless-looking soft dark edges suitable for blending into solid navy. No letter N, no objects, no panels, no icons, no typography, no charts, no UI. Faithfully match the subtle background beneath the middle sections of the reference, low contrast and restrained.

**contact-background**

Use the attached website concept as style reference. Create only the landscape background artwork beneath its contact and footer area: near-black navy technological space, glossy dark reflective floor in lower third, fine diagonal lime yellow light trails crossing mainly on right third, sparse small lime light points and out-of-focus glass structural reflections at right edge. Left two thirds dark and quiet for a heading and form overlay. Fade all perimeter edges toward #061219 for webpage blending. Landscape 1536x1024. No N block, no text, no logo, no icons, no cards, no chat window, no buttons. Match the original footer background material and restrained neon lighting.

