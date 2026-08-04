import React, { useEffect, useRef, useState } from "react";

/**
 * Braille cell dots, indexed [column][row]:
 *   1 4
 *   2 5
 *   3 6
 *   7 8
 */
const DOT_BITS = [
  [0x01, 0x02, 0x04, 0x40],
  [0x08, 0x10, 0x20, 0x80],
];

/** Превращает ASCII-маску ('#' — точка) в строки braille-символов. */
function toBraille(mask: string[]): string[] {
  const width = Math.max(...mask.map((row) => row.length));
  const lines: string[] = [];
  for (let y = 0; y < mask.length; y += 4) {
    let line = "";
    for (let x = 0; x < width; x += 2) {
      let bits = 0;
      for (let dx = 0; dx < 2; dx += 1) {
        for (let dy = 0; dy < 4; dy += 1) {
          if ((mask[y + dy] || "")[x + dx] === "#") bits |= DOT_BITS[dx][dy];
        }
      }
      line += String.fromCharCode(0x2800 + bits);
    }
    lines.push(line);
  }
  return lines;
}

type Species = {
  /** ширина/высота тела в точках */
  w: number;
  h: number;
  /** правая граница хвоста-веера */
  tail: number;
  /** острота носа: меньше — вытянутее */
  power: number;
  /** размах волны по телу, в точках */
  amp: number;
  /** глаз: [x, смещение по вертикали от оси] */
  eye: [number, number];
};

/**
 * Сдвиг осевой линии в колонке x: волна бежит от головы к хвосту.
 * Степень 2.4 держит голову почти неподвижной — гребёт в основном хвост.
 */
function spine(s: Species, x: number, phase: number): number {
  const k = (s.w - 1 - x) / (s.w - 1);
  return s.amp * Math.pow(k, 2.4) * Math.sin(phase + k * Math.PI * 1.8);
}

/** Один кадр рыбки: тело-эллипс + веер-хвост, изогнутые бегущей волной. */
function fishFrame(s: Species, phase: number): string {
  // высота кратна 4 (строке braille) и с запасом на размах волны
  const height = Math.ceil((s.h + 2 * s.amp) / 4) * 4;
  const axis = (height - 1) / 2;
  const cx = (s.tail + s.w - 1) / 2;
  const rx = (s.w - 1 - s.tail) / 2;
  const ry = s.h / 2;

  const rows: string[] = [];
  for (let y = 0; y < height; y += 1) {
    let row = "";
    for (let x = 0; x < s.w; x += 1) {
      const cy = axis + spine(s, x, phase);
      let half = -1;
      if (x >= s.tail) {
        const t = (x - cx) / rx;
        if (Math.abs(t) <= 1) half = ry * Math.pow(1 - t * t, s.power);
      }
      if (half < 0 && x <= s.tail) half = (ry + 0.5) * (1 - x / (s.tail + 0.4));
      row += half >= 0 && Math.abs(y - cy) <= half ? "#" : ".";
    }
    rows.push(row);
  }

  // глаз — дырка 2×2, едет вместе с осевой линией
  const [ex, eyeOffset] = s.eye;
  const eyeTop = Math.round(axis + spine(s, ex, phase) + eyeOffset);
  for (let dy = 0; dy < 2; dy += 1) {
    for (let dx = 0; dx < 2; dx += 1) {
      const row = rows[eyeTop + dy];
      if (row) rows[eyeTop + dy] = row.slice(0, ex + dx) + "." + row.slice(ex + dx + 1);
    }
  }

  return toBraille(rows).join("\n");
}

const FRAME_COUNT = 8;

function fishFrames(s: Species): string[] {
  return Array.from({ length: FRAME_COUNT }, (_, i) =>
    fishFrame(s, (i / FRAME_COUNT) * Math.PI * 2)
  );
}

const CLASSIC = fishFrames({ w: 24, h: 11, tail: 5, power: 0.55, amp: 2.0, eye: [18, -2] });
const LONG = fishFrames({ w: 30, h: 7, tail: 7, power: 0.35, amp: 2.4, eye: [23, -1] });
const PLUMP = fishFrames({ w: 16, h: 11, tail: 3, power: 0.85, amp: 1.4, eye: [11, -2] });
const TINY = fishFrames({ w: 12, h: 5, tail: 3, power: 0.5, amp: 1.1, eye: [9, -1] });

