import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import './CommandPalette.css';

interface Command {
  label: string;
  action: () => void;
  icon: [IconPrefix, IconName];
  key: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  switchTheme: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, switchTheme }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 60; // Высота хедера
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      onClose();
    }
  };

  const commands: Command[] = [
    { label: 'О себе', action: () => scrollToSection('about'), icon: ['fas', 'user'], key: '1' },
    { label: 'Микроблог', action: () => scrollToSection('microblog'), icon: ['fas', 'rss'], key: '2' },
    { label: 'Опыт работы', action: () => scrollToSection('experience'), icon: ['fas', 'briefcase'], key: '3' },
    { label: 'Контакты', action: () => scrollToSection('contact'), icon: ['fas', 'envelope'], key: '4' },
    { label: 'Сменить тему', action: () => { switchTheme(); onClose(); }, icon: ['fas', 'cog'], key: 't' },
    { label: 'GitHub', action: () => { window.open('https://github.com/cm4ker', '_blank'); onClose(); }, icon: ['fab', 'github'], key: 'g' },
    { label: 'Telegram', action: () => { window.open('https://t.me/cm4ker', '_blank'); onClose(); }, icon: ['fab', 'telegram'], key: 'l' },
    { label: 'Наверх', action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); onClose(); }, icon: ['fas', 'arrow-up'], key: 'h' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay active" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-header">
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Поиск команд и навигация..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <div className="command-count">
              {filteredCommands.length} {filteredCommands.length === 1 ? 'результат' : 'результатов'}
            </div>
          )}
        </div>
        <div className="command-results">
          {filteredCommands.length === 0 ? (
            <div className="command-no-results">
              <span className="no-results-icon">
                <FontAwesomeIcon icon={['fas', 'search']} size="2x" />
              </span>
              <p>Ничего не найдено</p>
              <small>Попробуйте другой запрос</small>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={index}
                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={cmd.action}
              >
                <div className="command-item-label">
                  <span className="command-item-icon">
                    <FontAwesomeIcon icon={cmd.icon} />
                  </span>
                  <span>{cmd.label}</span>
                </div>
                <span className="command-item-key">{cmd.key}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
