import { useMemo, useState } from "react";
import "../styles/dashboard.css";
import {
  useApp,
  type Task,
  type TaskCategory,
  type TaskPriority,
} from "../../AppContext";


interface DashboardStudent {
  id: number;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  birthDate: string;

  attendance?: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };

  attendanceRecords?: {
    date: string;
    present: boolean;
  }[];

  assignments?: {
    id: number;
    title: string;
    description: string;
    dueDate: string;
  }[];
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHORT_DAY_NAMES = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatTime(time: string) {
  const [hoursString, minutes] =
    time.split(":");

  const hours = Number(hoursString);
  const minutesNumber = Number(minutes);

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${String(
    minutesNumber,
  ).padStart(2, "0")} ${suffix}`;
}

function formatDate(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function getNextClassDate(
  dayOfWeek: number,
  startTime: string,
  now: Date,
) {
  const [hoursString, minutesString] =
    startTime.split(":");

  const targetHours = Number(hoursString);
  const targetMinutes = Number(minutesString);

  const result = new Date(now);

  let daysUntil =
    (dayOfWeek - now.getDay() + 7) % 7;

  result.setDate(
    now.getDate() + daysUntil,
  );

  result.setHours(
    targetHours,
    targetMinutes,
    0,
    0,
  );

  // If today's class has already started,
  // move it to next week's occurrence.
  if (
    result.getTime() <= now.getTime()
  ) {
    result.setDate(
      result.getDate() + 7,
    );
  }

  return result;
}

function getRelativeDateLabel(
  date: Date,
  now: Date,
) {
  const todayKey = getDateKey(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(
    tomorrow.getDate() + 1,
  );

  const tomorrowKey =
    getDateKey(tomorrow);

  const dateKey = getDateKey(date);

  if (dateKey === todayKey) {
    return "Today";
  }

  if (dateKey === tomorrowKey) {
    return "Tomorrow";
  }

  return DAY_NAMES[date.getDay()];
}

export default function Dashboard() {
  const {
    classes,
    activities,
    tasks,
    
    deleteTask,
    addTask,
  } = useApp();

  const now = new Date();

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<Task | null>(null);

  const [showCreateTask, setShowCreateTask] =
    useState(false);

  const [taskTitle, setTaskTitle] =
    useState("");

  const [taskDescription, setTaskDescription] =
    useState("");

  const [taskDueDate, setTaskDueDate] =
    useState("");

  const [taskDueTime, setTaskDueTime] =
    useState("");

  const [taskCategory, setTaskCategory] =
    useState<TaskCategory>("other");

  const [taskPriority, setTaskPriority] =
    useState<TaskPriority>("normal");

  const handleCreateTask = () => {
    if (!taskTitle.trim()) {
      return;
    }

    if (!taskDueDate) {
      return;
    }

    addTask({
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      dueDate: taskDueDate,
      dueTime: taskDueTime,
      category: taskCategory,
      priority: taskPriority,
      classId: undefined,
      studentId: undefined,
      tags: [],
    });

    setTaskTitle("");
    setTaskDescription("");
    setTaskDueDate("");
    setTaskDueTime("");
    setTaskCategory("other");
    setTaskPriority("normal");

    setShowCreateTask(false);
  };

  /*
   * --------------------------------------------------
   * BASIC STATISTICS
   * --------------------------------------------------
   */

  const totalClasses = classes.length;

  const totalStudents = classes.reduce(
    (total, classItem) =>
      total + classItem.students.length,
    0,
  );

  /*
   * --------------------------------------------------
   * ATTENDANCE
   * --------------------------------------------------
   */

  const attendanceStats = useMemo(() => {
    let present = 0;
    let total = 0;

    classes.forEach((classItem) => {
      classItem.students.forEach(
        (student) => {
          const typedStudent =
            student as DashboardStudent;

          if (
            typedStudent.attendanceRecords &&
            typedStudent.attendanceRecords
              .length > 0
          ) {
            typedStudent.attendanceRecords.forEach(
              (record) => {
                total += 1;

                if (record.present) {
                  present += 1;
                }
              },
            );

            return;
          }

          /*
           * Fallback to the summary attendance
           * object if attendanceRecords is not
           * available.
           */
          if (
            typedStudent.attendance &&
            typedStudent.attendance.total > 0
          ) {
            present +=
              typedStudent.attendance.present;

            total +=
              typedStudent.attendance.total;
          }
        },
      );
    });

    const percentage =
      total > 0
        ? Math.round(
          (present / total) * 100,
        )
        : null;

    return {
      present,
      total,
      percentage,
    };
  }, [classes]);

  /*
   * --------------------------------------------------
   * PENDING ASSIGNMENTS
   * --------------------------------------------------
   */
const pendingTasks = useMemo(() => {
  return tasks.filter(
    (task) => !task.completed
  ).length;
}, [tasks]);

  /*
   * --------------------------------------------------
   * CALENDAR
   * --------------------------------------------------
   */

  const calendarDays = useMemo(() => {
    const year =
      now.getFullYear();

    const month =
      now.getMonth();

    const firstDay = new Date(
      year,
      month,
      1,
    );

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    /*
     * Calendar is displayed Monday -> Sunday.
     *
     * JavaScript:
     * Sunday = 0
     * Monday = 1
     *
     * Convert Sunday-based index to
     * Monday-based index.
     */
    const firstDayMondayIndex =
      (firstDay.getDay() + 6) % 7;

    const days: (
      | number
      | null
    )[] = [];

    for (
      let index = 0;
      index < firstDayMondayIndex;
      index += 1
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      days.push(day);
    }

    return days;
  }, [
    now.getFullYear(),
    now.getMonth(),
  ]);
  /*
   * --------------------------------------------------
   * UPCOMING CLASSES
   * --------------------------------------------------
   */

  const upcomingClasses = useMemo(() => {
    const upcoming: {
      classId: number;
      className: string;
      subject: string;
      location: string;
      startTime: string;
      endTime: string;
      date: Date;
    }[] = [];

    classes.forEach((classItem) => {
      classItem.schedule.forEach((schedule) => {
        const nextDate = getNextClassDate(
          schedule.day,
          schedule.startTime,
          now,
        );

        upcoming.push({
          classId: classItem.id,
          className: classItem.name,
          subject: classItem.subject,
          location: classItem.location,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          date: nextDate,
        });
      });
    });

    return upcoming
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime(),
      )
      .slice(0, 5);
  }, [classes, now.getTime()]);


  /*
   * --------------------------------------------------
   * UPCOMING TASKS
   * --------------------------------------------------
   */

  const upcomingTasks = useMemo(() => {
    const now = new Date();

    const upcoming = tasks
      .filter((task) => {
        if (task.completed) {
          return false;
        }

        if (!task.dueDate) {
          return false;
        }

        const dueDateTime = task.dueTime
          ? new Date(
            `${task.dueDate}T${task.dueTime}`,
          )
          : new Date(
            `${task.dueDate}T23:59:59`,
          );

        return dueDateTime.getTime() >= now.getTime();
      })
      .sort((a, b) => {
        const aDate = new Date(
          `${a.dueDate}T${a.dueTime || "23:59"
          }`,
        ).getTime();

        const bDate = new Date(
          `${b.dueDate}T${b.dueTime || "23:59"
          }`,
        ).getTime();

        return aDate - bDate;
      })
      .slice(0, 5);

    return upcoming;
    return tasks
      .filter((task) => {
        if (task.completed) {
          return false;
        }

        const date = new Date(
          `${task.dueDate}T${task.dueTime || "23:59"}`,
        );

        return date.getTime() >= now.getTime();
      })
      .sort((a, b) => {
        const dateA = new Date(
          `${a.dueDate}T${a.dueTime || "23:59"}`,
        ).getTime();

        const dateB = new Date(
          `${b.dueDate}T${b.dueTime || "23:59"}`,
        ).getTime();

        return dateA - dateB;
      })
      .slice(0, 5);
  }, [tasks, now.getTime()]);

  return (
    <div className="page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="page-header">
        <div>
          <p className="eyebrow">
            OVERVIEW
          </p>

          <h2>Dashboard</h2>

          <p className="page-description">
            Welcome back. Here is an overview of your education workspace.
          </p>
        </div>

        <div className="dashboard-header-actions">

          <button
            type="button"
            className="create-task-button"
            onClick={() => {
              setShowCreateTask(true);
            }}
          >
            + Create Task
          </button>

          <div className="date-card">
            <span>Today</span>

            <strong>
              {formatDate(now)}
            </strong>
          </div>

        </div>
      </header>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            ▦
          </div>

          <div>
            <span>Total Classes</span>

            <strong>
              {totalClasses}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ◉
          </div>

          <div>
            <span>Students</span>

            <strong>
              {totalStudents}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ✓
          </div>

          <div>
            <span>Attendance</span>

            <strong>
              {attendanceStats.percentage !==
                null
                ? `${attendanceStats.percentage}%`
                : "—"}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            📝
          </div>

          <div>
            <span>Pending Tasks</span>

            <strong>
              {pendingTasks}
            </strong>
          </div>
        </div> 
      </section>

      {/* =====================================================
          CALENDAR + UPCOMING
          ===================================================== */}

      <section className="dashboard-grid">
        {/* ================= CALENDAR ================= */}

        <div className="panel calendar-panel">
          <div className="panel-header">
            <div>
              <h3>Calendar</h3>

              <span>
                {
                  MONTH_NAMES[
                  now.getMonth()
                  ]
                }{" "}
                {now.getFullYear()}
              </span>
            </div>

            <button
              className="icon-button"
              type="button"
              aria-label="Calendar options"
            >
              •••
            </button>
          </div>

          <div className="calendar">
            <div className="calendar-week">
              {SHORT_DAY_NAMES.map(
                (day) => (
                  <span key={day}>
                    {day}
                  </span>
                ),
              )}
            </div>

            <div className="calendar-days">
              {calendarDays.map(
                (day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="calendar-day empty"
                      />
                    );
                  }

                  const isToday =
                    day ===
                    now.getDate();

                  return (
                    <div
                      key={day}
                      className={`calendar-day ${isToday
                        ? "today"
                        : ""
                        }`}
                    >
                      {day}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* ================= UPCOMING ================= */}

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Upcoming</h3>

              <span>
                Next scheduled classes and tasks
              </span>
            </div>
          </div>

          <div className="activity-list">

            {/* ================= UPCOMING CLASSES ================= */}

            {upcomingClasses.map(
              (item, index) => (
                <div
                  className="activity"
                  key={`class-${item.classId}-${item.date.getTime()}-${index}`}
                >
                  <div
                    className={`activity-dot ${index % 4 === 0
                      ? "purple"
                      : index % 4 === 1
                        ? "blue"
                        : index % 4 === 2
                          ? "green"
                          : "orange"
                      }`}
                  />

                  <div>
                    <strong>
                      {item.className}
                    </strong>

                    <span>
                      {getRelativeDateLabel(
                        item.date,
                        now,
                      )}{" "}
                      ·{" "}
                      {formatTime(
                        item.startTime,
                      )}{" "}
                      -{" "}
                      {formatTime(
                        item.endTime,
                      )}
                    </span>

                    <small>
                      {item.subject} ·{" "}
                      {item.location}
                    </small>
                  </div>
                </div>
              ),
            )}

            {/* ================= UPCOMING TASKS ================= */}

            {upcomingTasks.map(
              (task, index) => (
                <div
                  className="activity"
                  key={`task-${task.id}`}
                >
                  <div
                    className={`activity-dot ${index % 4 === 0
                      ? "orange"
                      : index % 4 === 1
                        ? "purple"
                        : index % 4 === 2
                          ? "blue"
                          : "green"
                      }`}
                  />

                  <div>
                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      Task · {task.dueDate}
                      {task.dueTime
                        ? ` · ${task.dueTime}`
                        : ""}
                    </span>

                    {task.description && (
                      <small>
                        {task.description}
                      </small>
                    )}

                  {/*  <button
                      type="button"
                      className="task-complete-button"
                      onClick={() =>
                        completeTask(task.id)
                      }
                    >
                      Done
                    </button> */}
                  </div>
                </div>
              ),
            )}

            {/* ================= NOTHING UPCOMING ================= */}

            {upcomingClasses.length === 0 &&
              upcomingTasks.length === 0 && (
                <div className="recent-empty">
                  <span>
                    Nothing upcoming
                  </span>

                  <small>
                    Your upcoming classes and tasks
                    will appear here.
                  </small>
                </div>
              )}

          </div>
        </div>
      </section>


      {selectedTask && (
        <div
          className="task-modal-backdrop"
          onMouseDown={() =>
            setSelectedTask(null)
          }
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

                <h2>
                  {selectedTask.title}
                </h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() =>
                  setSelectedTask(null)
                }
              >
                ×
              </button>
            </div>

            <div className="task-modal-body">
              <div className="task-detail-row">
                <span>Category</span>

                <strong>
                  {selectedTask.category}
                </strong>
              </div>

              <div className="task-detail-row">
                <span>Date</span>

                <strong>
                  {formatDate(
                    new Date(
                      `${selectedTask.dueDate}T00:00:00`,
                    ),
                  )}
                </strong>
              </div>

              {selectedTask.dueTime && (
                <div className="task-detail-row">
                  <span>Time</span>

                  <strong>
                    {formatTime(
                      selectedTask.dueTime,
                    )}
                  </strong>
                </div>
              )}

              {selectedTask.description && (
                <div className="task-detail-description">
                  <span>
                    Description
                  </span>

                  <p>
                    {
                      selectedTask.description
                    }
                  </p>
                </div>
              )}

              {selectedTask.tags &&
                selectedTask.tags.length >
                0 && (
                  <div className="task-detail-tags">
                    <span>
                      Tags
                    </span>

                    <div>
                      {selectedTask.tags.map(
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
            </div>

            <div className="task-modal-footer">
              <button
                type="button"
                className="task-delete-button"
                onClick={() => {
                  const confirmed =
                    window.confirm(
                      "Are you sure you want to delete this task?",
                    );

                  if (!confirmed) {
                    return;
                  }

                  deleteTask(
                    selectedTask.id,
                  );

                  setSelectedTask(null);
                }}
              >
                Delete
              </button>

              <button
                type="button"
                className="task-cancel-button"
                onClick={() =>
                  setSelectedTask(null)
                }
              >
                Close
              </button>
            </div>
          </div>


          {showCreateTask && (
            <div
              className="task-modal-overlay"
              onMouseDown={(event) => {
                if (
                  event.target === event.currentTarget
                ) {
                  setShowCreateTask(false);
                }
              }}
            >
              <div className="task-modal">

                <div className="task-modal-header">
                  <div>
                    <span className="eyebrow">
                      TASK
                    </span>

                    <h3>Create Task</h3>

                    <p>
                      Add a reminder for yourself.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="task-modal-close"
                    onClick={() =>
                      setShowCreateTask(false)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="task-form">

                  <label>
                    Title

                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(event) =>
                        setTaskTitle(event.target.value)
                      }
                      placeholder="e.g. Prepare English exam"
                      autoFocus
                    />
                  </label>

                  <label>
                    Description

                    <textarea
                      value={taskDescription}
                      onChange={(event) =>
                        setTaskDescription(
                          event.target.value,
                        )
                      }
                      placeholder="What needs to be done?"
                      rows={4}
                    />
                  </label>

                  <div className="task-form-row">

                    <label>
                      Due date

                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(event) =>
                          setTaskDueDate(
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Due time

                      <input
                        type="time"
                        value={taskDueTime}
                        onChange={(event) =>
                          setTaskDueTime(
                            event.target.value,
                          )
                        }
                      />
                    </label>

                  </div>

                  <div className="task-form-row">

                    <label>
                      Category

                      <select
                        value={taskCategory}
                        onChange={(event) =>
                          setTaskCategory(
                            event.target.value as TaskCategory,
                          )
                        }
                      >
                        <option value="lesson">
                          Lesson
                        </option>

                        <option value="exam">
                          Exam
                        </option>

                        <option value="grading">
                          Grading
                        </option>

                        <option value="student">
                          Student
                        </option>

                        <option value="class">
                          Class
                        </option>

                        <option value="assignment">
                          Assignment
                        </option>

                        <option value="other">
                          Other
                        </option>
                      </select>
                    </label>

                    <label>
                      Priority

                      <select
                        value={taskPriority}
                        onChange={(event) =>
                          setTaskPriority(
                            event.target.value as TaskPriority,
                          )
                        }
                      >
                        <option value="low">
                          Low
                        </option>

                        <option value="normal">
                          Normal
                        </option>

                        <option value="high">
                          High
                        </option>

                        <option value="urgent">
                          Urgent
                        </option>
                      </select>
                    </label>

                  </div>

                </div>

                <div className="task-modal-footer">

                  <button
                    type="button"
                    className="task-cancel-button"
                    onClick={() =>
                      setShowCreateTask(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="task-save-button"
                    onClick={handleCreateTask}
                    disabled={
                      !taskTitle.trim() ||
                      !taskDueDate
                    }
                  >
                    Create Task
                  </button>

                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {showCreateTask && (
        <div
          className="task-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreateTask(false);
            }
          }}
        >
          <div
            className="task-modal"
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="task-modal-header">
              <div>
                <span className="task-modal-label">
                  CREATE TASK
                </span>

                <h2>
                  New Task
                </h2>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() => {
                  setShowCreateTask(false);
                }}
              >
                ×
              </button>
            </div>

            <div className="task-modal-body">

              <div className="task-form-group">
                <label>
                  Title
                </label>

                <input
                  type="text"
                  value={taskTitle}
                  onChange={(event) =>
                    setTaskTitle(event.target.value)
                  }
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="task-form-group">
                <label>
                  Description
                </label>

                <textarea
                  value={taskDescription}
                  onChange={(event) =>
                    setTaskDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Add some details..."
                  rows={4}
                />
              </div>

              <div className="task-form-row">

                <div className="task-form-group">
                  <label>
                    Due date
                  </label>

                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(event) =>
                      setTaskDueDate(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="task-form-group">
                  <label>
                    Due time
                  </label>

                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(event) =>
                      setTaskDueTime(
                        event.target.value,
                      )
                    }
                  />
                </div>

              </div>

              <div className="task-form-row">

                <div className="task-form-group">
                  <label>
                    Category
                  </label>

                  <select
                    value={taskCategory}
                    onChange={(event) =>
                      setTaskCategory(
                        event.target.value as TaskCategory,
                      )
                    }
                  >
                    <option value="lesson">
                      Lesson
                    </option>

                    <option value="exam">
                      Exam
                    </option>

                    <option value="grading">
                      Grading
                    </option>

                    <option value="student">
                      Student
                    </option>

                    <option value="class">
                      Class
                    </option>

                    <option value="assignment">
                      Assignment
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="task-form-group">
                  <label>
                    Priority
                  </label>

                  <select
                    value={taskPriority}
                    onChange={(event) =>
                      setTaskPriority(
                        event.target.value as TaskPriority,
                      )
                    }
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="normal">
                      Normal
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>
                  </select>
                </div>

              </div>

            </div>

            <div className="task-modal-footer">

              <button
                type="button"
                className="task-cancel-button"
                onClick={() => {
                  setShowCreateTask(false);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="task-save-button"
                disabled={
                  !taskTitle.trim() ||
                  !taskDueDate
                }
                onClick={handleCreateTask}
              >
                Create Task
              </button>

            </div>
          </div>
        </div>
      )}


      {/* =====================================================
          RECENT ACTIVITY
          ===================================================== */}

      <section className="panel recent-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Activity</h3>

            <span>
              Latest changes in your
              workspace
            </span>
          </div>

          <button
            className="text-button"
            type="button"
          >
            View all
          </button>
        </div>

        <div className="recent-list">
          {activities.length > 0 ? (
            activities
              .slice(0, 6)
              .map((activity) => {
                const initials =
                  activity.title
                    .split(" ")
                    .filter(Boolean)
                    .map(
                      (word) =>
                        word
                          .charAt(0)
                          .toUpperCase(),
                    )
                    .slice(0, 2)
                    .join("");

                const diff =
                  Date.now() -
                  activity.timestamp;

                const minutes =
                  Math.floor(
                    diff / 60000,
                  );

                let timeText =
                  "";

                if (minutes < 1) {
                  timeText =
                    "Just now";
                } else if (
                  minutes < 60
                ) {
                  timeText = `${minutes} min ago`;
                } else {
                  const hours =
                    Math.floor(
                      minutes / 60,
                    );

                  if (hours < 24) {
                    timeText = `${hours} hr ago`;
                  } else {
                    const days =
                      Math.floor(
                        hours / 24,
                      );

                    timeText = `${days} day${days > 1
                      ? "s"
                      : ""
                      } ago`;
                  }
                }

                return (
                  <div
                    className="recent-item"
                    key={activity.id}
                  >
                    <div className="recent-avatar">
                      {initials ||
                        "AC"}
                    </div>

                    <div>
                      <strong>
                        {activity.title}
                      </strong>

                      <span>
                        {
                          activity.description
                        }
                      </span>
                    </div>

                    <time>
                      {timeText}
                    </time>
                  </div>
                );
              })
          ) : (
            <div className="recent-empty">
              <span>
                No recent activity
              </span>

              <small>
                Your latest changes will
                appear here.
              </small>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}