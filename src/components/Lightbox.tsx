import React, { useEffect, useState } from "react";

type Props = {
  src: string;
  alt?: string;
  onClose: () => void;
};

const Lightbox: React.FC<Props> = ({ src, alt, onClose }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setRotation((r) => r - 90);
      else if (e.key === "ArrowRight") setRotation((r) => r + 90);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="lightbox__controls"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setRotation((r) => r - 90)}
          title="Повернуть против часовой (←)"
          aria-label="Повернуть против часовой"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => setRotation((r) => r + 90)}
          title="Повернуть по часовой (→)"
          aria-label="Повернуть по часовой"
        >
          ↻
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Закрыть (Esc)"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
      <img
        src={src}
        alt={alt || ""}
        className="lightbox__img"
        style={{ transform: `rotate(${rotation}deg)` }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default Lightbox;
