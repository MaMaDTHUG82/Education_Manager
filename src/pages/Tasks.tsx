import { useApp } from "../AppContext";

function Tasks() {
  const { tasks } = useApp();

  return (
    <div className="tasks-page">
      <h1>Tasks</h1>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="task-card"
          >
            <h3>{task.title}</h3>

            <p>
              {task.description}
            </p>

            <p>
              {task.dueDate}{" "}
              {task.dueTime}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Tasks;