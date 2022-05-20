import React, { MouseEventHandler, useState } from "react";
import Clock from '../clock/clock';
import './nav.css';

import useLocalStorage from 'use-local-storage';
import Toggle from "../toggle/toggle";

interface NavProps {
    switchTheme: MouseEventHandler,
    currentTheme: Function
}

const Nav = ({ switchTheme, currentTheme }: NavProps) => {

    return (
        <div className="nav">
            
            <div style={{float:"right"}}>
                <div>
                    <div>Time: </div>
                    <Clock />
                </div>
                <div style={{margin: "0 0 0 20px"}}>
                    <div>Dark mode: </div>
                    <Toggle isToggled={currentTheme() === 'dark'} onToggle={switchTheme} />
                </div>
            </div>
        </div>)
}


export default Nav;