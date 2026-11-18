import { Palette, paletteFor, Theme } from "./palettes";

/**
 * Аквариум как «печатная» картинка: сцена рисуется на canvas клетками,
 * в каждой клетке — цветной квадратик и иногда символ. Отсюда и берётся
 * фактура пиксель-арта из типографской краски, только вместо картинки
 * мы каждый кадр заново собираем силуэты рыб из процедурных формул.
 *
 * Почему canvas, а не DOM: рыб десяток, клеток тысячи, и каждая меняет
 * цвет каждый кадр — тысячи узлов в DOM такой анимации не переживут.
 */

const CELL_WIDE = 7;
const CELL_NARROW = 5;
const NARROW_VIEWPORT = 720;
const DPR_LIMIT = 2;

/** 40 кадров в секунду хватает: вода движется плавно, а батарея целее. */
const DRAW_INTERVAL = 1000 / 40;
const MAX_DT = 0.05;
const TAU = Math.PI * 2;

/** Нижняя полоса «песка» в клетках. */
const SAND_ROWS = 3;

type Fin = { u0: number; u1: number; h: number };

type FishSpec = {
  id: string;
  /** длина тела от носа до хвостового стебля, клеток */
  len: number;
  /** максимальная полувысота тела, клеток */
  half: number;
  tailLen: number;
  tailSpread: number;
  /** глубина выемки хвоста: 0 — веер, 0.8 — глубокий лир */
  fork: number;
  dorsal?: Fin;
  anal?: Fin;
  pectoral?: { u: number; size: number };
  /** период вертикальных полос в клетках, 0 — без полос */
  stripe: number;

  eye: { u: number; v: number };
  glyphs: string;
};

const KOI: FishSpec = {
  id: "koi",
  len: 34,
  half: 7.5,
  tailLen: 15,
  tailSpread: 9,
  fork: 0.3,
  dorsal: { u0: 0.3, u1: 0.8, h: 4 },
  anal: { u0: 0.58, u1: 0.86, h: 3 },
  pectoral: { u: 0.18, size: 3.6 },
  stripe: 0,
  eye: { u: 0.16, v: -0.3 },
  glyphs: "SsxXO8%#g",
};

const GOLD: FishSpec = {
  id: "gold",
  len: 25,
  half: 8,
  tailLen: 12,
  tailSpread: 8,
  fork: 0.3,
  dorsal: { u0: 0.24, u1: 0.82, h: 4.2 },
  anal: { u0: 0.56, u1: 0.88, h: 3 },
  pectoral: { u: 0.16, size: 3 },
  stripe: 0,
  eye: { u: 0.17, v: -0.32 },
  glyphs: "StsoO8%#g",
};

const ANGEL: FishSpec = {
  id: "angel",
  len: 20,
  half: 10,
  tailLen: 9,
  tailSpread: 6.5,
  fork: 0.3,
  dorsal: { u0: 0.24, u1: 0.78, h: 6.5 },
  anal: { u0: 0.58, u1: 0.88, h: 5.5 },
  pectoral: { u: 0.2, size: 2.6 },
  stripe: 4,
  eye: { u: 0.16, v: -0.24 },
  glyphs: "XxsSt8%#",
};

const TETRA: FishSpec = {
  id: "tetra",
  len: 28,
  half: 5.5,
  tailLen: 10,
  tailSpread: 6,
  fork: 0.45,
  dorsal: { u0: 0.42, u1: 0.76, h: 2.6 },
  anal: { u0: 0.58, u1: 0.86, h: 2.2 },
  pectoral: { u: 0.17, size: 2 },
  stripe: 0,
  eye: { u: 0.15, v: -0.22 },
  glyphs: "sSxX8%o",
};

const PUFFER: FishSpec = {
  id: "puffer",
  len: 16,
  half: 7,
  tailLen: 5,
  tailSpread: 3.2,
  fork: 0.1,
  dorsal: { u0: 0.5, u1: 0.74, h: 2.2 },
  anal: { u0: 0.56, u1: 0.82, h: 1.8 },
  pectoral: { u: 0.2, size: 2.2 },
  stripe: 3,
  eye: { u: 0.2, v: -0.26 },
  glyphs: "oO8%#s",
};

const TINY: FishSpec = {
  id: "tiny",
  len: 11,
  half: 3.4,
  tailLen: 5,
  tailSpread: 2.6,
  fork: 0.4,
  pectoral: { u: 0.24, size: 1.4 },
  stripe: 0,
  eye: { u: 0.2, v: -0.2 },
  glyphs: "sx8%o",
};

