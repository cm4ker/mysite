import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { entries, profile } from "../data/entries";
import { fmtDate } from "../lib/date";
import Lightbox from "../components/Lightbox";
import TelegramComments from "../components/TelegramComments";
import PiDemo from "../components/PiDemo";
import BanditDemo from "../components/BanditDemo";

type LightboxState = { src: string; alt?: string } | null;

const MarginErrorTip: React.FC = () => (
  <span className="stat-tip">
    <button
      type="button"
      className="stat-tip__mark"
      aria-label="Показать расчёт статистической погрешности"
      aria-describedby="margin-error-tooltip"
    >
      ?
    </button>
    <span id="margin-error-tooltip" className="stat-tip__bubble" role="tooltip">
      <strong>Откуда взялись ±5,7 пункта</strong>
      <span>Если несколько раз провести турнир по 300 партий, винрейт каждый раз будет немного отличаться просто из-за случайности.</span>
      <span>Обычный случайный разброс для 300 наблюдений — около 2,9 процентного пункта. Для привычного 95%-го диапазона берут примерно два таких разброса.</span>
      <code>2,9 × почти 2 ≈ 5,7</code>
      <span>То есть настоящий винрейт с большой вероятностью находится примерно в пределах ±5,7 пункта от результата турнира.</span>
    </span>
  </span>
);

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = entries.find((e) => e.type === "article" && e.slug === slug);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const components = useMemo<Components>(() => {
    const map: Components = {
      a: ({ href, children, ...rest }) => {
        if (href && href.startsWith("#")) {
          const targetId = decodeURIComponent(href.slice(1));
          return (
            <a
              href={href}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(targetId);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              {...rest}
            >
              {children}
            </a>
          );
        }
        return (
          <a href={href} {...rest}>
            {children}
          </a>
        );
      },
      img: ({ src, alt, ...rest }) => (
        <img
          src={src}
          alt={alt}
          onClick={() => {
            if (typeof src === "string") {
              setLightbox({ src, alt });
            }
          }}
          {...rest}
        />
      ),
    };
    // Кастомные теги из тела статьи → React-компоненты.
    // Тип Components не знает нестандартных тегов, поэтому вешаем ключи в обход типов.
    const custom = map as Record<string, unknown>;
    custom["pi-demo"] = () => <PiDemo />;
    custom["bandit-demo"] = () => <BanditDemo />;
    custom["margin-error-tip"] = () => <MarginErrorTip />;
    return map;
  }, []);

  if (!post || post.type !== "article") {
    return (
      <>
        <Link to="/" className="back">
          ← назад
        </Link>
        <p>Статья не найдена.</p>
      </>
    );
  }

  return (
    <>
      <Link to="/" className="back">
        ← назад
      </Link>
      <div className="article-meta">
        <span>{fmtDate(post.date)}</span>
        <span>статья</span>
        <span>{post.readingMinutes} мин</span>
      </div>
      <h1 className="article-title">{post.title}</h1>
      <div className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={components}
        >
          {post.body}
        </ReactMarkdown>
      </div>
      {profile.telegramChannel && post.telegramPostId && (
        <TelegramComments
          channel={profile.telegramChannel}
          postId={post.telegramPostId}
        />
      )}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
};

export default PostPage;
