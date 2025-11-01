import React from 'react';
import './Projects.css';

const Projects: React.FC = () => {
  const projects = [
    {
      title: 'Платформа аналитики',
      description: 'Real-time аналитическая панель с визуализацией данных и машинным обучением для прогнозирования трендов.',
      tags: ['React', 'Node.js', 'PostgreSQL']
    },
    {
      title: 'E-commerce система',
      description: 'Масштабируемая платформа электронной коммерции с поддержкой микросервисной архитектуры и высокой нагрузки.',
      tags: ['Next.js', 'Rust', 'Redis']
    },
    {
      title: 'Collaborative IDE',
      description: 'Веб-редактор кода с поддержкой совместной работы в реальном времени и интеграцией с GitHub.',
      tags: ['TypeScript', 'WebSocket', 'Monaco']
    }
  ];

  return (
    <section id="projects">
      <h2>Избранные проекты</h2>
      <div className="grid">
        {projects.map((project, index) => (
          <div key={index} className="card" tabIndex={0}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="tech-stack">
              {project.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="tech-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
