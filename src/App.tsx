import { relative } from 'path';
import React from 'react';
import useLocalStorage from 'use-local-storage';

import './App.css';
import Cube from './components/cube/cube';
import Toggle from './components/toggle/toggle';
import Nav from './components/nav/nav';
import Card from './components/card/card';
import Content from './components/content/content';

function App() {

  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');
  const currentTheme = () => { return theme }

  const switchTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  var cubeStyles = {
    // position: 'absolute',
    // top: '100px'
  } as React.CSSProperties;

  return (
    <div className="App" data-theme={theme}>

      {/* <button onClick={switchTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'}
      </button> */}

      <Nav switchTheme={switchTheme} currentTheme={currentTheme} />
      <div className='app_content'>
        <Card />
        <Content />

        {/* <div style={cubeStyles}>
          <Cube />
        </div> */}
      </div>
    </div>
  );
}

export default App;
