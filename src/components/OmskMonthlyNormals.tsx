import React, { useMemo, useState } from "react";
import { MONTHS_SHORT, monthlyNormals } from "../data/omskWeather";

/**
 * Годовой ход по двум тридцатилетним нормам: 1941—1970 против 1996—2025.
 * Пустая точка — старая норма, закрашенная — новая, отрезок между ними — сдвиг.
 * Снизу тем же порядком идут столбики разницы, чтобы было видно, какой месяц уехал дальше всех.
 */

type MetricKey = "mean" | "min" | "max" | "precip";

type Metric = {
  key: MetricKey;
  col: number;
  tab: string;
  label: string;
  unit: string;
  digits: number;
  hueUp: number;
  hueDown: number;
};

const METRICS: Metric[] = [
  { key: "mean", col: 0, tab: "средняя", label: "Средняя температура месяца", unit: "°C", digits: 1, hueUp: 30, hueDown: 245 },
  { key: "min", col: 1, tab: "ночь", label: "Средний ночной минимум", unit: "°C", digits: 1, hueUp: 30, hueDown: 245 },
  { key: "max", col: 2, tab: "день", label: "Средний дневной максимум", unit: "°C", digits: 1, hueUp: 30, hueDown: 245 },
  { key: "precip", col: 3, tab: "осадки", label: "Осадки за месяц", unit: "мм", digits: 0, hueUp: 220, hueDown: 75 },
];

const W = 760;
const H = 300;
const PAD = { top: 14, right: 12, bottom: 96, left: 46 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const DELTA_TOP = H - 62;
const DELTA_H = 46;

const fmt = (v: number, digits: number) =>
  v.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace("-", "−");
const signed = (v: number, digits: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), digits);

const OmskMonthlyNormals: React.FC = () => {
  const [metricKey, setMetricKey] = useState<MetricKey>("mean");
  const [hover, setHover] = useState<number | null>(null);
  const metric = METRICS.find((m) => m.key === metricKey)!;

  const { old, now, deltas, min, max, maxAbsDelta } = useMemo(() => {
    const oldV = monthlyNormals.p1.map((r) => r[metric.col]);
    const nowV = monthlyNormals.p2.map((r) => r[metric.col]);
    const d = nowV.map((v, i) => v - oldV[i]);
    const all = [...oldV, ...nowV];
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const span = hi - lo || 1;
    return {
      old: oldV,
      now: nowV,
      deltas: d,
      min: lo - span * 0.1,
      max: hi + span * 0.1,
      maxAbsDelta: Math.max(...d.map(Math.abs)),
    };
  }, [metric]);

  const x = (m: number) => PAD.left + ((m + 0.5) / 12) * PLOT_W;
  const y = (v: number) => PAD.top + PLOT_H - ((v - min) / (max - min)) * PLOT_H;
  const colW = PLOT_W / 12;

  const ticks = useMemo(() => {
    const raw = (max - min) / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) ?? mag * 10;
    const out: number[] = [];
    for (let t = Math.ceil(min / step) * step; t <= max; t += step) out.push(Number(t.toFixed(6)));
    return out;
  }, [min, max]);

  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const band =
    line(old) +
    now
      .map((v, i) => `L${x(now.length - 1 - i).toFixed(1)} ${y(now[now.length - 1 - i]).toFixed(1)}`)
      .join("") +
    "Z";

  const shift = (d: number) => `oklch(63% 0.15 ${d >= 0 ? metric.hueUp : metric.hueDown})`;

  const pick = (clientX: number, target: SVGSVGElement) => {
    const box = target.getBoundingClientRect();
    const rel = ((clientX - box.left) / box.width) * W;
    const m = Math.floor(((rel - PAD.left) / PLOT_W) * 12);
    setHover(Math.min(11, Math.max(0, m)));
  };

  const leader = deltas.indexOf(Math.max(...deltas));

  return (
    <figure className="wx" role="group" aria-label={`${metric.label}: норма 1941—1970 против 1996—2025`}>
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
          {hover !== null ? (
            <>
              <b>{MONTHS_SHORT[hover]}</b> — {fmt(old[hover], metric.digits)} → {fmt(now[hover], metric.digits)}{" "}
              {metric.unit}
              <span className="wx__delta">{signed(deltas[hover], metric.digits === 0 ? 0 : 1)} {metric.unit}</span>
            </>
          ) : (
            <span className="wx__hint">
              сильнее всех сдвинулся {MONTHS_SHORT[leader]}: {signed(deltas[leader], metric.digits === 0 ? 0 : 1)}{" "}
              {metric.unit}
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="wx__svg"
        onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
        onPointerDown={(e) => pick(e.clientX, e.currentTarget)}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="wx__grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="wx__axis" x={PAD.left - 7} y={y(t) + 3.5} textAnchor="end">
              {metric.key === "precip" ? fmt(t, 0) : signed(t, 0)}
            </text>
          </g>
        ))}

        {hover !== null && (
          <rect className="wx__col" x={PAD.left + hover * colW} y={PAD.top} width={colW} height={PLOT_H} />
        )}

        <path className="wx__band" d={band} />
        <path className="wx__old" d={line(old)} />
        <path className="wx__new" d={line(now)} />

        {deltas.map((d, i) => (
          <line
            key={`s${i}`}
            x1={x(i)}
            x2={x(i)}
            y1={y(old[i])}
            y2={y(now[i])}
            stroke={shift(d)}
            strokeWidth={hover === i ? 6 : 4}
            strokeLinecap="round"
            opacity={0.75}
          />
        ))}
        {old.map((v, i) => (
          <circle key={`o${i}`} className="wx__dot-old" cx={x(i)} cy={y(v)} r={4} />
        ))}
        {now.map((v, i) => (
          <circle key={`n${i}`} className="wx__dot-new" cx={x(i)} cy={y(v)} r={4.5} fill={shift(deltas[i])} />
        ))}

        {MONTHS_SHORT.map((m, i) => (
          <text
            key={m}
            className={hover === i ? "wx__axis is-hover" : "wx__axis"}
            x={x(i)}
            y={PAD.top + PLOT_H + 16}
            textAnchor="middle"
          >
            {m}
          </text>
        ))}

        <line className="wx__grid" x1={PAD.left} x2={W - PAD.right} y1={DELTA_TOP} y2={DELTA_TOP} />
        <text className="wx__axis" x={PAD.left - 7} y={DELTA_TOP + 4} textAnchor="end">
          0
        </text>
        {deltas.map((d, i) => {
          const h = (Math.abs(d) / maxAbsDelta) * DELTA_H;
          return (
            <g key={`d${i}`}>
              <rect
                x={x(i) - colW * 0.28}
                y={d >= 0 ? DELTA_TOP : DELTA_TOP - h}
                width={colW * 0.56}
                height={h}
                fill={shift(d)}
                opacity={hover === null || hover === i ? 0.9 : 0.45}
              />
              <text
                className="wx__bar-label"
                x={x(i)}
                y={d >= 0 ? DELTA_TOP + h + 13 : DELTA_TOP - h - 5}
                textAnchor="middle"
              >
                {signed(d, metric.digits === 0 ? 0 : 1)}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="wx__legend">
        <span className="wx__key wx__key--old">1941—1970</span>
        <span className="wx__key wx__key--new">1996—2025</span>
        <span className="wx__key">снизу — разница между нормами</span>
      </figcaption>
    </figure>
  );
};

export default OmskMonthlyNormals;
