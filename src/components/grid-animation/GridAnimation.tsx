import React, { useEffect, useState, useCallback } from "react";
import "./GridAnimation.css";

interface Cell {
  id: string;
  x: number;
  y: number;
  opacity: number;
}

const GridAnimation: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const cellSize = 50; // Размер клетки средней сетки

  const activateRandomCell = useCallback(() => {
    const cols = Math.ceil(window.innerWidth / cellSize);
    const rows = Math.ceil(window.innerHeight / cellSize);
    
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const id = `${x}-${y}-${Date.now()}`;
    
    const newCell: Cell = {
      id,
      x: x * cellSize,
      y: y * cellSize,
      opacity: 0.04 + Math.random() * 0.06,
    };

    setCells(prev => [...prev, newCell]);

    // Удаляем клетку через некоторое время
    setTimeout(() => {
      setCells(prev => prev.filter(c => c.id !== id));
    }, 3000 + Math.random() * 4000);
  }, []);

  useEffect(() => {
    // Активируем новые клетки с интервалом
    const interval = setInterval(() => {
      if (Math.random() < 0.7) {
        activateRandomCell();
      }
    }, 150);

    return () => clearInterval(interval);
  }, [activateRandomCell]);

  // Получаем тему
  const theme = document.documentElement.getAttribute("data-theme");
  const baseColor = theme === "light" ? "91, 122, 184" : "59, 130, 246";

  return (
    <div className="grid-animation">
      {cells.map(cell => (
        <div
          key={cell.id}
          className="grid-cell"
          style={{
            left: cell.x + 1,
            top: cell.y + 1,
            width: cellSize - 1,
            height: cellSize - 1,
            backgroundColor: `rgba(${baseColor}, ${cell.opacity})`,
          }}
        />
      ))}
    </div>
  );
};

export default GridAnimation;
