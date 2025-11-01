import React from 'react';
import './Tag.css';

interface TagProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ children, icon }) => {
  return (
    <span className="tag">
      {icon && <span className="tag-icon">{icon}</span>}
      {children}
    </span>
  );
};
