"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config";
import type { MetrikaGoal } from "@/lib/metrika-events";

type MetrikaWindow = Window & {
  ym?: (id: number, method: string, ...args: unknown[]) => void;
};

export default function YandexMetrika({ counterId }: { counterId: number }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const previousUrl = useRef<string | null>(null);
  const initialized = useRef(false);
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (!ready) return;
    const ym = (window as MetrikaWindow).ym;
    if (!ym) return;
    if (isAdmin) {
      if (initialized.current) ym(counterId, "destruct");
      initialized.current = false;
      previousUrl.current = null;
      return;
    }
    if (!initialized.current) {
      ym(counterId, "init", {
        ssr: true,
        defer: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        referrer: document.referrer,
        url: window.location.href,
        accurateTrackBounce: true,
        trackLinks: true,
      });
      initialized.current = true;
    }
    const url = window.location.href;
    if (previousUrl.current === url) return;
    ym(counterId, "hit", url, {
      referer: previousUrl.current ?? document.referrer,
      title: document.title,
    });
    previousUrl.current = url;
  }, [counterId, pathname, ready, isAdmin]);

  useEffect(() => {
    if (!ready || isAdmin) return;
    const reachGoal = (goal: MetrikaGoal) => {
      (window as MetrikaWindow).ym?.(counterId, "reachGoal", goal);
    };
    const onGoal = (event: Event) => {
      reachGoal((event as CustomEvent<MetrikaGoal>).detail);
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.protocol === "tel:") reachGoal("phone_click");
      else if (url.protocol === "mailto:") reachGoal("email_click");
      else if (url.origin + url.pathname === siteConfig.telegram) reachGoal("telegram_click");
    };
    window.addEventListener("enot:metrika-goal", onGoal);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("enot:metrika-goal", onGoal);
      document.removeEventListener("click", onClick, true);
    };
  }, [counterId, ready, isAdmin]);

  if (isAdmin) return null;

  return (
    <>
    <Script id="yandex-metrika" strategy="afterInteractive" onReady={() => setReady(true)}>
      {`(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0];
        k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
      })(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${counterId}","ym");`}
    </Script>
    <noscript>
      <div>
        {/* Direct tracking pixel must bypass Next.js image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://mc.yandex.ru/watch/${counterId}`} style={{ position: "absolute", left: -9999 }} alt="" width="1" height="1" />
      </div>
    </noscript>
    </>
  );
}