/** Узкий экран: мелкая рыбка, чтобы аквариум не заслонил текст. */
const NEON: FishSpec = {
  id: "neon",
  len: 18,
  half: 4.5,
  tailLen: 7,
  tailSpread: 4.5,
  fork: 0.4,
  dorsal: { u0: 0.44, u1: 0.76, h: 2 },
  pectoral: { u: 0.2, size: 1.8 },
  stripe: 0,
  eye: { u: 0.16, v: -0.2 },
  glyphs: "sSx8%o",
};

/**
 * Полувысота тела в точке u (0 — нос, 1 — хвостовой стебель).
 * Кривая держит тело полным до последней трети и только у самого стебля
 * сходит на нет — иначе силуэт читается ромбом, а не рыбой.
 */
function bodyHalf(spec: FishSpec, u: number): number {
  const t = clamp(u, 0, 1);
  const crest = 0.3 + 0.7 * Math.sin(Math.PI * Math.pow(t, 0.9));
  const tail = 1 - 0.5 * Math.pow(Math.max(0, (t - 0.85) / 0.15), 2);
  return spec.half * crest * tail;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Детерминированный шум: один и тот же узор при каждом кадре, без мерцания. */
function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}

const tintCache = new Map<string, string>();

/** Полупрозрачный цвет; шаг альфы грубый, чтобы кэш не пух. */
function tint(hex: string, alpha: number): string {
  const a = Math.round(clamp(alpha, 0, 1) * 20) / 20;
  const key = hex + a;
  const cached = tintCache.get(key);
  if (cached) return cached;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const value = `rgba(${r},${g},${b},${a})`;
  tintCache.set(key, value);
  return value;
}

type CastEntry = {
  spec: FishSpec;
  skin: number;
  /** доля высоты, вокруг которой гуляет рыбка */
  lane: number;
  laneAmp: number;
  laneSpeed: number;
  opacity: number;
  speed: number;
  /** взмахов в секунду */
  beat: number;
  /** амплитуда изгиба тела, клеток */
  bend: number;
  dir: 1 | -1;
  /** стартовая доля ширины */
  start: number;
  phase: number;
};

const CAST: CastEntry[] = [
  { spec: KOI, skin: 4, lane: 0.24, laneAmp: 0.045, laneSpeed: 0.06, opacity: 0.92, speed: 17, beat: 0.5, bend: 1.5, dir: 1, start: 0.1, phase: 0.4 },
  { spec: GOLD, skin: 1, lane: 0.62, laneAmp: 0.075, laneSpeed: 0.09, opacity: 1, speed: 25, beat: 0.95, bend: 1.2, dir: -1, start: 0.62, phase: 2.1 },
  { spec: ANGEL, skin: 3, lane: 0.44, laneAmp: 0.06, laneSpeed: 0.07, opacity: 1, speed: 19, beat: 0.72, bend: 1.0, dir: -1, start: 0.9, phase: 3.3 },
  { spec: TETRA, skin: 2, lane: 0.78, laneAmp: 0.085, laneSpeed: 0.11, opacity: 0.95, speed: 34, beat: 1.25, bend: 0.9, dir: 1, start: 0.3, phase: 4.6 },
  { spec: PUFFER, skin: 0, lane: 0.14, laneAmp: 0.055, laneSpeed: 0.08, opacity: 1, speed: 14, beat: 0.75, bend: 0.8, dir: -1, start: 0.48, phase: 5.4 },
  { spec: TETRA, skin: 0, lane: 0.86, laneAmp: 0.045, laneSpeed: 0.13, opacity: 0.5, speed: 44, beat: 1.6, bend: 0.7, dir: -1, start: 0.95, phase: 1.3 },
  { spec: TINY, skin: 4, lane: 0.52, laneAmp: 0.035, laneSpeed: 0.16, opacity: 0.95, speed: 47, beat: 2.3, bend: 0.5, dir: 1, start: 0.4, phase: 0.9 },
  { spec: TINY, skin: 1, lane: 0.48, laneAmp: 0.04, laneSpeed: 0.15, opacity: 0.82, speed: 47, beat: 2.3, bend: 0.5, dir: 1, start: 0.44, phase: 1.4 },
  { spec: TINY, skin: 3, lane: 0.56, laneAmp: 0.038, laneSpeed: 0.17, opacity: 0.84, speed: 47, beat: 2.3, bend: 0.5, dir: 1, start: 0.48, phase: 1.9 },
];