/** Рыбка для кнопки в топбаре — одна строка braille. */
export const MINI_FISH = toBraille([
  "#...####..",
  "##.####.#.",
  "##.######.",
  "#...####..",
])[0];

type Swimmer = {
  frames: string[];
  /** кегль в px — он же задаёт размер рыбки */
  size: number;
  /** px в секунду */
  speed: number;
  /** взмахов хвостом в секунду */
  beat: number;
  /** максимальный наклон, рад */
  pitchMax: number;
  /** мелкое рыскание вверх-вниз */
  wander: number;
  /** скорость обхода толщи воды сверху донизу, рад/с */
  depth: number;
  phase: number;
  opacity: number;
  /** стартовая точка в долях экрана */
  x0: number;
  y0: number;
  dir: 1 | -1;
  /** сдвиг фазы радуги, с */
  hue: number;
};

const SWIMMERS: Swimmer[] = [
  { frames: CLASSIC, size: 16, speed: 46, beat: 2.6, pitchMax: 0.36, wander: 0.42, depth: 0.09, phase: 0.0, opacity: 1.0, x0: 0.15, y0: 0.35, dir: 1, hue: 0 },
  { frames: LONG, size: 13, speed: 66, beat: 3.4, pitchMax: 0.28, wander: 0.63, depth: 0.12, phase: 1.7, opacity: 0.92, x0: 0.7, y0: 0.68, dir: -1, hue: -1.8 },
  { frames: PLUMP, size: 12, speed: 32, beat: 2.0, pitchMax: 0.42, wander: 0.33, depth: 0.075, phase: 3.1, opacity: 0.88, x0: 0.45, y0: 0.15, dir: 1, hue: -3.4 },
  { frames: TINY, size: 11, speed: 78, beat: 4.6, pitchMax: 0.52, wander: 0.95, depth: 0.16, phase: 4.4, opacity: 0.8, x0: 0.85, y0: 0.5, dir: -1, hue: -4.9 },
  { frames: CLASSIC, size: 9, speed: 24, beat: 1.7, pitchMax: 0.3, wander: 0.25, depth: 0.085, phase: 5.6, opacity: 0.5, x0: 0.3, y0: 0.82, dir: 1, hue: -2.6 },
];

