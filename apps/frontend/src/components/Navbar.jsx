import { useEffect, useState } from "react";

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("uome-theme") === "dark";
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // =========================
  // THEME
  // =========================

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );

    localStorage.setItem("uome-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // =========================
  // LOGIN STATUS
  // =========================

  // 🟢 Re-check login whenever the route changes.
  // After Login navigates to /dashboard,
  // the navbar automatically changes
  // from Login to Logout.
  useEffect(() => {
    const user = localStorage.getItem("uome-user");
    const token = localStorage.getItem("uome-token");

    setIsLoggedIn(Boolean(user && token));
  }, [location.pathname]);

  function getNavLinkClass({ isActive }) {
    return isActive ? "nav-link active" : "nav-link";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    // 🟢 Remove authentication information.
    localStorage.removeItem("uome-user");
    localStorage.removeItem("uome-token");

    setIsLoggedIn(false);
    closeMenu();

    // 🟢 Return to login page.
    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="app-header">
      <nav className="navbar" aria-label="Main navigation">
        {/* ========================= */}
        {/* BRAND */}
        {/* ========================= */}

        <Link
          to={isLoggedIn ? "/dashboard" : "/login"}
          className="brand"
          onClick={closeMenu}
        >
          UOME
        </Link>

        {/* ========================= */}
        {/* NAVIGATION LINKS */}
        {/* ========================= */}

        <div className={menuOpen ? "navbar-links open" : "navbar-links"}>
          {isLoggedIn ? (
            <>
              <NavLink
                to="/dashboard"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/groups"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
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

              {/* 🟢 LOGOUT */}
              <button type="button" className="nav-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* ========================= */}
        {/* MOBILE CONTROLS */}
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