const NARROW_CAST: CastEntry[] = [
  { spec: NEON, skin: 4, lane: 0.2, laneAmp: 0.05, laneSpeed: 0.1, opacity: 0.58, speed: 26, beat: 1.1, bend: 0.7, dir: 1, start: 0.22, phase: 0.5 },
  { spec: PUFFER, skin: 0, lane: 0.44, laneAmp: 0.05, laneSpeed: 0.08, opacity: 0.85, speed: 16, beat: 0.8, bend: 0.6, dir: -1, start: 0.72, phase: 2.2 },
  { spec: NEON, skin: 1, lane: 0.78, laneAmp: 0.05, laneSpeed: 0.12, opacity: 0.72, speed: 32, beat: 1.35, bend: 0.6, dir: 1, start: 0.36, phase: 3.4 },
  { spec: TINY, skin: 4, lane: 0.62, laneAmp: 0.04, laneSpeed: 0.15, opacity: 0.85, speed: 42, beat: 2.1, bend: 0.45, dir: 1, start: 0.28, phase: 1.1 },
  { spec: TINY, skin: 1, lane: 0.58, laneAmp: 0.045, laneSpeed: 0.16, opacity: 0.8, speed: 42, beat: 2.1, bend: 0.45, dir: 1, start: 0.31, phase: 1.6 },
  { spec: TINY, skin: 3, lane: 0.66, laneAmp: 0.04, laneSpeed: 0.14, opacity: 0.82, speed: 42, beat: 2.1, bend: 0.45, dir: 1, start: 0.34, phase: 2.0 },
];

type Fish = CastEntry & {
  x: number;
  y: number;
  face: number;
  pitch: number;
  tail: number;
};

type Blade = {
  col: number;
  row: number;
  height: number;
  lean: number;
  width: number;
  tone: number;
  phase: number;
  sway: number;
  speed: number;
  leafGap: number;
};

type Plant = { front: boolean; blades: Blade[]; pebbles: Array<[number, number, number]> };

type Dust = { x: number; y: number; vx: number; vy: number; alpha: number; len: number };

