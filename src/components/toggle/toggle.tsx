
import React from 'react';
import './toggle.css'

interface ToggleProps {
    isToggled?: boolean;
    onToggle? : (params: any) => any;
  }

const Toggle = ({ isToggled = false, onToggle = ()=> {}} : ToggleProps) => {
    return (
        <label className='switch'>
            <input type={"checkbox"} checked={isToggled} onChange={onToggle} />
            <span className='slider' />
        </label>
    );
}

export default Toggle;