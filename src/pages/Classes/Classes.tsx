import { useState } from "react";
import ClassDashboard from "../ClassDashboard/ClassDashboard";
import StudentDashboard from "../StudentDashboard/StudentDashboard";
import { useApp } from "../../AppContext";

export interface AttendanceRecord {
  date: string;
  present: boolean;
}

export interface Grade {
  id: number;
  examName: string;
  score: number;
  maxScore: number;
  examDate: string;
}

export interface ClassActivity {
  id: number;
  description: string;
  score: number;
  date: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
}

export interface Encouragement {
  id: number;
  reason: string;
  points: number;
  date: string;
}

export interface StudentAttendance {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  birthDate: string;

  notes?: string;

  attendance?: StudentAttendance;

  grades?: Grade[];

  classActivities?: ClassActivity[];

  assignments?: Assignment[];

  encouragements?: Encouragement[];

  attendanceRecords?: AttendanceRecord[];
}

export interface ClassSchedule {
  day: number;
  startTime: string;
  endTime: string;
}

export interface ClassItem {
  id: number;
  name: string;
  description: string;
  subject: string;
  location: string;
  students: Student[];
  schedule: ClassSchedule[];
}



export default function Classes() {
  const {
  classes,
  setClasses,
  addActivity,
} = useApp();

  const [selectedClassId, setSelectedClassId] =
    useState<number | null>(null);

  const [selectedStudentId, setSelectedStudentId] =
    useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [form, setForm] = useState({
  name: "",
  description: "",
  subject: "",
  location: "",
  schedule: [] as ClassSchedule[],
});

  const selectedClass = classes.find(
    (item) => item.id === selectedClassId,
  );

  const selectedStudent =
    selectedClass?.students.find(
      (student) =>
        student.id === selectedStudentId,
    );

  /*
   * --------------------------------------------------
   * STUDENT DASHBOARD
   * --------------------------------------------------
   *
   * If a student is selected, show the student
   * dashboard instead of the class dashboard.
   */
  if (selectedClass && selectedStudent) {
    return (
      <StudentDashboard
        student={selectedStudent}
        classInfo={selectedClass}
        onBack={() =>
          setSelectedStudentId(null)
        }
        onUpdateStudent={(updatedStudent) => {
          setClasses((previous) =>
            previous.map((classItem) => {
              if (
                classItem.id !==
                selectedClass.id
              ) {
                return classItem;
              }

              return {
                ...classItem,
                students:
                  classItem.students.map(
                    (student) =>
                      student.id ===
                      updatedStudent.id
                        ? updatedStudent
                        : student,
                  ),
              };
            }),
          );
        }}
      />
    );
  }

  /*
   * --------------------------------------------------
   * CLASS DASHBOARD
   * --------------------------------------------------
   */
  if (selectedClass) {
    return (
      <ClassDashboard
        classInfo={selectedClass}
        allClasses={classes}
        onBack={() =>
          setSelectedClassId(null)
        }
        onUpdateClass={(updatedClass) => {
  setClasses((previous) =>
    previous.map((item) =>
      item.id === updatedClass.id
        ? {
            ...item,
            ...updatedClass,
            schedule: item.schedule,
          }
        : item,
    ),
  );
}}
        onDeleteClass={(classId) => {
  setClasses((previous) =>
    previous.filter(
      (item) => item.id !== classId
    )
  );

  setSelectedClassId(null);
  setSelectedStudentId(null);
}}
        onMoveStudent={( 
          studentId,
          targetClassId,
        ) => {
          setClasses((previous) => {
            let studentToMove:
              | Student
              | undefined;

            const updatedClasses =
              previous.map((item) => {
                if (
                  item.id === selectedClass.id
                ) {
                  studentToMove =
                    item.students.find(
                      (student) =>
                        student.id ===
                        studentId,
                    );

                  return {
                    ...item,
                    students:
                      item.students.filter(
                        (student) =>
                          student.id !==
                          studentId,
                      ),
                  };
                }

                return item;
              });

            if (!studentToMove) {
              return previous;
            }

            return updatedClasses.map(
              (item) => {
                if (
                  item.id === targetClassId
                ) {
                  return {
                    ...item,
                    students: [
                      ...item.students,
                      studentToMove!,
                    ],
                  };
                }

                return item;
              },
            );
          });
        }}
        onSelectStudent={(student) => {
          setSelectedStudentId(student.id);
        }}
      />
    );
  }

  /*
   * --------------------------------------------------
   * CLASSES PAGE
   * --------------------------------------------------
   */

  const filteredClasses = classes.filter(
    (item) => {
      const query = search.toLowerCase();

      return (
        item.name
          .toLowerCase()
          .includes(query) ||
        item.subject
          .toLowerCase()
          .includes(query) ||
        item.location
          .toLowerCase()
          .includes(query)
      );
    },
  );

  const updateForm = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };
  const addSchedule = () => {
  setForm((previous) => ({
    ...previous,
    schedule: [
      ...previous.schedule,
      {
        day: 1,
        startTime: "10:00",
        endTime: "11:30",
      },
    ],
  }));
};
const removeSchedule = (
  index: number,
) => {
  setForm((previous) => ({
    ...previous,
    schedule: previous.schedule.filter(
      (_, scheduleIndex) =>
        scheduleIndex !== index,
    ),
  }));
};
const updateSchedule = (
  index: number,
  field:
    | "day"
    | "startTime"
    | "endTime",
  value: string,
) => {
  setForm((previous) => ({
    ...previous,
    schedule: previous.schedule.map(
      (schedule, scheduleIndex) =>
        scheduleIndex === index
          ? {
              ...schedule,
              [field]:
                field === "day"
                  ? Number(value)
                  : value,
            }
          : schedule,
    ),
  }));
};
  const handleCreateClass = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.subject.trim() ||
      !form.location.trim()
    ) {
      return;
    }

    const newClass: ClassItem = {
    id: Date.now(),
    name: form.name.trim(),
    description: form.description.trim(),
    subject: form.subject.trim(),
    location: form.location.trim(),
    students: [],
    schedule: form.schedule,
  };

    setClasses((previous) => [
      ...previous,
      newClass,
    ]);
    addActivity({
      type: "class_created",
      title: newClass.name,
      description: `New ${newClass.subject} class created`,
    });
    setForm({
      name: "",
      description: "",
      subject: "",
      location: "",
      schedule: [],
    });

    setIsModalOpen(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>

          <h2>Classes</h2>

          <p className="page-description">
            Create and manage your classes.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setIsModalOpen(true)
          }
        >
          + Create Class
        </button>
      </header>

      <div className="class-toolbar">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="class-count">
          {filteredClasses.length}{" "}
          {filteredClasses.length === 1
            ? "class"
            : "classes"}
        </div>
      </div>

      {filteredClasses.length > 0 ? (
        <section className="classes-grid">
          {filteredClasses.map((item) => (
            <button
              className="class-card"
              key={item.id}
              onClick={() =>
                setSelectedClassId(item.id)
              }
            >
              <div className="class-card-top">
                <div className="class-card-icon purple">
                  ▦
                </div>

                <span className="class-card-arrow">
                  →
                </span>
              </div>

              <div className="class-card-content">
                <h3>{item.name}</h3>

                <p className="class-subject">
                  {item.subject}
                </p>

                <p className="class-description">
                  {item.description ||
                    "No description provided."}
                </p>

                <div className="class-card-meta">
                  <span>
                    📍 {item.location}
                  </span>

                  <span>
                    👥{" "}
                    {item.students.length}{" "}
                    students
                  </span>
                </div>
              </div>
            </button>
          ))}
        </section>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            ▦
          </div>

          <h3>No classes found</h3>

          <p>
            Create a new class or try another
            search.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setIsModalOpen(true)
            }
          >
            + Create Class
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  NEW CLASS
                </p>

                <h3>Create Class</h3>

                <p>
                  Add the basic information for
                  your class.
                </p>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                ×
              </button>
            </div>

            <form
              className="class-form"
              onSubmit={handleCreateClass}
            >
              <div className="form-field">
                <label htmlFor="class-name">
                  Class Name
                </label>

                <input
                  id="class-name"
                  type="text"
                  placeholder="e.g. Mathematics 7/1"
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="class-subject">
                    Subject
                  </label>

                  <input
                    id="class-subject"
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={form.subject}
                    onChange={(event) =>
                      updateForm(
                        "subject",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="class-location">
                    Location
                  </label>

                  <input
                    id="class-location"
                    type="text"
                    placeholder="e.g. Room 204"
                    value={form.location}
                    onChange={(event) =>
                      updateForm(
                        "location",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="class-description">
                  Description
                </label>

                <textarea
                  id="class-description"
                  placeholder="Describe this class..."
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value,
                    )
                  }
                />
              </div>
                    <div className="schedule-section">
  <div className="schedule-section-header">
    <div>
      <label>Class Schedule</label>

      <p>
        Choose the days and time for this
        class.
      </p>
    </div>

    <button
      type="button"
      className="secondary-button"
      onClick={addSchedule}
    >
      + Add Day
    </button>
  </div>

  {form.schedule.length === 0 ? (
    <div className="schedule-empty">
      <span>◷</span>

      <p>
        No schedule added yet.
      </p>

      <small>
        Add the days and time when this
        class takes place.
      </small>
    </div>
  ) : (
    <div className="schedule-list">
      {form.schedule.map(
        (schedule, index) => (
          <div
            className="schedule-row"
            key={index}
          >
            <div className="form-field">
              <label>
                Day
              </label>

              <select
                value={schedule.day}
                onChange={(event) =>
                  updateSchedule(
                    index,
                    "day",
                    event.target.value,
                  )
                }
              >
                <option value={0}>
                  Sunday
                </option>

                <option value={1}>
                  Monday
                </option>

                <option value={2}>
                  Tuesday
                </option>

                <option value={3}>
                  Wednesday
                </option>

                <option value={4}>
                  Thursday
                </option>

                <option value={5}>
                  Friday
                </option>

                <option value={6}>
                  Saturday
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>
                Start
              </label>

              <input
                type="time"
                value={
                  schedule.startTime
                }
                onChange={(event) =>
                  updateSchedule(
                    index,
                    "startTime",
                    event.target.value,
                  )
                }
                required
              />
            </div>

            <div className="form-field">
              <label>
                End
              </label>

              <input
                type="time"
                value={
                  schedule.endTime
                }
                onChange={(event) =>
                  updateSchedule(
                    index,
                    "endTime",
                    event.target.value,
                  )
                }
                required
              />
            </div>

            <button
              type="button"
              className="schedule-remove-button"
              onClick={() =>
                removeSchedule(index)
              }
              title="Remove schedule"
            >
              ×
            </button>
          </div>
        ),
      )}
    </div>
  )}
</div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}