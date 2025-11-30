import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/nav/nav";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import Footer from "./components/footer/Footer";
import CommandPalette from "./components/command-palette/CommandPalette";
import KeyboardHint from "./components/keyboard-hint/KeyboardHint";
import GridAnimation from "./components/grid-animation";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userSetTheme, setUserSetTheme] = useState<boolean>(() => {
    return localStorage.getItem("userSetTheme") === "true";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Отслеживание изменений системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Только если пользователь не устанавливал тему вручную
      if (!userSetTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    // Для современных браузеров
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [userSetTheme]);

  const switchTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setUserSetTheme(true);
    localStorage.setItem("userSetTheme", "true");
  };

  const toggleCommandPalette = () => {
    setCommandPaletteOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette toggle
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Close command palette on Escape
      if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
        return;
      }

      // Skip if typing in input/textarea or command palette is open
      const isTyping =
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT";

      if (isTyping || commandPaletteOpen) {
        return;
      }

      // Navigation shortcuts
      const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
          const headerHeight = 60;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      };

      // Handle keyboard shortcuts
      switch (e.code) {
        case "KeyT":
          switchTheme();
          break;
        case "KeyM":
          scrollToSection("microblog");
          break;
        case "KeyE":
          scrollToSection("experience");
          break;
        case "KeyC":
          scrollToSection("contact");
          break;
        case "KeyH":
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen]);

  return (
    <Router>
      <div className="App" data-theme={theme}>
        <GridAnimation />
        <KeyboardHint />
        <Header
          theme={theme}
          switchTheme={switchTheme}
          onSearchClick={toggleCommandPalette}
        />

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div className="container">
                  <HomePage />
                </div>
              }
            />
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
