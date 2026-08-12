import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/dashboard">Expense Splitter</NavLink>
      </div>

      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/groups"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Groups
        </NavLink>

        <NavLink
          to="/friends"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Friends
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Notifications
        </NavLink>

        <NavLink
          to="/join-group"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Join Group
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
