import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { entries } from "../data/entries";
import { fmtDate } from "../lib/date";
import Lightbox from "../components/Lightbox";

type LightboxState = { src: string; alt?: string } | null;

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = entries.find((e) => e.type === "article" && e.slug === slug);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const components = useMemo<Components>(
    () => ({
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
    }),
    [],
  );

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
