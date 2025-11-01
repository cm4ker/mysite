import React from 'react';
import './Skills.css';

const Skills: React.FC = () => {
  const skills = [
    {
      title: '.NET Development',
      description: '.NET Core 3+, .NET Framework 2.0+. Глубокая экспертиза в разработке enterprise-приложений на платформе Microsoft.',
      tags: ['.NET Core', '.NET Framework', 'C#', 'ASP.NET']
    },
    {
      title: 'Frontend',
      description: 'Blazor, ReactJS, TypeScript, Javascript, CSS. Создаю современные интерфейсы с акцентом на производительность.',
      tags: ['Blazor', 'ReactJS', 'TypeScript', 'CSS']
    },
    {
      title: 'Desktop',
      description: 'WPF, Avalonia, Xamarin Forms, Windows Forms. Разрабатываю кроссплатформенные десктопные приложения.',
      tags: ['WPF', 'Avalonia', 'Xamarin Forms', 'WinForms']
    },
    {
      title: 'Data & ORM',
      description: 'EF Core, NHibernate, Dapper. Проектирование и оптимизация работы с данными в .NET приложениях.',
      tags: ['EF Core', 'NHibernate', 'Dapper', 'LINQ']
    },
    {
      title: 'Database',
      description: 'MS SQL Server (Microsoft Certified Professional, 40-461, 40-462). DBA/DBD с глубоким пониманием архитектуры СУБД.',
      tags: ['MS SQL', 'T-SQL', 'Query Optimization', 'DBA']
    },
    {
      title: 'Data Warehouse & BI',
      description: 'Clickhouse, MS SQL, Postgres. Проектирование хранилищ данных, ETL-процессы, SSAS, SSIS, Power BI.',
      tags: ['DWH', 'ETL', 'SSAS', 'SSIS', 'Power BI', 'Clickhouse']
    },
    {
      title: 'Compilers & Languages',
      description: 'Разработка компиляторов и предметно-ориентированных языков. Проектирование приложений на основе метаданных.',
      tags: ['Compiler Design', 'DSL', 'Metadata', 'Language Design']
    },
    {
      title: 'Languages',
      description: 'Русский (родной), English (Pre-Intermediate). Уверенное чтение технической документации на английском.',
      tags: ['Russian', 'English']
    }
  ];

  return (
    <section id="about">
      <h2>Навыки и технологии</h2>
      <div className="grid">
        {skills.map((skill, index) => (
          <div key={index} className="card" tabIndex={0}>
            <h3>{skill.title}</h3>
            <p>{skill.description}</p>
            <div className="tech-stack">
              {skill.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="tech-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
