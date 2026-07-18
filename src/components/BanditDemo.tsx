import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Многорукий бандит: несколько «автоматов» со скрытой отдачей и ограниченным
 * числом бросков. Каждый бросок поиск выбирает автомат по UCB — балансу между
 * «эксплуатируй уже хороший» и «исследуй мало проверенный». Видно, как он
 * нащупывает лучший автомат и начинает вкладываться именно в него.
 */

type Machine = { name: string; p: number };

const MACHINES: Machine[] = [
  { name: "Автомат A", p: 0.35 },
  { name: "Автомат B", p: 0.55 },
  { name: "Автомат C", p: 0.72 },
];
const C = 1.4; // константа исследования в UCB

type Stat = { n: number; w: number };
const zero = (): Stat[] => MACHINES.map(() => ({ n: 0, w: 0 }));

const BanditDemo: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>(zero);
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<number | null>(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const step = useCallback((times: number) => {
    const cur = statsRef.current.map((s) => ({ ...s }));
    let pick = -1;
    for (let t = 0; t < times; t++) {
      const total = cur.reduce((s, a) => s + a.n, 0);
      let best = 0;
      let bestVal = -Infinity;
      for (let i = 0; i < cur.length; i++) {
        const st = cur[i];
        const v =
          st.n === 0
            ? Infinity
            : st.w / st.n + C * Math.sqrt(Math.log(Math.max(1, total)) / st.n);
        if (v > bestVal) {
          bestVal = v;
          best = i;
        }
      }
      if (Math.random() < MACHINES[best].p) cur[best].w += 1;
      cur[best].n += 1;
      pick = best;
    }
    setStats(cur);
    setLast(pick);
  }, []);

  const reset = () => {
    setRunning(false);
    setStats(zero());
    setLast(null);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => step(1), 110);
    return () => clearInterval(id);
  }, [running, step]);

  const N = stats.reduce((s, a) => s + a.n, 0);
  const leader =
    N > 0 ? stats.reduce((bi, s, i, arr) => (s.n > arr[bi].n ? i : bi), 0) : -1;

  return (
    <div className="mc-demo bandit">
      <div className="bandit__cards">
        {MACHINES.map((m, i) => {
          const st = stats[i];
          const mean = st.n > 0 ? st.w / st.n : 0;
          const selected = last === i;
          const isLeader = i === leader;
          return (
            <div
              key={m.name}
              className={
                "bandit__card" +
                (selected ? " is-selected" : "") +
                (isLeader ? " is-leader" : "")
              }
            >
              <div className="bandit__name">
                {m.name}
                {isLeader && <span className="bandit__star" title="сюда идёт больше всего бросков"> ★</span>}
              </div>
              <div className="bandit__val">{st.n > 0 ? `${Math.round(mean * 100)}%` : "—"}</div>
              <div className="bandit__bar" aria-hidden="true">
                <div className="bandit__fill" style={{ width: `${mean * 100}%` }} />
              </div>
              <div className="bandit__sub">
                {st.n} бросков · истинно ~{Math.round(m.p * 100)}%
              </div>
            </div>
          );
        })}
      </div>
      <div className="mc-demo__controls">
        <button type="button" onClick={() => step(1)}>Один бросок</button>
        <button type="button" onClick={() => setRunning((r) => !r)}>
          {running ? "❚❚ Пауза" : "▷ Авто"}
        </button>
        <button type="button" className="mc-demo__reset" onClick={reset} title="сброс">↻</button>
        <span className="bandit__total">всего бросков: {N}</span>
      </div>
    </div>
  );
};

export default BanditDemo;