/** Простой ЛКГ: разброс растений должен быть стабильным между кадрами и ресайзами. */
function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export class AquariumScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private theme: Theme;
  private palette: Palette;

  private cell = CELL_WIDE;
  private cols = 0;
  private rows = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;

  private t = 0;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private resizeRaf = 0;
  private reduced: boolean;
  private running = false;

  private fish: Fish[] = [];
  private plants: Plant[] = [];
  private dust: Dust[] = [];
  private sandTop: number[] = [];
  private glyphFont = "";

  constructor(canvas: HTMLCanvasElement, theme: Theme) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Aquarium: 2d context unavailable");

    this.canvas = canvas;
    this.ctx = ctx;
    this.theme = theme;
    this.palette = paletteFor(theme);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.resize();
    this.build();

    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  play(): void {
    this.running = true;
    if (this.reduced) {
      this.draw();
      return;
    }
    this.startLoop();
  }

  pause(): void {
    this.running = false;
    this.stopLoop();
  }

  private startLoop(): void {
    if (this.raf || this.reduced) return;
    this.last = performance.now();
    this.acc = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  private stopLoop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy(): void {
    this.pause();
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  setTheme(theme: Theme): void {
    if (theme === this.theme) return;
    this.theme = theme;
    this.palette = paletteFor(theme);
    if (this.reduced) this.draw();
  }

  private onResize = (): void => {
    if (this.resizeRaf) return;
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0;
      this.resize();
      this.build();
      if (this.reduced) this.draw();
    });
  };

  // Скрытая вкладка не должна крутить canvas: останавливаем цикл, но помним,
  // что сцена включена, — иначе после возврата аквариум останется мёртвым.
  private onVisibility = (): void => {
    if (document.hidden) {
      this.stopLoop();
      return;
    }
    if (this.running) this.startLoop();
  };

  private loop = (now: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.last) this.last = now;
    const dt = Math.min(MAX_DT, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    if (this.acc * 1000 < DRAW_INTERVAL) return;

    this.t += this.acc;
    this.update(this.acc);
    this.acc = 0;
    this.draw();
  };

  private resize(): void {
    const host = this.canvas.parentElement;
    const rect = host ? host.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    this.dpr = Math.min(DPR_LIMIT, window.devicePixelRatio || 1);
    this.cell = this.w < NARROW_VIEWPORT ? CELL_NARROW : CELL_WIDE;
    this.cols = Math.ceil(this.w / this.cell);
    this.rows = Math.ceil(this.h / this.cell);

    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);

    if (host) {
      host.style.setProperty("--aq-cell", `${this.cell}px`);
    }

    this.glyphFont = `500 ${Math.round(this.cell * 0.88)}px "JetBrains Mono", ui-monospace, monospace`;
  }

  /** Раскладывает рыб, растения, пыль и песок под текущий размер экрана. */
  private build(): void {
    const rand = rng(0x5eeda11);
    const narrow = this.w < NARROW_VIEWPORT;
    const cast = narrow ? NARROW_CAST : CAST;

    this.fish = cast.map((entry) => {
      const margin = this.cell * 2;
      return {
        ...entry,
        x: clamp(entry.start * this.w, margin, this.w - margin),
        y: clamp(entry.lane * this.h, this.h * 0.1, this.h * 0.85),
        face: entry.dir,
        pitch: 0,
        tail: entry.phase,
      };
    });

    this.plants = this.buildPlants(rand);
    this.buildSand(rand);

    const dustCount = narrow ? 50 : 100;
    this.dust = Array.from({ length: dustCount }, () => ({
      x: rand() * this.w,
      y: rand() * this.h,
      vx: -3 - rand() * 6,
      vy: -2 - rand() * 5,
      alpha: 0.18 + rand() * 0.36,
      len: rand() > 0.78 ? 2 : 1,
    }));
  }

  private buildPlants(rand: () => number): Plant[] {
    const baseRow = this.rows - SAND_ROWS;
    const narrow = this.w < NARROW_VIEWPORT;
    // Кусты у бортов: много коротких и несколько высоких стеблей — так масса
    // читается зарослью, а не пучком одинаковых палок.
    const groups: Array<{ fx: number; count: number; front: boolean; scale: number }> = narrow
      ? [
          { fx: 0.07, count: 9, front: true, scale: 0.48 },
          { fx: 0.93, count: 7, front: false, scale: 0.4 },
        ]
      : [
          { fx: 0.055, count: 12, front: true, scale: 1 },
          { fx: 0.945, count: 11, front: true, scale: 0.95 },
          { fx: 0.29, count: 7, front: false, scale: 0.5 },
          { fx: 0.71, count: 6, front: false, scale: 0.45 },
        ];

    return groups.map((group) => {
      const center = group.fx * this.cols;
      const blades: Blade[] = Array.from({ length: group.count }, () => {
        const height = clamp((0.05 + rand() * 0.22) * this.rows * group.scale, 4, this.rows * 0.25);
        return {
          col: center + (rand() - 0.5) * 18 * group.scale,
          row: baseRow,
          height,
          lean: (rand() - 0.5) * 11,
          width: 0.9 + rand() * 2.2,
          tone: Math.floor(rand() * this.palette.plant.length),
          phase: rand() * TAU,
          sway: 1.2 + rand() * 4.2,
          speed: 0.2 + rand() * 0.4,
          leafGap: 2 + Math.floor(rand() * 3),
        };
      });

      const pebbles: Array<[number, number, number]> = Array.from(
        { length: 3 + Math.floor(rand() * 4) },
        () => [
          Math.round(center + (rand() - 0.5) * 14),
          baseRow - Math.floor(rand() * 2),
          1 + Math.floor(rand() * 2),
        ]
      );

      return { front: group.front, blades, pebbles };
    });
  }

  private buildSand(rand: () => number): void {
    this.sandTop = Array.from({ length: this.cols }, () => {
      const base = this.rows - SAND_ROWS;
      return base + (rand() > 0.55 ? 1 : 0) + (rand() > 0.85 ? 1 : 0);
    });
  }

  private update(dt: number): void {
    const floor = this.h - SAND_ROWS * this.cell;

    for (const f of this.fish) {
      const spec = f.spec;
      const span = (spec.len + spec.tailLen) * this.cell;

      const laneY =
        this.h * f.lane + Math.sin(this.t * f.laneSpeed + f.phase) * this.h * f.laneAmp;
      const seek = clamp((laneY - f.y) / (this.h * 0.16), -1, 1);
      const wander = Math.sin(this.t * 0.33 + f.phase * 2.3) * 0.055;
      const pitchMax = 0.44;

      let target = seek * pitchMax + wander;
      if (f.y < this.h * 0.12) target = Math.max(target, pitchMax * 0.7);
      if (f.y > floor - this.cell * 2) target = Math.min(target, -pitchMax * 0.7);
      f.pitch += (target - f.pitch) * Math.min(1, dt * 1.7);

      // изредка рыба делает рывок: плавный всплеск скорости, не мгновенный
      const dart = Math.pow(Math.max(0, Math.sin(this.t * 0.21 + f.phase * 4.1)), 10);
      const speed = f.speed * (1 + dart * 0.9) * (1 + Math.sin(this.t * 0.6 + f.phase) * 0.08);

      f.x += f.dir * speed * Math.cos(f.pitch) * dt;
      f.y += speed * Math.sin(f.pitch) * dt;

      const margin = Math.max(24, span * 0.12);
      if (f.x < margin && f.dir < 0) f.dir = 1;
      if (f.x > this.w - margin && f.dir > 0) f.dir = -1;

      f.y = clamp(f.y, this.cell * 3, floor - this.cell);
      f.face += (f.dir - f.face) * Math.min(1, dt * 2.4);
      f.tail += dt * f.beat * TAU;
    }

    for (const d of this.dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.x < -4) d.x = this.w + 4;
      if (d.y < -4) d.y = this.h + 4;
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = this.glyphFont;

    this.drawLight();
    this.drawSand();
    this.drawPlants(false);
    for (const f of this.fish) this.drawFish(f);
    this.drawDust();
    this.drawPlants(true);
    this.drawAtmosphere();
  }

  /** Свет из толщи воды: мягкое пятно и несколько косых лучей. */
  private drawLight(): void {
    const ctx = this.ctx;
    const { w, h, palette } = this;
    const dark = this.theme === "dark";

    const glow = ctx.createRadialGradient(w * 0.54, h * 0.38, 0, w * 0.54, h * 0.38, h * 0.7);
    glow.addColorStop(0, tint(palette.glow, dark ? 0.3 : 0.32));
    glow.addColorStop(0.55, tint(palette.glow, dark ? 0.12 : 0.1));
    glow.addColorStop(1, tint(palette.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
    for (let i = 0; i < 4; i += 1) {
      const drift = Math.sin(this.t * 0.05 + i * 1.7) * w * 0.03;
      const x = w * (0.06 + i * 0.27) + drift;
      const width = w * (0.07 + (i % 3) * 0.02);
      const beam = ctx.createLinearGradient(x, 0, x + width * 2, h);
      beam.addColorStop(0, tint(palette.beam, dark ? 0.1 : 0.13));
      beam.addColorStop(0.55, tint(palette.beam, dark ? 0.045 : 0.05));
      beam.addColorStop(1, tint(palette.beam, 0));
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + width, 0);
      ctx.lineTo(x + width * 2.2, h);
      ctx.lineTo(x + width * 1.1, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawSand(): void {
    const ctx = this.ctx;
    const { palette, cols, rows, cell } = this;
    ctx.save();
    for (let col = 0; col < cols; col += 1) {
      for (let row = this.sandTop[col]; row < rows; row += 1) {
        const n = hash(col, row, 7);
        const color = palette.sand[Math.floor(n * palette.sand.length)];
        ctx.fillStyle = tint(color, 0.34 + n * 0.3);
        ctx.fillRect(col * cell, row * cell, cell + 0.4, cell + 0.4);

        if (n > 0.7) {
          ctx.fillStyle = tint(palette.rock[Math.floor(n * palette.rock.length)], 0.35);
          ctx.fillText(n > 0.86 ? "%" : ".", col * cell + cell * 0.5, row * cell + cell * 0.55);
        }
      }
    }
    ctx.restore();
  }

  private drawPlants(front: boolean): void {
    const ctx = this.ctx;
    const { palette, cell } = this;
    ctx.save();
    ctx.font = this.glyphFont;

    for (const plant of this.plants) {
      if (plant.front !== front) continue;

      for (const [col, row, size] of plant.pebbles) {
        for (let dy = 0; dy < size; dy += 1) {
          for (let dx = 0; dx < size + 1; dx += 1) {
            const n = hash(col + dx, row + dy, 31);
            ctx.fillStyle = tint(palette.rock[Math.floor(n * palette.rock.length)], 0.4 + n * 0.2);
            ctx.fillRect((col + dx) * cell, (row - dy) * cell, cell + 0.4, cell + 0.4);
          }
        }
      }

      for (const blade of plant.blades) {
        for (let i = 0; i <= blade.height; i += 1) {
          const s = i / blade.height;
          const sway =
            Math.sin(this.t * blade.speed + blade.phase + s * 2.6) *
            blade.sway *
            Math.pow(s, 1.4);
          const col = blade.col + blade.lean * s + sway;
          const half = Math.max(0.34, blade.width * (1 - s * 0.78)) * 0.5;
          const row = blade.row - i;

          for (let c = Math.floor(col - half); c <= Math.ceil(col + half); c += 1) {
            const n = hash(c, row, 53);
            const color = palette.plant[(blade.tone + (n > 0.72 ? 1 : 0)) % palette.plant.length];
            ctx.fillStyle = tint(color, 0.62 + n * 0.3);
            ctx.fillRect(c * cell, row * cell, cell + 0.4, cell + 0.4);
            if (n > 0.58) {
              ctx.fillStyle = tint(palette.plant[(blade.tone + 2) % palette.plant.length], 0.6);
              ctx.fillText(n > 0.9 ? "g" : ".", c * cell + cell * 0.5, row * cell + cell * 0.55);
            }
          }

          // у корней стебли сливаются в один куст — иначе торчат отдельными палками
          if (s < 0.16) {
            for (let k = -3; k <= 3; k += 1) {
              const bc = Math.round(col + k);
              const bn = hash(bc, row, 71);
              if (bn < 0.35) continue;
              const color = palette.plant[(blade.tone + (k + 3) % 2) % palette.plant.length];
              ctx.fillStyle = tint(color, 0.55 + bn * 0.3);
              ctx.fillRect(bc * cell, row * cell, cell + 0.4, cell + 0.4);
            }
          }

          // листья в стороны: без них водоросль читается как палка
          if (i > 2 && i < blade.height - 2 && i % blade.leafGap === 0) {
            const side = (i / blade.leafGap) % 2 === 0 ? 1 : -1;
            for (let k = 1; k <= 3; k += 1) {
              const lc = Math.round(col + side * (half + k));
              const lr = row - Math.round(k * 0.75);
              const n = hash(lc, lr, 67);
              const color = palette.plant[(blade.tone + 1) % palette.plant.length];
              ctx.fillStyle = tint(color, 0.58 + n * 0.28);
              ctx.fillRect(lc * cell, lr * cell, cell + 0.4, cell + 0.4);
            }
          }
        }
      }
    }
    ctx.restore();
  }

  private drawFish(f: Fish): void {
    const spec = f.spec;
    const face = f.face;
    if (Math.abs(face) < 0.12) return;

    const ctx = this.ctx;
    const { cell, palette } = this;
    const skin = palette.fish[f.skin % palette.fish.length];
    const cos = Math.cos(f.pitch);
    const sin = Math.sin(f.pitch);

    // Видимый разворот не даём уйти в ноль: иначе рыбка на мгновение исчезает
    const squash = Math.sign(face) * Math.max(0.24, Math.abs(face));

    const tailSpan = spec.len + spec.tailLen + 2;
    const topSpan = spec.half + (spec.dorsal ? spec.dorsal.h : 0) + 5;
    const bottomSpan = spec.half + (spec.anal ? spec.anal.h : 0) + 5;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const corners: Array<[number, number]> = [
      [-tailSpan, -topSpan],
      [-tailSpan, bottomSpan],
      [2, -topSpan],
      [2, bottomSpan],
    ];
    for (const [lx, ly] of corners) {
      const sx = lx * squash * cell;
      const sy = ly * cell;
      const px = f.x + sx * cos - sy * sin;
      const py = f.y + sx * sin + sy * cos;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }

    const col0 = Math.max(0, Math.floor(minX / cell));
    const col1 = Math.min(this.cols - 1, Math.ceil(maxX / cell));
    const row0 = Math.max(0, Math.floor(minY / cell));
    const row1 = Math.min(this.rows - 1, Math.ceil(maxY / cell));

    // Рыба не гаснет целиком, а по мере входа в колонку текста уходит в дымку
    // по клеткам: голова у борта остаётся яркой, а спина за строками — тенью.
    const eyeX = -spec.eye.u * spec.len;
    const eyeHalf = bodyHalf(spec, spec.eye.u);
    const eyeY = spec.eye.v * eyeHalf;

    ctx.save();
    ctx.globalAlpha = f.opacity;
    ctx.font = this.glyphFont;

    for (let row = row0; row <= row1; row += 1) {
      const py = (row + 0.5) * cell;
      for (let col = col0; col <= col1; col += 1) {
        const px = (col + 0.5) * cell;
        const fade = this.columnFade(px);
        const dx = px - f.x;
        const dy = py - f.y;
        const mx = dx / squash;
        const lx = mx * cos + dy * sin;
        const ly = -mx * sin + dy * cos;
        const x = lx / cell;
        const y = ly / cell;
        const u = -x / spec.len;

        const bend = this.spineBend(f, u);
        const bodyY = y - bend;

        let fill = "";
        let alpha = 0;

        const halfHeight = u >= 0 && u <= 1 ? bodyHalf(spec, u) : -1;
        if (halfHeight > 0 && Math.abs(bodyY) <= halfHeight) {
          const v = bodyY / halfHeight;
          const n = hash(Math.round(x), Math.round(y), f.skin + 3);
          let color = skin.body;
          let a = 0.95;

          // объём: тёмная спина, светлое брюхо, а между ними — редкая мозаика,
          // без неё тело выглядит залитой краской колбасой
          if (v < -0.62) {
            color = skin.back;
            a = 1;
          } else if (v > 0.7) {
            color = skin.belly;
            a = 0.92;
          } else if (n > 0.76) {
            color = skin.back;
            a = 0.95;
          } else if (n < 0.16) {
            color = skin.belly;
            a = 0.92;
          } else if (n > 0.5 && n < 0.55) {
            color = skin.fin;
            a = 0.9;
          }

          if (spec.stripe > 0 && Math.floor(-x / spec.stripe) % 2 === 0) {
            color = skin.line;
            a = 0.75;
          }

          const edge = 1 - Math.abs(v);
          if (edge < 0.12) {
            color = skin.back;
            a = 0.95;
          }

          a += (n - 0.5) * 0.1;

          // глаз: тёмный зрачок с бликом в верхнем левом углу
          if (Math.abs(x - eyeX) <= 0.95 && Math.abs(bodyY - eyeY) <= 0.95) {
            color = skin.eye;
            a = 0.95;
            if (x < eyeX - 0.3 && bodyY < eyeY - 0.3) {
              color = skin.glint;
              a = 0.9;
            }
          }

          // рот: короткая тёмная зарубка у самого носа
          if (u < 0.035 && v > 0.15) {
            color = skin.line;
            a = 0.7;
          }

          fill = tint(color, a * fade);
          alpha = a * fade;
        } else if (u > 0.94) {
          const t = (-x - spec.len) / spec.tailLen;
          if (t >= 0 && t <= 1.05) {
            const tailBend = this.spineBend(f, 1 + t * 0.4);
            const spread = bodyHalf(spec, 1) + spec.tailSpread * Math.pow(t, 0.85);
            const notch =
              spec.fork * spec.tailSpread * Math.pow(Math.max(0, t - 0.22) / 0.78, 1.5);
            const ty = Math.abs(y - tailBend);
            if (ty <= spread && ty > notch) {
              const ray = Math.floor((y - tailBend) / Math.max(1, spread / 5)) % 2 === 0;
              let a = 0.88;
              if (ray) a = 0.96;
              if (t > 0.92) a *= 0.7;
              const n = hash(Math.round(x), Math.round(y), f.skin + 11);
              if (t > 0.97 && n > 0.85) continue;
              fill = tint(skin.fin, a * fade);
              alpha = a * fade;
            }
          }
        }

        if (!fill) {
          const fin = this.finCell(spec, u, bodyY, x);
          if (fin) {
            fill = tint(skin.fin, fin.alpha * fade);
            alpha = fin.alpha * fade;
          }
        }

        if (!fill || alpha <= 0) continue;

        const sx = col * cell;
        const sy = row * cell;
        ctx.fillStyle = fill;
        ctx.fillRect(sx, sy, cell + 0.4, cell + 0.4);

        if (hash(col, row, f.skin + 17) > 0.38) {
          const gx = Math.round(x);
          const gy = Math.round(y);
          const idx = Math.floor(hash(gx, gy, f.skin + 23) * spec.glyphs.length);
          ctx.fillStyle = tint(skin.line, 0.42 * fade);
          ctx.fillText(spec.glyphs[idx], sx + cell * 0.5, sy + cell * 0.55);
        }
      }
    }

    ctx.restore();
  }

  /** Изгиб осевой линии: волна бежит от головы к хвосту. */
  private spineBend(f: Fish, u: number): number {
    const w = Math.min(1.35, Math.max(0, u));
    return Math.sin(f.tail - u * 2.1) * f.bend * Math.pow(w, 1.8);
  }

  /**
   * Насколько клетка в экранной точке x уходит в дымку текстовой колонки.
   * Внутри — тень, к бортам — полная краска. Переход широкий: рыба не должна
   * «включаться» рывком на границе колонки.
   */
  private columnFade(x: number): number {
    if (this.w < NARROW_VIEWPORT) return 0.62;
    const halfColumn = Math.min(340, this.w * 0.24);
    const away = Math.abs(x - this.w * 0.5);
    return 0.35 + 0.65 * clamp((away - halfColumn * 0.94) / (halfColumn * 0.7), 0, 1);
  }

  /** Клетка плавника: спинного, анального или грудного. */
  private finCell(
    spec: FishSpec,
    u: number,
    y: number,
    x: number
  ): { alpha: number } | null {
    if (u < -0.1 || u > 1.12) return null;

    const uu = clamp(u, 0, 1);
    const hh = bodyHalf(spec, uu);

    if (spec.dorsal && u >= spec.dorsal.u0 && u <= spec.dorsal.u1) {
      const rise = spec.dorsal.h * Math.sin((Math.PI * (u - spec.dorsal.u0)) / (spec.dorsal.u1 - spec.dorsal.u0));
      if (y < -hh && y > -hh - rise) {
        const ray = Math.floor(x * 0.9) % 3 === 0;
        return { alpha: ray ? 0.95 : 0.84 };
      }
    }

    if (spec.anal && u >= spec.anal.u0 && u <= spec.anal.u1) {
      const drop = spec.anal.h * Math.sin((Math.PI * (u - spec.anal.u0)) / (spec.anal.u1 - spec.anal.u0));
      if (y > hh && y < hh + drop) {
        const ray = Math.floor(x * 0.9) % 3 === 0;
        return { alpha: ray ? 0.93 : 0.82 };
      }
    }

    const pec = spec.pectoral;
    if (pec) {
      const pcx = -pec.u * spec.len;
      const pcy = hh * 0.32;
      const rx = pec.size;
      const ry = pec.size * 0.52;
      const ox = x - pcx;
      const oy = y - pcy;
      // плавник наклонён назад: повернём локальные оси на 0.5 рад
      const c = Math.cos(0.5);
      const s = Math.sin(0.5);
      const px = ox * c + oy * s;
      const py = -ox * s + oy * c;
      if ((px / rx) * (px / rx) + (py / ry) * (py / ry) <= 1) {
        return { alpha: 0.78 + (Math.floor(x * 2) % 2 === 0 ? 0.12 : 0) };
      }
    }

    return null;
  }

  private drawDust(): void {
    const ctx = this.ctx;
    const { cell, palette } = this;
    ctx.save();
    for (const d of this.dust) {
      const col = Math.floor(d.x / cell);
      const row = Math.floor(d.y / cell);
      ctx.fillStyle = tint(palette.dust, d.alpha);
      ctx.fillRect(col * cell, row * cell, cell * d.len * 0.8, cell * 0.34);
    }
    ctx.restore();
  }

  /**
   * Дымка и затемнение по краям: глубина и читаемость текста поверх сцены.
   * Дымка — вытянутый по вертикали овал вокруг колонки текста: рыбы у бортов
   * остаются контрастными, а под строками краска уходит в бумагу.
   */
  private drawAtmosphere(): void {
    const ctx = this.ctx;
    const { w, h, palette } = this;
    const dark = this.theme === "dark";

    // Молочное пятно вокруг колонки текста. Плоская вершина градиента держит
    // ровный фон под всеми строками, а края растворяются к бортам — там рыбы
    // остаются контрастными. Так текст не спорит с краской, но сцена жива.
    const narrow = w < NARROW_VIEWPORT;
    const rx = narrow ? w * 0.62 : Math.min(w * 0.42, 620);
    const ry = h * 0.78;
    const core = narrow ? 0.5 : dark ? 0.5 : 0.45;
    ctx.save();
    ctx.translate(w * 0.5, h * 0.48);
    ctx.scale(1, ry / rx);
    const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    haze.addColorStop(0, tint(palette.haze, core));
    haze.addColorStop(0.6, tint(palette.haze, core * 0.92));
    haze.addColorStop(0.85, tint(palette.haze, core * 0.5));
    haze.addColorStop(1, tint(palette.haze, 0));
    ctx.fillStyle = haze;
    ctx.fillRect(-w * 2, -h * 3, w * 4, h * 6);
    ctx.restore();

    const floor = ctx.createLinearGradient(0, h * 0.78, 0, h);
    floor.addColorStop(0, tint(palette.haze, 0));
    floor.addColorStop(1, tint(palette.haze, dark ? 0.32 : 0.26));
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.78, w, h * 0.22);

    const top = ctx.createLinearGradient(0, 0, 0, h * 0.14);
    top.addColorStop(0, tint(palette.haze, dark ? 0.24 : 0.18));
    top.addColorStop(1, tint(palette.haze, 0));
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, h * 0.14);
  }
}
