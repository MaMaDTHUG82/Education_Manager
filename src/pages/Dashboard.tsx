import { useMemo } from "react";
import { useApp } from "../AppContext";

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
  } = useApp();

  const now = new Date();

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
    const today = new Date();

    today.setHours(
      23,
      59,
      59,
      999,
    );

    let count = 0;

    classes.forEach((classItem) => {
      classItem.students.forEach(
        (student) => {
          const typedStudent =
            student as DashboardStudent;

          const assignments =
            typedStudent.assignments ?? [];

          assignments.forEach(
            (assignment) => {
              if (!assignment.dueDate) {
                return;
              }

              const dueDate =
                new Date(
                  `${assignment.dueDate}T23:59:59`,
                );

              if (
                dueDate.getTime() >=
                today.getTime()
              ) {
                count += 1;
              }
            },
          );
        },
      );
    });

    return count;
  }, [classes]);

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

  const upcomingClasses =
    useMemo(() => {
      const upcoming: {
        classId: number;
        className: string;
        subject: string;
        location: string;
        startTime: string;
        endTime: string;
        date: Date;
      }[] = [];

      classes.forEach(
        (classItem) => {
          classItem.schedule.forEach(
            (schedule) => {
              const nextDate =
                getNextClassDate(
                  schedule.day,
                  schedule.startTime,
                  now,
                );

              upcoming.push({
                classId: classItem.id,
                className:
                  classItem.name,
                subject:
                  classItem.subject,
                location:
                  classItem.location,
                startTime:
                  schedule.startTime,
                endTime:
                  schedule.endTime,
                date: nextDate,
              });
            },
          );
        },
      );

      return upcoming
        .sort(
          (a, b) =>
            a.date.getTime() -
            b.date.getTime(),
        )
        .slice(0, 5);
    }, [classes, now.getTime()]);

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
            Welcome back. Here is an
            overview of your education
            workspace.
          </p>
        </div>

        <div className="date-card">
          <span>Today</span>

          <strong>
            {formatDate(now)}
          </strong>
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
                      className={`calendar-day ${
                        isToday
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
                Next scheduled classes
              </span>
            </div>
          </div>

          <div className="activity-list">
            {upcomingClasses.length >
            0 ? (
              upcomingClasses.map(
                (item, index) => (
                  <div
                    className="activity"
                    key={`${item.classId}-${item.date.getTime()}-${index}`}
                  >
                    <div
                      className={`activity-dot ${
                        index % 4 === 0
                          ? "purple"
                          : index % 4 === 1
                            ? "blue"
                            : index % 4 ===
                                2
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
              )
            ) : (
              <div className="recent-empty">
                <span>
                  No upcoming classes
                </span>

                <small>
                  Add a schedule to your
                  classes to see them here.
                </small>
              </div>
            )}
          </div>
        </div>
      </section>

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

                    timeText = `${days} day${
                      days > 1
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