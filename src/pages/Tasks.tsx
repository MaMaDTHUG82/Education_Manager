import { useMemo, useState } from "react";
import { useApp, type Task } from "../AppContext";

function formatTaskDate(dateString: string) {
  if (!dateString) {
    return "No date";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTaskTime(timeString: string) {
  if (!timeString) {
    return "";
  }

  const [hoursString, minutesString] =
    timeString.split(":");

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return timeString;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(
    minutes,
  ).padStart(2, "0")} ${suffix}`;
}

function getTaskDateTime(task: Task) {
  return new Date(
    `${task.dueDate}T${
      task.dueTime || "23:59"
    }`,
  );
}

function isTaskOverdue(task: Task) {
  if (task.completed) {
    return false;
  }

  return (
    getTaskDateTime(task).getTime() <
    Date.now()
  );
}

function getCategoryLabel(
  category: Task["category"],
) {
  switch (category) {
    case "lesson":
      return "Lesson";

    case "exam":
      return "Exam";

    case "grading":
      return "Grading";

    case "student":
      return "Student";

    case "class":
      return "Class";

    case "assignment":
      return "Assignment";

    default:
      return "Other";
  }
}

function getPriorityLabel(
  priority: Task["priority"],
) {
  switch (priority) {
    case "urgent":
      return "Urgent";

    case "high":
      return "High";

    case "normal":
      return "Normal";

    case "low":
      return "Low";

    default:
      return priority;
  }
}

function TaskDetailsModal({
  task,
  onClose,
  onComplete,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const overdue = isTaskOverdue(task);

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    onDelete(task.id);
    onClose();
  };

  return (
    <div
      className="task-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="task-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="task-modal-header">
          <div>
            <span className="task-modal-label">
              TASK DETAILS
            </span>

            <h2>{task.title}</h2>
          </div>

          <button
            type="button"
            className="task-modal-close"
            onClick={onClose}
            aria-label="Close task details"
          >
            ×
          </button>
        </div>

        <div className="task-modal-body">
          <div className="task-detail-row">
            <span>Category</span>

            <strong>
              {getCategoryLabel(
                task.category,
              )}
            </strong>
          </div>

          <div className="task-detail-row">
            <span>Priority</span>

            <strong
              className={`task-priority task-priority-${task.priority}`}
            >
              {getPriorityLabel(
                task.priority,
              )}
            </strong>
          </div>

          <div className="task-detail-row">
            <span>Date</span>

            <strong>
              {formatTaskDate(
                task.dueDate,
              )}
            </strong>
          </div>

          <div className="task-detail-row">
            <span>Time</span>

            <strong>
              {formatTaskTime(
                task.dueTime,
              )}
            </strong>
          </div>

          {task.description && (
            <div className="task-detail-description">
              <span>Description</span>

              <p>
                {task.description}
              </p>
            </div>
          )}

          {task.tags &&
            task.tags.length > 0 && (
              <div className="task-detail-tags">
                <span>Tags</span>

                <div>
                  {task.tags.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="task-tag"
                      >
                        #{tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

          {task.completed && (
            <div className="task-completed-message">
              ✓ This task has been completed.
            </div>
          )}

          {!task.completed &&
            overdue && (
              <div className="task-overdue-message">
                This task is overdue.
              </div>
            )}
        </div>

        <div className="task-modal-footer">
          {!task.completed &&
            overdue && (
              <button
                type="button"
                className="task-done-button"
                onClick={() =>
                  onComplete(task.id)
                }
              >
                Done
              </button>
            )}

          <button
            type="button"
            className="task-delete-button"
            onClick={handleDelete}
          >
            Delete
          </button>

          <button
            type="button"
            className="task-cancel-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const {
    tasks,
    completeTask,
    deleteTask,
  } = useApp();

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<Task | null>(null);

  const now = Date.now();

  const upcomingTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            !task.completed &&
            getTaskDateTime(
              task,
            ).getTime() >= now,
        )
        .sort(
          (a, b) =>
            getTaskDateTime(
              a,
            ).getTime() -
            getTaskDateTime(
              b,
            ).getTime(),
        ),
    [tasks, now],
  );

  const overdueTasks = useMemo(
    () =>
      tasks
        .filter((task) =>
          isTaskOverdue(task),
        )
        .sort(
          (a, b) =>
            getTaskDateTime(
              a,
            ).getTime() -
            getTaskDateTime(
              b,
            ).getTime(),
        ),
    [tasks, now],
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) => task.completed,
        )
        .sort(
          (a, b) =>
            b.createdAt -
            a.createdAt,
        ),
    [tasks],
  );

  const handleComplete = (
    taskId: number,
  ) => {
    completeTask(taskId);
    setSelectedTask(null);
  };

  const handleDelete = (
    taskId: number,
  ) => {
    deleteTask(taskId);
  };

  const renderTaskCard = (
    task: Task,
  ) => {
    const overdue =
      isTaskOverdue(task);

    return (
      <button
        type="button"
        key={task.id}
        className={`task-card ${
          task.completed
            ? "task-card-completed"
            : overdue
              ? "task-card-overdue"
              : ""
        }`}
        onClick={() =>
          setSelectedTask(task)
        }
      >
        <div className="task-card-top">
          <div className="task-card-status">
            <span
              className={`task-status-dot ${
                task.completed
                  ? "completed"
                  : overdue
                    ? "overdue"
                    : "pending"
              }`}
            />

            <span>
              {task.completed
                ? "Completed"
                : overdue
                  ? "Overdue"
                  : "Upcoming"}
            </span>
          </div>

          <span className="task-card-arrow">
            →
          </span>
        </div>

        <h3>{task.title}</h3>

        {task.description && (
          <p>{task.description}</p>
        )}

        <div className="task-card-meta">
          <span className="task-meta-item">
            {getCategoryLabel(
              task.category,
            )}
          </span>

          <span className="task-meta-item">
            {formatTaskDate(
              task.dueDate,
            )}
          </span>

          {task.dueTime && (
            <span className="task-meta-item">
              {formatTaskTime(
                task.dueTime,
              )}
            </span>
          )}
        </div>

        {task.tags &&
          task.tags.length > 0 && (
            <div className="task-card-tags">
              {task.tags
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={tag}
                    className="task-tag"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          )}
      </button>
    );
  };

  return (
    <div className="page tasks-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            WORKSPACE
          </p>

          <h2>Tasks</h2>

          <p className="page-description">
            Keep track of everything you
            need to do.
          </p>
        </div>

        <div className="tasks-summary">
          <span>
            Pending
          </span>

          <strong>
            {
              upcomingTasks.length +
              overdueTasks.length
            }
          </strong>
        </div>
      </header>

      {tasks.length === 0 ? (
        <div className="panel task-empty-state">
          <div className="task-empty-icon">
            ✓
          </div>

          <h3>No tasks yet</h3>

          <p>
            Tasks you create will appear
            here.
          </p>
        </div>
      ) : (
        <div className="tasks-dashboard">
          {overdueTasks.length > 0 && (
            <section className="tasks-section">
              <div className="tasks-section-header">
                <div>
                  <h3>
                    Overdue
                  </h3>

                  <span>
                    Tasks that need your
                    attention
                  </span>
                </div>

                <span className="task-count overdue-count">
                  {overdueTasks.length}
                </span>
              </div>

              <div className="tasks-list">
                {overdueTasks.map(
                  renderTaskCard,
                )}
              </div>
            </section>
          )}

          <section className="tasks-section">
            <div className="tasks-section-header">
              <div>
                <h3>
                  Upcoming
                </h3>

                <span>
                  Your next tasks
                </span>
              </div>

              <span className="task-count">
                {upcomingTasks.length}
              </span>
            </div>

            {upcomingTasks.length >
            0 ? (
              <div className="tasks-list">
                {upcomingTasks.map(
                  renderTaskCard,
                )}
              </div>
            ) : (
              <div className="task-section-empty">
                No upcoming tasks.
              </div>
            )}
          </section>

          {completedTasks.length >
            0 && (
            <section className="tasks-section">
              <div className="tasks-section-header">
                <div>
                  <h3>
                    Completed
                  </h3>

                  <span>
                    Finished tasks
                  </span>
                </div>

                <span className="task-count completed-count">
                  {
                    completedTasks.length
                  }
                </span>
              </div>

              <div className="tasks-list">
                {completedTasks.map(
                  renderTaskCard,
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() =>
            setSelectedTask(null)
          }
          onComplete={
            handleComplete
          }
          onDelete={
            handleDelete
          }
        />
      )}
    </div>
  );
}