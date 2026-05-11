import React from "react";
import { Entry } from "../data/entries";

type Props = {
  year: number;
  entries: Entry[];
  onYearStep: (delta: number) => void;
  onSlug: (slug: string) => void;
};

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function pluralize(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
  return forms[2];
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const Calendar: React.FC<Props> = ({ year, entries, onYearStep, onSlug }) => {
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() - start.getDay());

  const cell = 10;
  const gap = 2;
  const stride = cell + gap;
  const cols = 53;
  const rows = 7;
  const mh = 16;
  const w = cols * stride;
  const h = mh + rows * stride;

  const byDate: Record<string, Entry[]> = {};
  entries.forEach((e) => {
    if (!e.date) return;
    (byDate[e.date] = byDate[e.date] || []).push(e);
  });

  const rects: React.ReactNode[] = [];
  let postCount = 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const d = new Date(start);
      d.setDate(start.getDate() + c * 7 + r);
      if (d.getFullYear() !== year) continue;
      const iso = isoDate(d);
      const items = byDate[iso];
      const x = c * stride;
      const y = mh + r * stride;
      if (items) postCount += items.length;
      const cls = items ? "cal-rect has-post" : "cal-rect";
      const article = items?.find((it) => it.type === "article") as
        | { type: "article"; slug: string }
        | undefined;
      const talk = items?.find((it) => it.type === "talk" && "url" in it && it.url) as
        | { type: "talk"; url?: string }
        | undefined;
      const tip = items ? items.map((it) => `${iso} — ${it.title}`).join("\n") : iso;
      const handler = () => {
        if (article) onSlug(article.slug);
        else if (talk?.url) window.open(talk.url, "_blank", "noopener");
      };
      rects.push(
        <rect
          key={`${c}-${r}`}
          x={x}
          y={y}
          width={cell}
          height={cell}
          rx={2}
          className={cls}
          onClick={items ? handler : undefined}
        >
          <title>{tip}</title>
        </rect>
      );
    }
  }

  const labels: React.ReactNode[] = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    const diff = Math.floor((d.getTime() - start.getTime()) / 86400000);
    const col = Math.floor(diff / 7);
    labels.push(
      <text key={m} x={col * stride} y={10} className="cal-month">
        {MONTHS[m]}
      </text>
    );
  }

  const summary = `${postCount} ${pluralize(postCount, ["запись", "записи", "записей"])}`;

  const years = entries.map((e) => parseInt(e.date.slice(0, 4), 10));
  const currentYear = new Date().getFullYear();
  const minYear = Math.min(...years, currentYear);
  const maxYear = currentYear;

  return (
    <div className="cal-wrap">
      <div className="cal-head">
        <span className="cal-nav">
          <button
            onClick={() => onYearStep(-1)}
            disabled={year <= minYear}
            aria-label="Предыдущий год"
          >
            ←
          </button>
          <span className="y">{year}</span>
          <button
            onClick={() => onYearStep(1)}
            disabled={year >= maxYear}
            aria-label="Следующий год"
          >
            →
          </button>
        </span>
        <span>{summary}</span>
      </div>
      <div className="calendar">
        <svg
          className="cal-svg"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMinYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {labels}
          {rects}
        </svg>
      </div>
    </div>
  );
};

export default Calendar;
