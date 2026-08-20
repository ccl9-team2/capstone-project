import { Link, NavLink } from "react-router-dom";

import { useEffect, useState } from "react";

function Navbar() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("uome-theme") === "dark";
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );

    localStorage.setItem("uome-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function getNavLinkClass({ isActive }) {
    return isActive ? "nav-link active" : "nav-link";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  return (
    <header className="app-header">
      <nav className="navbar" aria-label="Main navigation">
        {/* ========================= */}
        {/* 🟢 BRAND */}
        {/* ========================= */}

        <Link to="/dashboard" className="brand" onClick={closeMenu}>
          UOME
        </Link>

        {/* ========================= */}
        {/* 🟢 NAVIGATION LINKS */}
        {/* ========================= */}

        <div className={menuOpen ? "navbar-links open" : "navbar-links"}>
          <NavLink
            to="/dashboard"
            className={getNavLinkClass}
            onClick={closeMenu}
          >
            Dashboard
          </NavLink>

          <NavLink to="/groups" className={getNavLinkClass} onClick={closeMenu}>
            Groups
          </NavLink>

          <NavLink
            to="/friends"
            className={getNavLinkClass}
            onClick={closeMenu}
          >
            Friends
          </NavLink>

          <NavLink
            to="/notifications"
            className={getNavLinkClass}
            onClick={closeMenu}
          >
            Notifications
          </NavLink>

          <NavLink
            to="/join-group"
            className={getNavLinkClass}
            onClick={closeMenu}
          >
            Join Group
          </NavLink>

          <NavLink
            to="/profile"
            className={getNavLinkClass}
            onClick={closeMenu}
          >
            Profile
          </NavLink>

          <NavLink to="/login" className={getNavLinkClass} onClick={closeMenu}>
            Login
          </NavLink>
        </div>

        {/* ========================= */}
        {/* 🟢 MOBILE CONTROLS */}
        {/* ========================= */}

        <div className="navbar-controls">
          <button
            type="button"
            className="theme-toggle mobile-theme-toggle"
            onClick={toggleTheme}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? "☀ Light" : "☾ Dark"}
          </button>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
