import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './IconExample.css';

const IconExample: React.FC = () => {
  return (
    <div className="icon-example">
      <h2>Font Awesome Pro Icons Example</h2>
      
      <div className="icon-grid">
        <div className="icon-item">
          <FontAwesomeIcon icon={['fas', 'rocket']} size="2x" />
          <span>Rocket</span>
        </div>
        
        <div className="icon-item">
          <FontAwesomeIcon icon={['fas', 'code']} size="2x" />
          <span>Code</span>
        </div>
        
        <div className="icon-item">
          <FontAwesomeIcon icon={['fas', 'laptop-code']} size="2x" />
          <span>Laptop Code</span>
        </div>
        
        <div className="icon-item">
          <FontAwesomeIcon icon={['far', 'heart']} size="2x" />
          <span>Heart (Regular)</span>
        </div>
        
        <div className="icon-item">
          <FontAwesomeIcon icon={['fal', 'lightbulb']} size="2x" />
          <span>Lightbulb (Light)</span>
        </div>
        
        <div className="icon-item">
          <FontAwesomeIcon icon={['fab', 'github']} size="2x" />
          <span>GitHub</span>
        </div>
        
        <div className="icon-item">
          <FontAwesomeIcon icon={['fab', 'react']} size="2x" spin />
          <span>React (Spinning)</span>
        </div>
        
        <div className="icon-item">
          <FontAwesomeIcon icon={['fas', 'star']} size="2x" className="gold" />
          <span>Star</span>
        </div>
      </div>
    </div>
  );
};

export default IconExample;
