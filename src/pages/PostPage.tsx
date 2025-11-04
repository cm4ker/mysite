import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Button from "../components/button";
import { Tag } from "../components/tag";
import { posts } from "../data/posts";
import "./PostPage.css";

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const post = posts.find((p) => p.id === Number(id));

  if (!post) {
    return (
      <div className="post-page">
        <div className="post-not-found">
          <h2>Запись не найдена</h2>
          <Button
            variant="secondary"
            icon={["fas", "arrow-left"]}
            onClick={() => navigate("/")}
          >
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="post-page">
      <div className="post-page-header">
        <Button
          variant="secondary"
          icon={["fas", "arrow-left"]}
          onClick={() => navigate("/")}
        >
          Вернуться на главную
        </Button>
      </div>

      <article className="post-page-content">
        <div className="post-page-article-header">
          <div className="post-date-large">{formatDate(post.date)}</div>
          <h1 className="post-title-large">{post.title}</h1>
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </div>
        </div>

        <div className="post-article-content">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default PostPage;
