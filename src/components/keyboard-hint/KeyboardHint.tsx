import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './KeyboardHint.css';

const KeyboardHint: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Проверяем, была ли подсказка уже показана
    const hasSeenHint = localStorage.getItem('keyboardHintDismissed');
    if (!hasSeenHint) {
      // Показываем через 2 секунды после загрузки
      const timer = setTimeout(() => setVisible(true), 2000);
      // Автоматически скрываем через 8 секунд
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setDismissed(true);
      }, 10000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    } else {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('keyboardHintDismissed', 'true');
  };

  if (dismissed || !visible) return null;

  return (
    <div className={`keyboard-hint ${visible ? 'visible' : ''}`}>
      <div className="hint-content">
        <span className="hint-icon">
          <FontAwesomeIcon icon={['fal', 'lightbulb']} />
        </span>
        <span className="hint-text">
          Нажмите <kbd>Ctrl</kbd> + <kbd>K</kbd> для навигации, <kbd>E</kbd> для опыта или <kbd>M</kbd> для микроблога
        </span>
        <button className="hint-dismiss" onClick={handleDismiss} aria-label="Закрыть">
          <FontAwesomeIcon icon={['fas', 'times']} />
        </button>
      </div>
    </div>
  );
};

export default KeyboardHint;
