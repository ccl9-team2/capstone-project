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
      </div>
    </nav>
  );
}

export default Navbar;
