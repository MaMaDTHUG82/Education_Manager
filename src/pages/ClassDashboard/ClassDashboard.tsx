import { useState } from "react";
import { useApp } from "../../AppContext";
import "../../pages/ClassDashboard/ClassDashboard.css";
interface Grade {
  id: number;
  examName: string;
  score: number;
  maxScore: number;
  examDate: string;
}

interface Encouragement {
  id: number;
  reason: string;
  points: number;
  date: string;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  birthDate: string;
  notes?: string;
  grades?: Grade[];
  encouragements?: Encouragement[];
  attendance?: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  attendanceRecords?: AttendanceRecord[];
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

  onUpdateClass: (
  updatedClass: ClassInfo
) => void;

  onMoveStudent: (
    studentId: number,
    targetClassId: number,
  ) => void;

  onSelectStudent: (
    student: Student,
  ) => void;

  onDeleteClass: (
    classId: number,
  ) => void;
}

export default function ClassDashboard({
  classInfo,
  allClasses,
  onBack,
  onUpdateClass,
  onMoveStudent,
  onSelectStudent,
  onDeleteClass,
}: ClassDashboardProps) {

  const { addActivity } = useApp();
  const handleDeleteClass = () => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${classInfo.name}"? This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  onDeleteClass(classInfo.id);
};
  const [isAddStudentOpen, setIsAddStudentOpen] =
    useState(false);

  const [isAttendanceOpen, setIsAttendanceOpen] =
    useState(false);

  const [menuStudentId, setMenuStudentId] =
    useState<number | null>(null);

  const [movingStudent, setMovingStudent] =
    useState<Student | null>(null);

  const [studentSearch, setStudentSearch] =
    useState("");

  const getLocalDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");
    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [attendanceDate, setAttendanceDate] =
    useState(getLocalDate());

  const [attendanceStatus, setAttendanceStatus] =
    useState<Record<number, boolean>>({});

  const [studentForm, setStudentForm] =
    useState({
      firstName: "",
      lastName: "",
      gender:
        "Male" as "Male" | "Female",
      birthDate: "",
    });

  const filteredStudents =
    classInfo.students.filter(
      (student) => {
        const query =
          studentSearch.toLowerCase();

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

  const loadAttendanceForDate = (
    date: string,
  ) => {
    const status: Record<
      number,
      boolean
    > = {};

    classInfo.students.forEach(
      (student) => {
        const record =
          student.attendanceRecords?.find(
            (item) =>
              item.date === date,
          );

        status[student.id] =
          record?.present ?? false;
      },
    );

    setAttendanceStatus(status);
  };

  const handleOpenAttendance = () => {
    const today = getLocalDate();

    setAttendanceDate(today);
    loadAttendanceForDate(today);

    setIsAttendanceOpen(true);
  };

  const handleAttendanceDateChange = (
    date: string,
  ) => {
    setAttendanceDate(date);
    loadAttendanceForDate(date);
  };

  const toggleAttendance = (
    studentId: number,
  ) => {
    setAttendanceStatus(
      (previous) => ({
        ...previous,
        [studentId]:
          !previous[studentId],
      }),
    );
  };

  const handleSaveAttendance = () => {
    const updatedStudents =
      classInfo.students.map(
        (student) => {
          const existingRecords =
            student.attendanceRecords ??
            [];

          const recordsWithoutDate =
            existingRecords.filter(
              (record) =>
                record.date !==
                attendanceDate,
            );

          const present =
            attendanceStatus[
              student.id
            ] ?? false;

          const updatedRecords = [
            ...recordsWithoutDate,
            {
              date: attendanceDate,
              present,
            },
          ];

          const total =
            updatedRecords.length;

          const presentCount =
            updatedRecords.filter(
              (record) =>
                record.present,
            ).length;

          const absentCount =
            total - presentCount;

          return {
            ...student,
            attendanceRecords:
              updatedRecords,
            attendance: {
              present: presentCount,
              absent: absentCount,
              late:
                student.attendance
                  ?.late ?? 0,
              total,
            },
          };
        },
      );

    onUpdateClass({
      ...classInfo,
      students: updatedStudents,
    });
    addActivity({
      type: "attendance_recorded",
      title: classInfo.name,
      description: `Attendance recorded for ${attendanceDate}`,
    });
    setIsAttendanceOpen(false);
  };

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
      firstName:
        studentForm.firstName.trim(),
      lastName:
        studentForm.lastName.trim(),
      gender: studentForm.gender,
      birthDate:
        studentForm.birthDate,
      grades: [],
      encouragements: [],
      notes: "",
      attendance: {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      },
      attendanceRecords: [],
    };

    onUpdateClass({
      ...classInfo,
      students: [
        ...classInfo.students,
        newStudent,
      ],
    });
    addActivity({
      type: "student_added",
      title: `${newStudent.firstName} ${newStudent.lastName}`,
      description: `Added to ${classInfo.name}`,
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
    const student =
      classInfo.students.find(
        (item) =>
          item.id === studentId,
      );

    if (!student) {
      return;
    }


    const confirmed =
      window.confirm(
        `Remove ${student.firstName} ${student.lastName} from this class?`,
      );

    if (!confirmed) {
      return;
    }

    onUpdateClass({
      ...classInfo,
      students:
        classInfo.students.filter(
          (item) =>
            item.id !== studentId,
        ),
    });
    addActivity({
        type: "student_removed",
        title: `${student.firstName} ${student.lastName}`,
        description: `Removed from ${classInfo.name}`,
      });
    setMenuStudentId(null);
  };

  const presentCount =
    classInfo.students.filter(
      (student) =>
        attendanceStatus[
          student.id
        ],
    ).length;

  const absentCount =
    classInfo.students.length -
    presentCount;

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
          <p className="eyebrow">
            CLASS
          </p>

          <h2>{classInfo.name}</h2>

          <p className="page-description">
            {classInfo.description ||
              "No description provided."}
          </p>
        </div>

        <div className="class-dashboard-actions">
          
          <button
  className="danger-button"
  onClick={handleDeleteClass}
>
  Delete Class
</button>
          
          
          <button
            className="primary-button"
            onClick={
              handleOpenAttendance
            }
          >
            ✓ Attendance
          </button>
          
          <button
            className="primary-button"
            onClick={() =>
              setIsAddStudentOpen(
                true,
              )
            }
          >
            + Add Student
          </button>
        </div>
      </header>

      <section className="class-info-grid">
        <div className="class-info-card">
          <span>Subject</span>

          <strong>
            {classInfo.subject}
          </strong>
        </div>

        <div className="class-info-card">
          <span>Location</span>

          <strong>
            📍 {classInfo.location}
          </strong>
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
              {classInfo.students.length}{" "}
              enrolled
            </span>
          </div>

          <div className="student-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search students..."
              value={
                studentSearch
              }
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

          {filteredStudents.length >
          0 ? (
            filteredStudents.map(
              (
                student,
                index,
              ) => {
                const birthDate =
                  new Date(
                    student.birthDate,
                  );

                const today =
                  new Date();

                let age =
                  today.getFullYear() -
                  birthDate.getFullYear();

                const monthDifference =
                  today.getMonth() -
                  birthDate.getMonth();

                if (
                  monthDifference <
                    0 ||
                  (monthDifference ===
                    0 &&
                    today.getDate() <
                      birthDate.getDate())
                ) {
                  age--;
                }

                return (
                  <div
                    className="student-row"
                    key={
                      student.id
                    }
                    onClick={() =>
                      onSelectStudent(
                        student,
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        onSelectStudent(
                          student,
                        );
                      }
                    }}
                  >
                    <span className="student-number">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <div className="student-name">
                      <div className="student-avatar">
                        {student.firstName
                          .charAt(
                            0,
                          )
                          .toUpperCase()}

                        {student.lastName
                          .charAt(
                            0,
                          )
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {
                            student.firstName
                          }{" "}
                          {
                            student.lastName
                          }
                        </strong>

                        <span>
                          {
                            student.gender
                          }
                        </span>
                      </div>
                    </div>

                    <span className="student-gender">
                      {
                        student.gender
                      }
                    </span>

                    <span className="student-age">
                      {age} years
                    </span>

                    <div
                      className="student-menu-wrapper"
                      onClick={(
                        event,
                      ) =>
                        event.stopPropagation()
                      }
                    >
                      <button
                        className="student-menu-button"
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation();

                          setMenuStudentId(
                            menuStudentId ===
                              student.id
                              ? null
                              : student.id,
                          );
                        }}
                      >
                        •••
                      </button>

                      {menuStudentId ===
                        student.id && (
                        <div className="student-menu">
                          <button
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              setMovingStudent(
                                student,
                              );

                              setMenuStudentId(
                                null,
                              );
                            }}
                          >
                            ⇄ Move to
                            another class
                          </button>

                          <button
                            className="danger-menu-item"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              handleRemoveStudent(
                                student.id,
                              );
                            }}
                          >
                            × Remove
                            from class
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

              <h3>
                No students found
              </h3>

              <p>
                Add a student to
                this class or
                change your
                search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          ATTENDANCE MODAL
          ========================================== */}

      {isAttendanceOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsAttendanceOpen(
                false,
              );
            }
          }}
        >
          <div className="modal attendance-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  DAILY RECORD
                </p>

                <h3>
                  Attendance
                </h3>

                <p>
                  Mark the students
                  who are present.
                </p>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() =>
                  setIsAttendanceOpen(
                    false,
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="attendance-content">
              <div className="form-field">
                <label htmlFor="attendance-date">
                  Date
                </label>

                <input
                  id="attendance-date"
                  type="date"
                  value={
                    attendanceDate
                  }
                  onChange={(
                    event,
                  ) =>
                    handleAttendanceDateChange(
                      event.target
                        .value,
                    )
                  }
                />
              </div>

              {classInfo.students.length >
              0 ? (
                <>
                  <div className="attendance-list">
                    {classInfo.students.map(
                      (
                        student,
                        index,
                      ) => {
                        const isPresent =
                          attendanceStatus[
                            student.id
                          ] ??
                          false;

                        return (
                          <button
                            type="button"
                            className={`attendance-student-row ${
                              isPresent
                                ? "present"
                                : ""
                            }`}
                            key={
                              student.id
                            }
                            onClick={() =>
                              toggleAttendance(
                                student.id,
                              )
                            }
                          >
                            <span className="attendance-number">
                              {String(
                                index +
                                  1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>

                            <div className="attendance-student-info">
                              <div className="student-avatar">
                                {student.firstName
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}

                                {student.lastName
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {
                                    student.firstName
                                  }{" "}
                                  {
                                    student.lastName
                                  }
                                </strong>

                                <span>
                                  {
                                    student.gender
                                  }
                                </span>
                              </div>
                            </div>

                            <span
                              className={`attendance-status ${
                                isPresent
                                  ? "present"
                                  : "absent"
                              }`}
                            >
                              {isPresent
                                ? "Present"
                                : "Absent"}
                            </span>

                            <span
                              className={`attendance-checkbox ${
                                isPresent
                                  ? "checked"
                                  : ""
                              }`}
                            >
                              {isPresent
                                ? "✓"
                                : ""}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="attendance-summary">
                    <div className="attendance-summary-stats">
                      <div>
                        <span>
                          Total
                          Students
                        </span>

                        <strong>
                          {
                            classInfo
                              .students
                              .length
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Present
                        </span>

                        <strong className="present-text">
                          {
                            presentCount
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Absent
                        </span>

                        <strong className="absent-text">
                          {
                            absentCount
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="absent-students">
                      <span>
                        Absent
                        Students
                      </span>

                      {classInfo.students.some(
                        (
                          student,
                        ) =>
                          !attendanceStatus[
                            student.id
                          ],
                      ) ? (
                        <div>
                          {classInfo.students
                            .filter(
                              (
                                student,
                              ) =>
                                !attendanceStatus[
                                  student.id
                                ],
                            )
                            .map(
                              (
                                student,
                              ) => (
                                <span
                                  className="absent-student-tag"
                                  key={
                                    student.id
                                  }
                                >
                                  {
                                    student.firstName
                                  }{" "}
                                  {
                                    student.lastName
                                  }
                                </span>
                              ),
                            )}
                        </div>
                      ) : (
                        <p className="all-present-message">
                          Everyone is
                          present.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="attendance-empty">
                  <div>👨‍🎓</div>

                  <h3>
                    No students
                  </h3>

                  <p>
                    Add students to
                    this class before
                    taking
                    attendance.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-actions attendance-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setIsAttendanceOpen(
                    false,
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={
                  classInfo.students
                    .length === 0
                }
                onClick={
                  handleSaveAttendance
                }
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ADD STUDENT MODAL
          ========================================== */}

      {isAddStudentOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsAddStudentOpen(
                false,
              );
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  NEW STUDENT
                </p>

                <h3>
                  Add Student
                </h3>

                <p>
                  Add a new student
                  to{" "}
                  {
                    classInfo.name
                  }
                  .
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setIsAddStudentOpen(
                    false,
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              className="class-form"
              onSubmit={
                handleAddStudent
              }
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
                    onChange={(
                      event,
                    ) =>
                      setStudentForm(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          firstName:
                            event.target
                              .value,
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
                    onChange={(
                      event,
                    ) =>
                      setStudentForm(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          lastName:
                            event.target
                              .value,
                        }),
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>
                    Gender
                  </label>

                  <select
                    value={
                      studentForm.gender
                    }
                    onChange={(
                      event,
                    ) =>
                      setStudentForm(
                        (
                          previous,
                        ) => ({
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
                    onChange={(
                      event,
                    ) =>
                      setStudentForm(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          birthDate:
                            event.target
                              .value,
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
                    setIsAddStudentOpen(
                      false,
                    )
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

      {/* ==========================================
          MOVE STUDENT MODAL
          ========================================== */}

      {movingStudent && (
        <MoveStudentModal
          student={
            movingStudent
          }
          currentClassId={
            classInfo.id
          }
          classes={allClasses}
          onClose={() =>
            setMovingStudent(
              null,
            )
          }
          onMove={(
            targetClassId,
          ) => {
            onMoveStudent(
              movingStudent.id,
              targetClassId,
            );

            setMovingStudent(
              null,
            );
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
  onMove: (
    targetClassId: number,
  ) => void;
}

function MoveStudentModal({
  student,
  currentClassId,
  classes,
  onClose,
  onMove,
}: MoveStudentModalProps) {
  const availableClasses =
    classes.filter(
      (item) =>
        item.id !==
        currentClassId,
    );

  const [targetClassId, setTargetClassId] =
    useState(
      availableClasses[0]?.id ??
        0,
    );

  return (
    <div
      className="modal-overlay"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
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

            <h3>
              Move Student
            </h3>

            <p>
              Move{" "}
              <strong>
                {student.firstName}{" "}
                {student.lastName}
              </strong>{" "}
              to another
              class.
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
                Currently in the
                current class
              </span>
            </div>
          </div>

          <div className="form-field">
            <label>
              Move to
            </label>

            <select
              value={
                targetClassId
              }
              onChange={(
                event,
              ) =>
                setTargetClassId(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
            >
              {availableClasses.length ===
              0 ? (
                <option value={0}>
                  No other
                  classes
                  available
                </option>
              ) : (
                availableClasses.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.name}
                    </option>
                  ),
                )
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
              availableClasses.length ===
              0
            }
            onClick={() => {
              if (
                targetClassId
              ) {
                onMove(
                  targetClassId,
                );
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