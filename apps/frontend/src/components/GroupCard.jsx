import { Link } from "react-router-dom";

function GroupCard({ group }) {
  const memberCount = group.members?.length ?? 0;
  const expenseCount = group.expenses?.length ?? 0;

  return (
    <article className="group-card">
      <div className="group-card-content">
        <h3>{group.name}</h3>

        <p>
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>

        <p>
          {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
        </p>
      </div>

      <Link to={`/groups/${group.id}`} className="button">
        View Group
      </Link>
    </article>
  );
}

export default GroupCard;
