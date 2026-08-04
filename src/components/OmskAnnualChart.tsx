import React, { useMemo, useState } from "react";
import { annual, movingAverage, ols } from "../data/omskWeather";

/**
 * Годовой ряд станции Омск, 1916—2025. Столбик — отклонение года от нормы
 * 1941—1970, поверх — скользящее среднее за 11 лет и линия тренда с 1940 года.
 * Переключатель метрики: год / зима / лето / осадки.
 */

type MetricKey = "mean" | "winter" | "summer" | "precip";

type Metric = {
  key: MetricKey;
  col: number;
  tab: string;
  label: string;
  unit: string;
  digits: number;
  /** С какого года считаем тренд. Зима 1940 года — это ещё декабрь 1939-го, поэтому она не в счёт. */
  trendFrom: number;
  hueUp: number;
  hueDown: number;
  upWord: string;
  downWord: string;
};

const METRICS: Metric[] = [
  { key: "mean", col: 1, tab: "год", label: "Средняя за год", unit: "°C", digits: 2, trendFrom: 1940, hueUp: 30, hueDown: 245, upWord: "теплее нормы", downWord: "холоднее нормы" },
  { key: "winter", col: 2, tab: "зима", label: "Зима (декабрь—февраль)", unit: "°C", digits: 2, trendFrom: 1941, hueUp: 30, hueDown: 245, upWord: "теплее нормы", downWord: "холоднее нормы" },
  { key: "summer", col: 3, tab: "лето", label: "Лето (июнь—август)", unit: "°C", digits: 2, trendFrom: 1940, hueUp: 30, hueDown: 245, upWord: "теплее нормы", downWord: "холоднее нормы" },
  { key: "precip", col: 4, tab: "осадки", label: "Осадки за год", unit: "мм", digits: 0, trendFrom: 1940, hueUp: 220, hueDown: 75, upWord: "мокрее нормы", downWord: "суше нормы" },
];

const W = 760;
const H = 250;
const PAD = { top: 14, right: 6, bottom: 20, left: 46 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const FIRST = annual[0][0];
const LAST = annual[annual.length - 1][0];
const SMOOTH = 11;

const fmt = (v: number, digits: number) =>
  v.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace("-", "−");

const signed = (v: number, digits: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), digits);

