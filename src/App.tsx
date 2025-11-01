import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/nav/nav';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import Footer from './components/footer/Footer';
import CommandPalette from './components/command-palette/CommandPalette';
import KeyboardHint from './components/keyboard-hint/KeyboardHint';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const switchTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleCommandPalette = () => {
    setCommandPaletteOpen(prev => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Skip if typing in input/textarea or command palette is open
      const isTyping = document.activeElement?.tagName === 'TEXTAREA' || 
                       document.activeElement?.tagName === 'INPUT';
      
      if (isTyping || commandPaletteOpen) {
        return;
      }

      // Navigation shortcuts
      const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
          const headerHeight = 60;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      };

      // Handle keyboard shortcuts
      switch(e.key.toLowerCase()) {
        case 't':
          switchTheme();
          break;
        case 'm':
          scrollToSection('microblog');
          break;
        case 'e':
          scrollToSection('experience');
          break;
        case 'c':
          scrollToSection('contact');
          break;
        case 'h':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
      }

      // Close on Escape
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  return (
    <Router>
      <div className="App" data-theme={theme}>
        <KeyboardHint />
        <Header 
          theme={theme} 
          switchTheme={switchTheme} 
          onSearchClick={toggleCommandPalette}
        />
        
        <main>
          <Routes>
            <Route path="/" element={<div className="container"><HomePage /></div>} />
            <Route path="/post/:id" element={<PostPage />} />
          </Routes>
        </main>

        <Footer />
        
        <CommandPalette 
          isOpen={commandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)}
          switchTheme={switchTheme}
        />
      </div>
    </Router>
  );
}

export default App;
