import { Link } from "react-router-dom";

function GroupCard({ group }) {
  const memberCount = group.members?.length ?? 0;

  const expenseCount = group.expenses?.length ?? 0;

  return (
    <article className="group-card professional-group-card">
      <div className="group-card-content">
        <h3>{group.name}</h3>

        <div className="group-card-meta">
          <span>
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>

          <span>
            {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
          </span>
        </div>
      </div>

      <div className="group-card-footer">
        <Link
          to={`/groups/${group.id}`}
          className="secondary-button group-card-view-button"
        >
          View Group
        </Link>
      </div>
    </article>
  );
}

export default GroupCard;
