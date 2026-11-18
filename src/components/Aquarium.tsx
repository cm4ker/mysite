import React, { useEffect, useRef, useState } from "react";
import { AquariumScene } from "../aquarium/AquariumScene";
import { Theme } from "../aquarium/palettes";

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

/** Превращает ASCII-маску ('#' — точка) в строку braille-символов. */
function toBraille(mask: string[]): string {
  const width = Math.max(...mask.map((row) => row.length));
  let line = "";
  for (let x = 0; x < width; x += 2) {
    let bits = 0;
    for (let dx = 0; dx < 2; dx += 1) {
      for (let dy = 0; dy < 4; dy += 1) {
        if ((mask[dy] || "")[x + dx] === "#") bits |= DOT_BITS[dx][dy];
      }
    }
    line += String.fromCharCode(0x2800 + bits);
  }
  return line;
}

/** Рыбка для кнопки в топбаре — одна строка braille. */
export const MINI_FISH = toBraille([
  "#...####..",
  "##.####.#.",
  "##.######.",
  "#...####..",
]);

/** Должно совпадать с transition у .aquarium__water в App.css. */
const DRAIN_MS = 1200;

type Props = {
  active: boolean;
  theme: Theme;
};

const Aquarium: React.FC<Props> = ({ active, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<AquariumScene | null>(null);
  const themeRef = useRef(theme);
  const [mounted, setMounted] = useState(active);
  const [filled, setFilled] = useState(false);

  themeRef.current = theme;

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
    if (!mounted || !canvasRef.current) return;

    const scene = new AquariumScene(canvasRef.current, themeRef.current);
    sceneRef.current = scene;
    scene.play();

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, [mounted]);

  useEffect(() => {
    sceneRef.current?.setTheme(theme);
  }, [theme]);

  if (!mounted) return null;

  return (
    <div className={`aquarium${filled ? " aquarium--filled" : ""}`} aria-hidden="true">
      <div className="aquarium__water">
        <svg className="aquarium__wave" viewBox="0 0 240 20" preserveAspectRatio="none">
          <path d="M0 12 Q 15 2 30 12 T 60 12 T 90 12 T 120 12 T 150 12 T 180 12 T 210 12 T 240 12 V 20 H 0 Z" />
        </svg>
      </div>
      <canvas className="aquarium__canvas" ref={canvasRef} />
    </div>
  );
};

export default Aquarium;
