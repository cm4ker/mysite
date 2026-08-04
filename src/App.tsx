import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import Aquarium, { MINI_FISH } from "./components/Aquarium";
import { profile } from "./data/entries";

type Theme = "light" | "dark";

function readInitialTheme(): Theme {
  const saved = localStorage.getItem("mysite-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [scrolled, setScrolled] = useState(false);
  const [aquarium, setAquarium] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mysite-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <Router>
      <Aquarium active={aquarium} />

      <header className={`topbar${scrolled ? " topbar--scrolled" : ""}`}>
        <div className="topbar-inner">
          <div className="left">
            <Link to="/">{profile.name.toLowerCase()}</Link>
          </div>
          <div className="right">
            <button onClick={toggleTheme} title="Тема">
              {theme}
            </button>
            <button
              className={`fish-btn${aquarium ? " fish-btn--on" : ""}`}
              onClick={() => setAquarium((a) => !a)}
              title="Аквариум"
              aria-label="Аквариум"
              aria-pressed={aquarium}
            >
              {MINI_FISH}
            </button>
          </div>
        </div>
      </header>

      <div className="page">
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
          </Routes>
        </main>

        <footer className="site-footer">© {new Date().getFullYear()}</footer>
      </div>
    </Router>
  );
};

export default App;
