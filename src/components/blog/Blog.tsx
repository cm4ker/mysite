import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../button';
import './Blog.css';
import me from '../../me.jpg';

interface BlogPost {
  id: number;
  content: string;
  timestamp: number;
  likes: number;
  liked: boolean;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const isTyping = document.activeElement?.tagName === 'TEXTAREA' || 
                       document.activeElement?.tagName === 'INPUT';
      
      if (isTyping) return;

      // 'n' key to open new post composer
      if (e.key.toLowerCase() === 'n') {
        setComposerOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadPosts = () => {
    const saved = localStorage.getItem('blogPosts');
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      const samplePosts: BlogPost[] = [
        {
          id: Date.now() + 1,
          content: 'Сегодня завершил работу над новым проектом! Использовал React и TypeScript для создания интерактивной дашборд-панели. Особенно горжусь оптимизацией производительности — всё работает молниеносно! ⚡',
          timestamp: Date.now() - 86400000,
          likes: 12,
          liked: false,
        },
        {
          id: Date.now() + 2,
          content: 'Переключился на Zed в качестве основного редактора. Скорость работы просто невероятная! Минималистичный дизайн и keyboard-first подход — именно то, что нужно для продуктивной работы.',
          timestamp: Date.now() - 172800000,
          likes: 8,
          liked: false,
        },
        {
          id: Date.now() + 3,
          content: 'Изучаю Rust последние несколько недель. Язык непростой, но концепции ownership и borrowing делают код невероятно надёжным. Уже начал переписывать критичные части бэкенда.',
          timestamp: Date.now() - 259200000,
          likes: 15,
          liked: false,
        }
      ];
      setPosts(samplePosts);
      localStorage.setItem('blogPosts', JSON.stringify(samplePosts));
    }
  };

  const savePosts = (updatedPosts: BlogPost[]) => {
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} д назад`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const handlePublish = () => {
    const content = postContent.trim();
    if (content) {
      const newPost: BlogPost = {
        id: Date.now(),
        content,
        timestamp: Date.now(),
        likes: 0,
        liked: false,
      };
      const updatedPosts = [newPost, ...posts];
      savePosts(updatedPosts);
      setPostContent('');
      setComposerOpen(false);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить эту запись?')) {
      const updatedPosts = posts.filter(p => p.id !== id);
      savePosts(updatedPosts);
    }
  };

  const toggleLike = (id: number) => {
    const updatedPosts = posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked,
        };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  return (
    <section id="blog">
      <div className="blog-header">
        <h2>Микроблог</h2>
        <Button 
          variant="primary"
          icon={['fas', 'pen']}
          onClick={() => setComposerOpen(true)}
          kbd="N"
        >
          Новая запись
        </Button>
      </div>

      {composerOpen && (
        <div className="blog-composer active">
          <textarea
            placeholder="О чём думаете?..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            maxLength={500}
          />
          <div className="blog-composer-actions">
            <Button 
              variant="secondary"
              onClick={() => { setComposerOpen(false); setPostContent(''); }}
              icon={['fas', 'times']}
            >
              Отмена
            </Button>
            <Button 
              variant="primary"
              onClick={handlePublish}
              icon={['fas', 'check']}
            >
              Опубликовать
            </Button>
          </div>
        </div>
      )}

      <div className="blog-posts">
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FontAwesomeIcon icon={['fas', 'file']} size="3x" />
            </div>
            <p>Пока нет ни одной записи</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="blog-post">
              <div className="blog-post-header">
                <div className="blog-post-meta">
                  <div className="blog-post-avatar">
                    <img src={me} alt="Nikita Zenkov" />
                  </div>
                  <div className="blog-post-info">
                    <div className="blog-post-author">Nikita Zenkov</div>
                    <div className="blog-post-time">{formatTime(post.timestamp)}</div>
                  </div>
                </div>
                <div className="blog-post-actions">
                  <button
                    className="blog-post-action"
                    onClick={() => handleDelete(post.id)}
                    aria-label="Удалить"
                  >
                    <FontAwesomeIcon icon={['fas', 'times']} />
                  </button>
                </div>
              </div>
              <div className="blog-post-content">{post.content}</div>
              <div className="blog-post-stats">
                <div
                  className={`blog-post-stat ${post.liked ? 'liked' : ''}`}
                  onClick={() => toggleLike(post.id)}
                >
                  <FontAwesomeIcon icon={post.liked ? ['fas', 'heart'] : ['far', 'heart']} />
                  <span>{post.likes}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Blog;
