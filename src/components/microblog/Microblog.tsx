import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { posts } from '../../data/posts';
import { Tag } from '../tag';
import './Microblog.css';

const Microblog: React.FC = () => {
  const navigate = useNavigate();

  const openPost = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section id="microblog">
      <h2>Микроблог</h2>
      <div className="microblog-container">
        <div className="posts-grid">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="post-card"
              onClick={() => openPost(post.id)}
            >
                <div className="post-date">
                  <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
                  {formatDate(post.date)}
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-preview">{post.preview}</p>
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <Tag key={index} icon={<FontAwesomeIcon icon={['fas', 'tag']} />}>
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div className="post-meta">
                  <span className="read-more">
                    Читать полностью
                    <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                  </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};export default Microblog;
