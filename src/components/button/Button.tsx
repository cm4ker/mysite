import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import './Button.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: [IconPrefix, IconName];
  kbd?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  children,
  onClick,
  href,
  icon,
  kbd,
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const classes = `btn btn-${variant} ${className}`.trim();

  const content = (
    <>
      {icon && <FontAwesomeIcon icon={icon} />}
      <span>{children}</span>
      {kbd && <kbd className="btn-kbd">{kbd}</kbd>}
    </>
  );

  if (href) {
    return (
      <a 
        href={href} 
        className={classes}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <button 
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default Button;
