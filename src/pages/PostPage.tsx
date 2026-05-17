import React from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { entries } from "../data/entries";
import { fmtDate } from "../lib/date";

const markdownComponents: Components = {
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
};

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = entries.find((e) => e.type === "article" && e.slug === slug);

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
          components={markdownComponents}
        >
          {post.body}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default PostPage;
