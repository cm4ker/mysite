import React from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { entries } from "../data/entries";
import { fmtDate } from "../lib/date";

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
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>
    </>
  );
};

export default PostPage;
