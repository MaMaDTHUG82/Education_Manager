import { useState } from "react";
import ClassDashboard from "./ClassDashboard";
import StudentDashboard from "./StudentDashboard";

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  birthDate: string;
}

export interface ClassItem {
  id: number;
  name: string;
  description: string;
  subject: string;
  location: string;
  students: Student[];
}

const initialClasses: ClassItem[] = [
  {
    id: 1,
    name: "Mathematics 7/1",
    description:
      "Seventh grade mathematics class",
    subject: "Mathematics",
    location: "Room 204",
    students: [
      {
        id: 101,
        firstName: "Ali",
        lastName: "Rahimi",
        gender: "Male",
        birthDate: "2012-05-12",
      },
      {
        id: 102,
        firstName: "Sara",
        lastName: "Mohammadi",
        gender: "Female",
        birthDate: "2012-08-20",
      },
      {
        id: 103,
        firstName: "Mohammad",
        lastName: "Ahmadi",
        gender: "Male",
        birthDate: "2012-02-11",
      },
    ],
  },
  {
    id: 2,
    name: "Science 8/2",
    description:
      "General science class",
    subject: "Science",
    location: "Science Lab",
    students: [
      {
        id: 104,
        firstName: "Amir",
        lastName: "Hosseini",
        gender: "Male",
        birthDate: "2011-06-10",
      },
    ],
  },
  {
    id: 3,
    name: "Physics 9/1",
    description:
      "Introduction to physics",
    subject: "Physics",
    location: "Room 301",
    students: [],
  },
];

export default function Classes() {
  const [classes, setClasses] =
    useState<ClassItem[]>(initialClasses);

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
                ? updatedClass
                : item,
            ),
          );
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
    };

    setClasses((previous) => [
      ...previous,
      newClass,
    ]);

    setForm({
      name: "",
      description: "",
      subject: "",
      location: "",
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