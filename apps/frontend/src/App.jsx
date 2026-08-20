import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Groups from "./pages/Groups.jsx";
import GroupDetails from "./pages/GroupDetails.jsx";
import ExpenseDetails from "./pages/ExpenseDetails.jsx";
import Friends from "./pages/Friends.jsx";
import Notifications from "./pages/Notifications.jsx";
import JoinGroup from "./pages/JoinGroup.jsx";
import CreateGroup from "./pages/CreateGroup.jsx";
import CreateExpense from "./pages/CreateExpense.jsx";
import Profile from "./pages/Profile.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Navbar from "./components/Navbar.jsx";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* LOGIN / REGISTRATION */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        {/* 🟢 PROFILE */}

        <Route path="/profile" element={<Profile />} />

        <Route path="/groups" element={<Groups />} />

        <Route path="/groups/new" element={<CreateGroup />} />

        <Route path="/groups/:id/expenses/new" element={<CreateExpense />} />

        <Route path="/groups/:id" element={<GroupDetails />} />

        <Route path="/expenses/:id" element={<ExpenseDetails />} />

        <Route path="/friends" element={<Friends />} />

        <Route path="/notifications" element={<Notifications />} />

        <Route path="/join-group" element={<JoinGroup />} />

        {/* UNKNOWN ROUTES */}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
