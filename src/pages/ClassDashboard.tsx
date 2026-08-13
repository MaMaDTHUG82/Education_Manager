import { useState } from "react";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  birthDate: string;
}

interface ClassInfo {
  id: number;
  name: string;
  description: string;
  subject: string;
  location: string;
  students: Student[];
}

interface ClassDashboardProps {
  classInfo: ClassInfo;
  allClasses: ClassInfo[];
  onBack: () => void;
  onUpdateClass: (updatedClass: ClassInfo) => void;
  onMoveStudent: (
    studentId: number,
    targetClassId: number,
  ) => void;
}

export default function ClassDashboard({
  classInfo,
  allClasses,
  onBack,
  onUpdateClass,
  onMoveStudent,
}: ClassDashboardProps) {
  const [isAddStudentOpen, setIsAddStudentOpen] =
    useState(false);

  const [menuStudentId, setMenuStudentId] =
    useState<number | null>(null);

  const [movingStudent, setMovingStudent] =
    useState<Student | null>(null);

  const [studentSearch, setStudentSearch] =
    useState("");

  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    gender: "Male" as "Male" | "Female",
    birthDate: "",
  });

  const filteredStudents = classInfo.students.filter(
    (student) => {
      const query = studentSearch.toLowerCase();

      return (
        student.firstName
          .toLowerCase()
          .includes(query) ||
        student.lastName
          .toLowerCase()
          .includes(query)
      );
    },
  );

  const handleAddStudent = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !studentForm.firstName.trim() ||
      !studentForm.lastName.trim() ||
      !studentForm.birthDate
    ) {
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      firstName: studentForm.firstName.trim(),
      lastName: studentForm.lastName.trim(),
      gender: studentForm.gender,
      birthDate: studentForm.birthDate,
    };

    onUpdateClass({
      ...classInfo,
      students: [
        ...classInfo.students,
        newStudent,
      ],
    });

    setStudentForm({
      firstName: "",
      lastName: "",
      gender: "Male",
      birthDate: "",
    });

    setIsAddStudentOpen(false);
  };

  const handleRemoveStudent = (
    studentId: number,
  ) => {
    const student = classInfo.students.find(
      (item) => item.id === studentId,
    );

    if (!student) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${student.firstName} ${student.lastName} from this class?`,
    );

    if (!confirmed) {
      return;
    }

    onUpdateClass({
      ...classInfo,
      students: classInfo.students.filter(
        (item) => item.id !== studentId,
      ),
    });

    setMenuStudentId(null);
  };

  return (
    <div className="page">
      <div className="class-dashboard-back">
        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Classes
        </button>
      </div>

      <header className="class-dashboard-header">
        <div>
          <p className="eyebrow">CLASS</p>

          <h2>{classInfo.name}</h2>

          <p className="page-description">
            {classInfo.description ||
              "No description provided."}
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setIsAddStudentOpen(true)
          }
        >
          + Add Student
        </button>
      </header>

      <section className="class-info-grid">
        <div className="class-info-card">
          <span>Subject</span>
          <strong>{classInfo.subject}</strong>
        </div>

        <div className="class-info-card">
          <span>Location</span>
          <strong>📍 {classInfo.location}</strong>
        </div>

        <div className="class-info-card">
          <span>Students</span>
          <strong>
            {classInfo.students.length}
          </strong>
        </div>
      </section>

      <section className="students-panel">
        <div className="students-panel-header">
          <div>
            <h3>Students</h3>

            <span>
              {classInfo.students.length} enrolled
            </span>
          </div>

          <div className="student-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search students..."
              value={studentSearch}
              onChange={(event) =>
                setStudentSearch(
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        <div className="student-table">
          <div className="student-table-header">
            <span>#</span>
            <span>Student</span>
            <span>Gender</span>
            <span>Age</span>
            <span></span>
          </div>

          {filteredStudents.length > 0 ? (
            filteredStudents.map(
              (student, index) => {
                const age =
                  new Date().getFullYear() -
                  new Date(
                    student.birthDate,
                  ).getFullYear();

                return (
                  <div
                    className="student-row"
                    key={student.id}
                  >
                    <span className="student-number">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <div className="student-name">
                      <div className="student-avatar">
                        {student.firstName
                          .charAt(0)
                          .toUpperCase()}
                        {student.lastName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {student.firstName}{" "}
                          {student.lastName}
                        </strong>

                        <span>
                          {student.gender}
                        </span>
                      </div>
                    </div>

                    <span className="student-gender">
                      {student.gender}
                    </span>

                    <span className="student-age">
                      {age} years
                    </span>

                    <div className="student-menu-wrapper">
                      <button
                        className="student-menu-button"
                        onClick={() =>
                          setMenuStudentId(
                            menuStudentId ===
                              student.id
                              ? null
                              : student.id,
                          )
                        }
                      >
                        •••
                      </button>

                      {menuStudentId ===
                        student.id && (
                        <div className="student-menu">
                          <button
                            onClick={() => {
                              setMovingStudent(
                                student,
                              );
                              setMenuStudentId(
                                null,
                              );
                            }}
                          >
                            ⇄ Move to another class
                          </button>

                          <button
                            className="danger-menu-item"
                            onClick={() =>
                              handleRemoveStudent(
                                student.id,
                              )
                            }
                          >
                            × Remove from class
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              },
            )
          ) : (
            <div className="students-empty">
              <div>👨‍🎓</div>

              <h3>No students found</h3>

              <p>
                Add a student to this class or
                change your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {isAddStudentOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setIsAddStudentOpen(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  NEW STUDENT
                </p>

                <h3>Add Student</h3>

                <p>
                  Add a new student to{" "}
                  {classInfo.name}.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setIsAddStudentOpen(false)
                }
              >
                ×
              </button>
            </div>

            <form
              className="class-form"
              onSubmit={handleAddStudent}
            >
              <div className="form-row">
                <div className="form-field">
                  <label>
                    First Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Ali"
                    value={
                      studentForm.firstName
                    }
                    onChange={(event) =>
                      setStudentForm(
                        (previous) => ({
                          ...previous,
                          firstName:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    Last Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Rahimi"
                    value={
                      studentForm.lastName
                    }
                    onChange={(event) =>
                      setStudentForm(
                        (previous) => ({
                          ...previous,
                          lastName:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Gender</label>

                  <select
                    value={studentForm.gender}
                    onChange={(event) =>
                      setStudentForm(
                        (previous) => ({
                          ...previous,
                          gender:
                            event.target
                              .value as
                              | "Male"
                              | "Female",
                        }),
                      )
                    }
                  >
                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label>
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    value={
                      studentForm.birthDate
                    }
                    onChange={(event) =>
                      setStudentForm(
                        (previous) => ({
                          ...previous,
                          birthDate:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setIsAddStudentOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {movingStudent && (
        <MoveStudentModal
          student={movingStudent}
          currentClassId={classInfo.id}
          classes={allClasses}
          onClose={() =>
            setMovingStudent(null)
          }
          onMove={(targetClassId) => {
            onMoveStudent(
              movingStudent.id,
              targetClassId,
            );

            setMovingStudent(null);
          }}
        />
      )}
    </div>
  );
}

interface MoveStudentModalProps {
  student: Student;
  currentClassId: number;
  classes: ClassInfo[];
  onClose: () => void;
  onMove: (targetClassId: number) => void;
}

function MoveStudentModal({
  student,
  currentClassId,
  classes,
  onClose,
  onMove,
}: MoveStudentModalProps) {
  const availableClasses = classes.filter(
    (item) => item.id !== currentClassId,
  );

  const [targetClassId, setTargetClassId] =
    useState(
      availableClasses[0]?.id ?? 0,
    );

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="modal small-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              TRANSFER STUDENT
            </p>

            <h3>Move Student</h3>

            <p>
              Move{" "}
              <strong>
                {student.firstName}{" "}
                {student.lastName}
              </strong>{" "}
              to another class.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="move-student-content">
          <div className="transfer-student">
            <div className="student-avatar large">
              {student.firstName
                .charAt(0)
                .toUpperCase()}
              {student.lastName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {student.firstName}{" "}
                {student.lastName}
              </strong>

              <span>
                Currently in the current class
              </span>
            </div>
          </div>

          <div className="form-field">
            <label>Move to</label>

            <select
              value={targetClassId}
              onChange={(event) =>
                setTargetClassId(
                  Number(event.target.value),
                )
              }
            >
              {availableClasses.length === 0 ? (
                <option value={0}>
                  No other classes available
                </option>
              ) : (
                availableClasses.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="modal-actions move-actions">
          <button
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            disabled={
              availableClasses.length === 0
            }
            onClick={() => {
              if (targetClassId) {
                onMove(targetClassId);
              }
            }}
          >
            Move Student
          </button>
        </div>
      </div>
    </div>
  );
}