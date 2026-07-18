import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Классический Монте-Карло: бросаем случайные точки в квадрат, считаем долю
 * попавших в четверть круга. Она равна π/4 → оценка π = 4·(внутри/всего).
 * Никакой формулы π не используется — только случайные броски. Это и есть
 * суть метода: заменить точный расчёт множеством случайных проб.
 */

const SIZE = 480; // внутреннее разрешение канваса
const IN_COLOR = "#35b98a";
const OUT_COLOR = "#d5824a";
const PLOT_BG = "#15151a";
const CAP = 40000; // предел авто-режима, чтобы не грузить страницу

const PiDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [total, setTotal] = useState(0);
  const [inside, setInside] = useState(0);
  const [running, setRunning] = useState(false);

  const paintBg = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.fillStyle = PLOT_BG;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    ctxRef.current = cv.getContext("2d");
    paintBg();
  }, [paintBg]);

  const throwBatch = useCallback((k: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    let inc = 0;
    for (let i = 0; i < k; i++) {
      const x = Math.random();
      const y = Math.random();
      const hit = x * x + y * y <= 1;
      if (hit) inc++;
      ctx.fillStyle = hit ? IN_COLOR : OUT_COLOR;
      ctx.fillRect(x * SIZE, SIZE - y * SIZE, 2, 2);
    }
    setInside((v) => v + inc);
    setTotal((v) => v + k);
  }, []);

  const reset = () => {
    setRunning(false);
    setInside(0);
    setTotal(0);
    paintBg();
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => throwBatch(400), 60);
    return () => clearInterval(id);
  }, [running, throwBatch]);

  useEffect(() => {
    if (running && total >= CAP) setRunning(false);
  }, [running, total]);

  const est = total > 0 ? (4 * inside) / total : 0;
  const dev = total > 0 ? (Math.abs(est - Math.PI) / Math.PI) * 100 : 0;
  const fmt = (n: number) => n.toLocaleString("ru-RU");

  return (
    <div className="mc-demo pi-demo">
      <div className="pi-demo__wrap">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="pi-demo__canvas"
          aria-label="Поле для бросков точек Монте-Карло"
        />
        <div className="pi-demo__side">
          <div className="mc-tile">
            <span className="mc-tile__label">Оценка π</span>
            <span className="mc-tile__big">{total > 0 ? est.toFixed(5) : "—"}</span>
            <span className="mc-tile__sub">
              {total > 0 ? `отклонение: ${dev.toFixed(2)}%` : "брось точки →"}
            </span>
          </div>
          <div className="pi-demo__tiles">
            <div className="mc-tile">
              <span className="mc-tile__label">Всего бросков</span>
              <span className="mc-tile__num">{fmt(total)}</span>
            </div>
            <div className="mc-tile">
              <span className="mc-tile__label">Внутри круга</span>
              <span className="mc-tile__num mc-tile__num--in">{fmt(inside)}</span>
            </div>
          </div>
          <p className="mc-tile__note">
            Доля точек, попавших в четверть круга, равна π/4. Чем больше бросков, тем
            точнее оценка.
          </p>
        </div>
      </div>
      <div className="mc-demo__controls">
        <button type="button" onClick={() => throwBatch(500)}>Бросить 500 точек</button>
        <button type="button" onClick={() => setRunning((r) => !r)}>
          {running ? "❚❚ Пауза" : "▷ Авто"}
        </button>
        <button type="button" className="mc-demo__reset" onClick={reset} title="сброс">↻</button>
      </div>
    </div>
  );
};

export default PiDemo;
