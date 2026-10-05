"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/documents/page.module.scss";

export default function DocumentActions({ href, title }: { href: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const pending = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = window.setTimeout(() => {
      pending.current = false;
      setLoading(false);
      setHint(true);
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [loading]);

  function printDocument() {
    pending.current = false;
    setLoading(false);
    setHint(true);
    try {
      frame.current?.contentWindow?.focus();
      frame.current?.contentWindow?.print();
    } catch {
      // Some browsers only support printing PDFs from their own viewer.
    }
  }

  function requestPrint() {
    if (ready.current) {
      printDocument();
      return;
    }
    pending.current = true;
    setLoading(true);
    setMounted(true);
  }

  return <div className={styles.documentActions}>
    <a className={styles.cardButton} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Посмотреть: ${title} (в новой вкладке)`}>
      Посмотреть PDF <span aria-hidden="true">↗</span>
    </a>
    <div className={styles.documentSecondaryActions}>
      <button className={styles.cardButton} type="button" onClick={requestPrint} disabled={loading} aria-label={`Распечатать: ${title}`}>
        {loading ? "Загрузка…" : "Распечатать"}
      </button>
      <a className={styles.cardButton} href={href} download aria-label={`Скачать: ${title} (PDF)`}>Скачать <span aria-hidden="true">↓</span></a>
    </div>
    {hint && <p className={styles.printHint} role="status">Если окно печати не открылось, <a href={href} target="_blank" rel="noopener noreferrer">откройте PDF</a> и выберите печать в просмотрщике.</p>}
    {mounted && <iframe
      ref={frame}
      src={href}
      title={`Подготовка к печати: ${title}`}
      className={styles.printFrame}
      aria-hidden="true"
      tabIndex={-1}
      onLoad={() => {
        ready.current = true;
        if (pending.current) printDocument();
      }}
      onError={() => {
        pending.current = false;
        setLoading(false);
        setHint(true);
      }}
    />}
  </div>;
}
