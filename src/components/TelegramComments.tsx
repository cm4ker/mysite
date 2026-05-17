import React, { useEffect, useRef, useState } from "react";

type Props = {
  channel: string;
  postId: number;
  commentsLimit?: number;
};

function readTheme(): "light" | "dark" {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" ? "dark" : "light";
}

const TelegramComments: React.FC<Props> = ({
  channel,
  postId,
  commentsLimit = 5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document === "undefined" ? "light" : readTheme(),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    host.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-discussion", `${channel}/${postId}`);
    script.setAttribute("data-comments-limit", String(commentsLimit));
    script.setAttribute("data-colorful", "1");
    if (theme === "dark") {
      script.setAttribute("data-dark", "1");
    }
    host.appendChild(script);

    return () => {
      host.innerHTML = "";
    };
  }, [channel, postId, theme, commentsLimit]);

  return (
    <section className="tg-comments" aria-label="Комментарии из Telegram">
      <h2 className="tg-comments__title">Комментарии в Telegram</h2>
      <div ref={containerRef} className="tg-comments__widget" />
    </section>
  );
};

export default TelegramComments;
