import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="container">
        <ul className="social-links">
          <li>
            <a href="https://github.com/cm4ker" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FontAwesomeIcon icon={['fab', 'github']} />
              <span>GitHub</span>
            </a>
          </li>
          <li>
            <a href="https://t.me/cm4ker" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <FontAwesomeIcon icon={['fab', 'telegram']} />
              <span>Telegram</span>
            </a>
          </li>
          <li>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FontAwesomeIcon icon={['fab', 'twitter']} />
              <span>Twitter</span>
            </a>
          </li>
        </ul>
        <p>© 2025 Никита Зенков. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
