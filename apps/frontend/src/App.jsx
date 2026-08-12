import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Groups from "./pages/Groups.jsx";
import GroupDetails from "./pages/GroupDetails.jsx";
import ExpenseDetails from "./pages/ExpenseDetails.jsx";
import Friends from "./pages/Friends.jsx";
import Navbar from "./components/Navbar.jsx";
import Notifications from "./pages/Notifications.jsx";
import JoinGroup from "./pages/JoinGroup.jsx";
import CreateGroup from "./pages/CreateGroup.jsx";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/groups" element={<Groups />} />

        <Route path="/groups/new" element={<CreateGroup />} />

        <Route path="/groups/:id" element={<GroupDetails />} />

        <Route path="/expenses/:id" element={<ExpenseDetails />} />

        <Route path="/friends" element={<Friends />} />

        <Route path="/notifications" element={<Notifications />} />

        <Route path="/join-group" element={<JoinGroup />} />

      </Routes>
    </>
  );
}

export default App;
