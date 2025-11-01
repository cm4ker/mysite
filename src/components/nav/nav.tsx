import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './nav.css';
import me from '../../me.jpg';

interface NavProps {
  theme: 'light' | 'dark';
  switchTheme: () => void;
  onSearchClick: () => void;
}

const Nav: React.FC<NavProps> = ({ theme, switchTheme, onSearchClick }) => {
  return (
    <header>
      <div className="container">
        <nav>
          <button className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={me} alt="Nikita Zenkov" className="logo-avatar" />
            <span className="logo-name">Никита Зенков</span>
          </button>
          <div className="nav-actions">
            <button
              className="search-button"
              onClick={onSearchClick}
              aria-label="Поиск"
              title="Поиск"
            >
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span className="search-kbd">
                <kbd>Ctrl</kbd>
                <kbd>K</kbd>
              </span>
            </button>
            <button
              className="theme-toggle"
              onClick={switchTheme}
              aria-label="Переключить тему"
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              <FontAwesomeIcon icon={['fas', theme === 'dark' ? 'sun' : 'moon']} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Nav;