const OmskAnnualChart: React.FC = () => {
  const [metricKey, setMetricKey] = useState<MetricKey>("mean");
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const metric = METRICS.find((m) => m.key === metricKey)!;

  const view = useMemo(() => {
    const values = annual.map((r) => r[metric.col] as number | null);
    const norm =
      annual
        .filter((r) => r[0] >= 1941 && r[0] <= 1970 && r[metric.col] !== null)
        .reduce((s, r) => s + (r[metric.col] as number), 0) / 30;

    const smooth = movingAverage(values, SMOOTH);
    const trendPts = annual
      .map((r, i) => [r[0], values[i]] as [number, number | null])
      .filter((p): p is [number, number] => p[1] !== null && p[0] >= metric.trendFrom);
    const trend = ols(trendPts);

    const anomalies = values.map((v) => (v === null ? null : v - norm));
    const present = anomalies.filter((v): v is number => v !== null);
    const smoothAnom = smooth.map((v) => (v === null ? null : v - norm));
    const lo = Math.min(...present, ...smoothAnom.filter((v): v is number => v !== null));
    const hi = Math.max(...present, ...smoothAnom.filter((v): v is number => v !== null));
    const span = hi - lo;
    const min = lo - span * 0.08;
    const max = hi + span * 0.08;

    return { values, norm, smooth, trend, anomalies, min, max };
  }, [metric]);

  const { values, norm, smooth, trend, anomalies, min, max } = view;

  const x = (year: number) => PAD.left + ((year - FIRST + 0.5) / (LAST - FIRST + 1)) * PLOT_W;
  const y = (v: number) => PAD.top + PLOT_H - ((v - min) / (max - min)) * PLOT_H;
  const barW = Math.max(2, (PLOT_W / (LAST - FIRST + 1)) * 0.78);

  const ticks = useMemo(() => {
    const raw = (max - min) / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) ?? mag * 10;
    const out: number[] = [];
    for (let t = Math.ceil(min / step) * step; t <= max; t += step) out.push(Number(t.toFixed(6)));
    return out;
  }, [min, max]);

  const smoothPath = useMemo(() => {
    let d = "";
    let open = false;
    smooth.forEach((v, i) => {
      if (v === null) {
        open = false;
        return;
      }
      const px = x(annual[i][0]);
      const py = y(v - norm);
      d += `${open ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`;
      open = true;
    });
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smooth, norm, min, max]);

  const hoverIdx = hoverYear === null ? -1 : hoverYear - FIRST;
  const hoverValue = hoverIdx >= 0 ? values[hoverIdx] : null;
  const hoverAnom = hoverIdx >= 0 ? anomalies[hoverIdx] : null;

  const pick = (clientX: number, target: SVGSVGElement) => {
    const box = target.getBoundingClientRect();
    const rel = ((clientX - box.left) / box.width) * W;
    const year = Math.round(FIRST + ((rel - PAD.left) / PLOT_W) * (LAST - FIRST + 1) - 0.5);
    setHoverYear(Math.min(LAST, Math.max(FIRST, year)));
  };

  const barColor = (a: number) => {
    const scale = Math.max(...anomalies.map((v) => (v === null ? 0 : Math.abs(v)))) || 1;
    const alpha = 0.3 + 0.7 * Math.min(1, Math.abs(a) / scale);
    return `oklch(63% 0.15 ${a >= 0 ? metric.hueUp : metric.hueDown} / ${alpha.toFixed(2)})`;
  };

  return (
    <figure className="wx" role="group" aria-label={`График: ${metric.label}, Омск, 1916—2025`}>
      <div className="wx__head">
        <div className="wx__tabs" role="tablist" aria-label="Что показать">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={m.key === metricKey}
              className={m.key === metricKey ? "is-active" : ""}
              onClick={() => setMetricKey(m.key)}
            >
              {m.tab}
            </button>
          ))}
        </div>
        <div className="wx__readout" aria-live="polite">
          {hoverYear !== null && hoverValue !== null && hoverAnom !== null ? (
            <>
              <b>{hoverYear}</b> — {fmt(hoverValue, metric.digits)} {metric.unit}
              <span className="wx__delta">
                {signed(hoverAnom, metric.digits)} {metric.unit} {hoverAnom >= 0 ? metric.upWord : metric.downWord}
              </span>
            </>
          ) : hoverYear !== null ? (
            <>
              <b>{hoverYear}</b> — <span className="wx__delta">данных нет</span>
            </>
          ) : (
            <span className="wx__hint">наведите на график</span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="wx__svg"
        onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
        onPointerDown={(e) => pick(e.clientX, e.currentTarget)}
        onPointerLeave={() => setHoverYear(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="wx__grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="wx__axis" x={PAD.left - 7} y={y(t) + 3.5} textAnchor="end">
              {signed(t, metric.digits === 0 ? 0 : 1)}
            </text>
          </g>
        ))}

        {[1930, 1950, 1970, 1990, 2010].map((yr) => (
          <text key={yr} className="wx__axis" x={x(yr)} y={H - 5} textAnchor="middle">
            {yr}
          </text>
        ))}

        {annual.map((row, i) => {
          const a = anomalies[i];
          if (a === null) return null;
          const top = Math.min(y(a), y(0));
          const height = Math.max(1, Math.abs(y(a) - y(0)));
          return (
            <rect
              key={row[0]}
              x={x(row[0]) - barW / 2}
              y={top}
              width={barW}
              height={height}
              fill={barColor(a)}
              className={hoverYear === row[0] ? "wx__bar is-hover" : "wx__bar"}
            />
          );
        })}

        <line className="wx__zero" x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} />
        <line
          className="wx__trend"
          x1={x(metric.trendFrom)}
          x2={x(LAST)}
          y1={y(trend.at(metric.trendFrom) - norm)}
          y2={y(trend.at(LAST) - norm)}
        />
        <path className="wx__smooth" d={smoothPath} />

        {hoverYear !== null && (
          <line className="wx__cursor" x1={x(hoverYear)} x2={x(hoverYear)} y1={PAD.top} y2={PAD.top + PLOT_H} />
        )}
      </svg>

      <figcaption className="wx__legend">
        <span
          className="wx__key wx__key--bars"
          style={
            {
              "--k-up": `oklch(63% 0.15 ${metric.hueUp})`,
              "--k-down": `oklch(63% 0.15 ${metric.hueDown})`,
            } as React.CSSProperties
          }
        >
          столбик — отклонение года от нормы
        </span>
        <span className="wx__key wx__key--zero">
          норма 1941—1970: {fmt(norm, metric.digits)} {metric.unit}
        </span>
        <span className="wx__key wx__key--smooth">линия — среднее за 11 лет</span>
        <span className="wx__key wx__key--trend">
          пунктир — тренд с {metric.trendFrom}: {signed(trend.perDecade, metric.digits === 0 ? 0 : 2)} {metric.unit} за
          10 лет
        </span>
      </figcaption>
    </figure>
  );
};

export default OmskAnnualChart;
