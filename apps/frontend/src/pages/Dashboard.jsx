import { useEffect, useState } from "react";
import { getUsers } from "../api/users.js";
import { getGroups } from "../api/groups.js";
import { getExpenses } from "../api/expenses.js";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [usersData, groupsData, expensesData] = await Promise.all([
          getUsers(),
          getGroups(),
          getExpenses(),
        ]);

        setUsers(usersData);
        setGroups(groupsData);
        setExpenses(expensesData);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  return (
    <main>
      <h1>Expense Splitter</h1>

      <p>Welcome to your dashboard!</p>

      <section>
        <h2>Overview</h2>

        <div>
          <h3>Users</h3>
          <p>{users.length}</p>
        </div>

        <div>
          <h3>Groups</h3>
          <p>{groups.length}</p>
        </div>

        <div>
          <h3>Expenses</h3>
          <p>{expenses.length}</p>
        </div>

        <div>
          <h3>Total Spent</h3>
          <p>${totalExpenses.toFixed(2)}</p>
        </div>
      </section>

      <section>
        <h2>Your Groups</h2>

        {groups.length === 0 ? (
          <p>No groups yet.</p>
        ) : (
          groups.map((group) => (
            <div key={group.id}>
              <h3>{group.name}</h3>

              <p>Members: {group.members?.length ?? 0}</p>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Recent Expenses</h2>

        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          expenses.slice(0, 5).map((expense) => (
            <div key={expense.id}>
              <h3>{expense.description}</h3>

              <p>${Number(expense.amount).toFixed(2)}</p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default Dashboard;