/** Детерминированный PRNG — чтобы пузыри были разными, но стабильными. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const BUBBLE_CHARS = ["⠂", "⠄", "⠈", "⠐", "⠠", "⡀", "⠁", "⢀"];

const BUBBLES = (() => {
  const rand = rng(20260804);
  return Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: rand() * 98,
    char: BUBBLE_CHARS[Math.floor(rand() * BUBBLE_CHARS.length)],
    size: 9 + rand() * 8,
    duration: 5 + rand() * 9,
    delay: rand() * 9,
    drift: (rand() * 2 - 1) * 26,
    opacity: 0.3 + rand() * 0.5,
  }));
})();

const DRAIN_MS = 1200;

const Aquarium: React.FC<{ active: boolean }> = ({ active }) => {
  const [mounted, setMounted] = useState(active);
  const [filled, setFilled] = useState(false);
  const fishRefs = useRef<Array<HTMLDivElement | null>>([]);
  const artRefs = useRef<Array<HTMLPreElement | null>>([]);

  useEffect(() => {
    if (active) {
      setMounted(true);
      // два кадра, чтобы браузер увидел height: 0 до перехода
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setFilled(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setFilled(false);
    const id = window.setTimeout(() => setMounted(false), DRAIN_MS);
    return () => window.clearTimeout(id);
  }, [active]);

  useEffect(() => {
    if (!mounted) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = SWIMMERS.map((s) => ({
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      pitch: 0,
      /** плавно едет к ±1: на нуле рыбка повёрнута ребром — это и есть разворот */
      face: s.dir as number,
      dir: s.dir as number,
      frame: -1,
    }));

    const measure = () => {
      state.forEach((st, i) => {
        const el = fishRefs.current[i];
        if (!el) return;
        st.w = el.offsetWidth;
        st.h = el.offsetHeight;
        st.x = Math.min(Math.max(SWIMMERS[i].x0 * window.innerWidth, 0), window.innerWidth - st.w);
        st.y = Math.min(Math.max(SWIMMERS[i].y0 * window.innerHeight, 0), window.innerHeight - st.h);
      });
    };
    measure();

    const draw = (i: number) => {
      const el = fishRefs.current[i];
      const st = state[i];
      if (!el) return;
      const sign = st.face >= 0 ? 1 : -1;
      // корпус наклоняется заметно меньше траектории — иначе читается как штрих, а не рыбка
      const deg = (st.pitch * 0.62 * sign * 180) / Math.PI;
      el.style.transform = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0) scaleX(${st.face.toFixed(3)}) rotate(${deg.toFixed(1)}deg)`;
    };

    if (reduced) {
      state.forEach((_, i) => draw(i));
      return;
    }

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = 0;
    let t = 0;

    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      SWIMMERS.forEach((s, i) => {
        const st = state[i];
        if (!st.w) return;

        // рыбка неспешно обходит толщу воды: цель по глубине ползёт от поверхности ко дну
        const swim = Math.max(20, vh - st.h - 20);
        const targetY = 10 + swim * (0.5 + 0.5 * Math.sin(t * s.depth + s.phase * 1.3));
        const seek = Math.max(-1, Math.min(1, (targetY - st.y) / 120));

        // плюс мелкое рыскание двумя несинхронными волнами — чтобы не читался чистый синус
        const wobble =
          (Math.sin(t * s.wander + s.phase) * 0.65 +
            Math.sin(t * s.wander * 0.43 + s.phase * 2.1) * 0.35) *
          s.pitchMax *
          0.4;

        const limit = s.pitchMax * 1.2;
        let target = Math.max(-limit, Math.min(limit, seek * s.pitchMax + wobble));

        // у краёв по вертикали разворачиваем нос обратно в толщу воды
        const margin = 70;
        if (st.y < margin) target = Math.max(target, s.pitchMax * 0.9);
        if (st.y > vh - st.h - margin) target = Math.min(target, -s.pitchMax * 0.9);
        st.pitch += (target - st.pitch) * Math.min(1, dt * 2.4);

        st.x += st.dir * s.speed * Math.cos(st.pitch) * dt;
        st.y += s.speed * Math.sin(st.pitch) * dt;

        // до бортов доплываем почти вплотную и поворачиваем
        if (st.x < -st.w * 0.15) {
          st.x = -st.w * 0.15;
          st.dir = 1;
        } else if (st.x > vw - st.w * 0.85) {
          st.x = vw - st.w * 0.85;
          st.dir = -1;
        }
        st.y = Math.min(Math.max(st.y, 2), Math.max(2, vh - st.h - 2));

        // разворот не мгновенный: face проходит через 0 — рыбка поворачивается ребром
        st.face += (st.dir - st.face) * Math.min(1, dt * 3.2);

        // взмах хвостом ускоряется на поворотах
        const frame = Math.floor(t * s.beat * FRAME_COUNT + s.phase) % FRAME_COUNT;
        if (frame !== st.frame) {
          st.frame = frame;
          const art = artRefs.current[i];
          if (art) art.textContent = s.frames[frame];
        }

        draw(i);
      });

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className={`aquarium${filled ? " aquarium--filled" : ""}`} aria-hidden="true">
      <div className="aquarium__water">
        <svg className="aquarium__wave" viewBox="0 0 240 20" preserveAspectRatio="none">
          <path d="M0 12 Q 15 2 30 12 T 60 12 T 90 12 T 120 12 T 150 12 T 180 12 T 210 12 T 240 12 V 20 H 0 Z" />
        </svg>
        {BUBBLES.map((b) => (
          <span
            key={b.id}
            className="aquarium__bubble"
            style={{
              left: `${b.left}%`,
              fontSize: `${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              ["--aq-drift" as string]: `${b.drift}px`,
              ["--aq-op" as string]: b.opacity,
            }}
          >
            {b.char}
          </span>
        ))}
      </div>

      {SWIMMERS.map((s, i) => (
        <div
          key={i}
          className="aquarium__swimmer"
          ref={(el) => {
            fishRefs.current[i] = el;
          }}
          style={{ opacity: filled ? s.opacity : 0, transitionDelay: `${0.6 + i * 0.18}s` }}
        >
          <pre
            className="aquarium__fish"
            ref={(el) => {
              artRefs.current[i] = el;
            }}
            style={{ fontSize: `${s.size}px`, animationDelay: `${s.hue}s` }}
          >
            {s.frames[0]}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default Aquarium;
