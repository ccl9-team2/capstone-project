import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Groups from "./pages/Groups.jsx";
import GroupDetails from "./pages/GroupDetails.jsx";
import Navbar from "./components/Navbar.jsx";
import ExpenseDetails from "./pages/ExpenseDetails.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/groups" element={<Groups />} />

        <Route path="/groups/:id" element={<GroupDetails />} />

        <Route path="/expenses/:id" element={<ExpenseDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
