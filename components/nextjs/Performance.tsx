import styles from "@/app/nextjs/page.module.scss";

const vitals = [
  { name: "LCP", label: "Загрузка контента", target: "до 2,5 с", width: "74%" },
  { name: "INP", label: "Отклик интерфейса", target: "до 200 мс", width: "66%" },
  { name: "CLS", label: "Стабильность макета", target: "до 0,1", width: "62%" },
];

export default function Performance() {
  return (
    <div className={styles.performanceGrid}>
      <article className={styles.performanceCard}>
        <h3>Core Web Vitals</h3>
        <p>Быстрая загрузка, отзывчивый интерфейс<br />и стабильный макет.</p>
        <div className={styles.vitals}>
          {vitals.map(({ name, label, target, width }) => (
            <div className={styles.vital} key={name}>
              <h4>{name}</h4>
              <p>{label}</p>
              <div className={styles.vitalTrack} aria-hidden="true"><span style={{ width }} /></div>
              <span className={styles.vitalTarget}><i aria-hidden="true" />{target}</span>
            </div>
          ))}
        </div>
        <p className={styles.metricNote}>Целевые значения. Результат проверяется на готовом сайте.</p>
      </article>
      <figure className={styles.performanceCard}>
        <div className={styles.chartHeading}>
          <div><h3>Меньше ожидания. Больше действий.</h3><p>Рендеринг и кэширование помогают<br />сократить время загрузки.</p></div>
          <div className={styles.chartLegend}><span><i />После оптимизации</span><span><i />До оптимизации</span></div>
        </div>
        <svg className={styles.chart} viewBox="0 0 540 178" role="img" aria-labelledby="loading-chart-title loading-chart-description">
          <title id="loading-chart-title">Иллюстрация оптимизации загрузки</title>
          <desc id="loading-chart-description">Условные линии показывают, как последовательные оптимизации могут сократить время ожидания. Это схема, а не данные измерений.</desc>
          <defs>
            <linearGradient id="nextjs-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#D4FF00" stopOpacity=".16" /><stop offset="1" stopColor="#D4FF00" stopOpacity="0" /></linearGradient>
          </defs>
          <g stroke="#29404D" strokeOpacity=".6" strokeWidth="1">
            {[18, 52, 86, 120, 154].map(y => <path d={`M32 ${y}H528`} key={`h${y}`} />)}
            {[32, 156, 280, 404, 528].map(x => <path d={`M${x} 18V154`} key={`v${x}`} />)}
          </g>
          <path d="M32 69 56 81 80 85 104 98 128 94 152 109 176 114 200 121 224 118 248 127 272 129 296 127 320 133 344 132 368 136 392 134 416 137 440 135 464 137 488 135 512 135 528 134V154H32Z" fill="url(#nextjs-chart-fill)" />
          <path d="m32 36 24 10 24-6 24 15 24 5 24 13 24-4 24 9 24-7 24 12 24 9 24 6 24-4 24 7 24-5 24 6 24-4 24 8 24-7 24 6 24-4 16 4" fill="none" stroke="#A5B5C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m32 69 24 12 24 4 24 13 24-4 24 15 24 5 24 7 24-3 24 9 24 2 24-2 24 6 24-1 24 4 24-2 24 3 24-2 24 2 24-2 24 0 16-1" fill="none" stroke="#D4FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <g fill="#95A8B9" fontSize="11" fontFamily="system-ui, sans-serif"><text x="32" y="174">Исходный сайт</text><text x="280" y="174" textAnchor="middle">Оптимизация</text><text x="528" y="174" textAnchor="end">Результат</text></g>
        </svg>
        <figcaption className={styles.metricNote}>Схема оптимизации, без привязки к конкретным замерам.</figcaption>
      </figure>
    </div>
  );
}
