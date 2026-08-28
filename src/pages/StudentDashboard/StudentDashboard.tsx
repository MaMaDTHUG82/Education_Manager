import { useMemo, useState } from "react";
import { useApp } from "../../AppContext";

interface ClassActivity {
  id: number;
  description: string;
  score: number;
  date: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  birthDate: string;
  notes?: string;
  attendance?: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  grades?: Grade[];
  classActivities?: ClassActivity[];
  assignments?: Assignment[];
  encouragements?: Encouragement[];
  attendanceRecords?: AttendanceRecord[];
}

interface Grade {
  id: number;
  examName: string;
  score: number;
  maxScore: number;
  examDate: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
}

interface Encouragement {
  id: number;
  reason: string;
  points: number;
  date: string;
}

interface ClassInfo {
  id: number;
  name: string;
  subject: string;
}

interface StudentDashboardProps {
  student: Student;
  classInfo: ClassInfo;
  onBack: () => void;
  onUpdateStudent: (student: Student) => void;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

export default function StudentDashboard({
  student,
  classInfo,
  onBack,
  onUpdateStudent,
}: StudentDashboardProps) {
  const { addActivity } = useApp();

  const [isExamModalOpen, setIsExamModalOpen] =
    useState(false);

  const [isActivityModalOpen, setIsActivityModalOpen] =
    useState(false);  

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] =
    useState(false);

  const [isScoreModalOpen, setIsScoreModalOpen] =
    useState(false);

  const [notes, setNotes] =
    useState(student.notes ?? "");

  const [examForm, setExamForm] = useState({
    examName: "",
    score: "",
    maxScore: "20",
    examDate: "",
  });
  const [activityForm, setActivityForm] =
    useState({
    description: "",
    score: "",
    date: "",
  });

  const [assignmentForm, setAssignmentForm] =
    useState({
      title: "",
      description: "",
      dueDate: "",
    });

  const [scoreForm, setScoreForm] = useState({
    reason: "",
    points: "",
    date: "",
  });

  const grades = student.grades ?? [];

  const classActivities =
    student.classActivities ?? [];

  const assignments =
    student.assignments ?? [];

  const encouragements =
    student.encouragements ?? [];

  const attendanceRecords =
  student.attendanceRecords ?? [];

  const attendance = {
  present: attendanceRecords.filter(
    (record) => record.present,
  ).length,

  absent: attendanceRecords.filter(
    (record) => !record.present,
  ).length,

  late: student.attendance?.late ?? 0,

  total: attendanceRecords.length,
};

  const age = useMemo(() => {
    const birth = new Date(student.birthDate);
    const today = new Date();

    let calculatedAge =
      today.getFullYear() -
      birth.getFullYear();

    const monthDifference =
      today.getMonth() -
      birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birth.getDate())
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  }, [student.birthDate]);

  const averageGrade =
    grades.length > 0
      ? grades.reduce(
          (sum, grade) =>
            sum +
            (grade.score / grade.maxScore) * 20,
          0,
        ) / grades.length
      : 0;
  
  const averageClassActivity =
      classActivities.length > 0
    ? classActivities.reduce(
        (sum, activity) =>
          sum + activity.score,
        0,
      ) / classActivities.length
    : 0;    

  const totalPoints = encouragements.reduce(
    (sum, item) => sum + item.points,
    0,
  );

  const attendancePercentage =
    attendance.total > 0
      ? Math.round(
          (attendance.present /
            attendance.total) *
            100,
        )
      : 0;

  const handleSaveNotes = () => {
    onUpdateStudent({
      ...student,
      notes,
    });
  };

  const handleAddExam = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const score = Number(examForm.score);
    const maxScore = Number(examForm.maxScore);

    if (
      !examForm.examName.trim() ||
      !examForm.examDate ||
      Number.isNaN(score) ||
      Number.isNaN(maxScore) ||
      maxScore <= 0 ||
      score < 0 ||
      score > maxScore
    ) {
      return;
    }

    const newGrade: Grade = {
      id: Date.now(),
      examName: examForm.examName.trim(),
      score,
      maxScore,
      examDate: examForm.examDate,
    };

    onUpdateStudent({
      ...student,
      grades: [...grades, newGrade],
    });

    addActivity({
  type: "grade_added",
  title: `${student.firstName} ${student.lastName}`,
  description: `Exam "${newGrade.examName}" — ${newGrade.score}/${newGrade.maxScore}`,
});

    setExamForm({
      examName: "",
      score: "",
      maxScore: "20",
      examDate: "",
    });

    setIsExamModalOpen(false);
  };

  const handleAddClassActivity = (
  event: React.FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  const score = Number(
    activityForm.score,
  );

  if (
    !activityForm.description.trim() ||
    !activityForm.date ||
    Number.isNaN(score) ||
    score < 1 ||
    score > 20
  ) {
    return;
  }

  const newActivity: ClassActivity = {
    id: Date.now(),
    description:
      activityForm.description.trim(),
    score,
    date: activityForm.date,
  };

  onUpdateStudent({
    ...student,
    classActivities: [
      ...classActivities,
      newActivity,
    ],
  });
  addActivity({
  type: "class_activity_added",
  title: `${student.firstName} ${student.lastName}`,
  description: `Class activity "${newActivity.description}" — ${newActivity.score}/20`,
});
  setActivityForm({
    description: "",
    score: "",
    date: "",
  });

  setIsActivityModalOpen(false);
};

  const handleAddAssignment = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !assignmentForm.title.trim() ||
      !assignmentForm.dueDate
    ) {
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now(),
      title: assignmentForm.title.trim(),
      description:
        assignmentForm.description.trim(),
      dueDate: assignmentForm.dueDate,
    };

    onUpdateStudent({
      ...student,
      assignments: [
        ...assignments,
        newAssignment,
      ],
    });
    addActivity({
  type: "assignment_added",
  title: `${student.firstName} ${student.lastName}`,
  description: `Assignment "${newAssignment.title}" added`,
});
    setAssignmentForm({
      title: "",
      description: "",
      dueDate: "",
    });

    setIsAssignmentModalOpen(false);
  };

  const handleAddScore = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const points = Number(scoreForm.points);

    if (
      !scoreForm.reason.trim() ||
      !scoreForm.date ||
      Number.isNaN(points) ||
      points <= 0
    ) {
      return;
    }

    const newEncouragement: Encouragement = {
      id: Date.now(),
      reason: scoreForm.reason.trim(),
      points,
      date: scoreForm.date,
    };

    onUpdateStudent({
      ...student,
      encouragements: [
        ...encouragements,
        newEncouragement,
      ],
    });
    addActivity({
  type: "encouragement_added",
  title: `${student.firstName} ${student.lastName}`,
  description: `+${newEncouragement.points} points — ${newEncouragement.reason}`,
});
    setScoreForm({
      reason: "",
      points: "",
      date: "",
    });

    setIsScoreModalOpen(false);
  };

  return (
    <div className="page">
      <button
        className="back-button student-back-button"
        onClick={onBack}
      >
        ← Back to {classInfo.name}
      </button>

      <header className="student-dashboard-header">
        <div className="student-profile-heading">
          <div className="student-profile-avatar">
            {student.firstName
              .charAt(0)
              .toUpperCase()}
            {student.lastName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <p className="eyebrow">
              STUDENT PROFILE
            </p>

            <h2>
              {student.firstName}{" "}
              {student.lastName}
            </h2>

            <p className="page-description">
              {student.gender} • {age} years •{" "}
              {classInfo.name}
            </p>
          </div>
        </div>

        <button
          className="primary-button"
          
        >
          Report Card
        </button>

        <button
          className="primary-button"
          onClick={() =>
            setIsScoreModalOpen(true)
          }
        >
          + Add Score
        </button>
      </header>

      <section className="student-stat-grid">
        <div className="student-stat-card">
          <span>Attendance</span>

          <strong>
            {attendance.present} /{" "}
            {attendance.total}
          </strong>

          <small>
            {attendancePercentage}% attendance
          </small>
        </div>

        <div className="student-stat-card">
          <span>Average Grade</span>

          <strong>
            {grades.length > 0
              ? averageGrade.toFixed(1)
              : "—"}
          </strong>

          <small>
            {grades.length} exams recorded
          </small>
        </div>

        <div className="student-stat-card">
            <span>Class Activity</span>

            <strong>
              {classActivities.length > 0
                ? averageClassActivity.toFixed(1)
                : "—"}
            </strong>

            <small>
              {classActivities.length} activities recorded
            </small>
          </div>

        <div className="student-stat-card">
          <span>Assignments</span>

          <strong>
            {assignments.length}
          </strong>

          <small>
            assigned to this student
          </small>
        </div>

        <div className="student-stat-card">
          <span>Encouragement Points</span>

          <strong>
            +{totalPoints}
          </strong>

          <small>
            {encouragements.length} records
          </small>
        </div>

        <div className="student-stat-card">
          <span>Absences</span>

          <strong>
            {attendance.absent}
          </strong>

          <small>
            {attendance.late} late arrivals
          </small>
        </div>
      </section>

      <div className="student-dashboard-grid">
        <section className="student-section notes-section">
          <div className="student-section-header">
            <div>
              <p className="eyebrow">
                PRIVATE RECORD
              </p>

              <h3>Student Notes</h3>
            </div>

            <button
              className="secondary-button"
              onClick={handleSaveNotes}
            >
              Save
            </button>
          </div>

          <textarea
            className="student-notes-input"
            placeholder="Write notes about this student..."
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
          />

          <p className="notes-hint">
            These notes will be kept as part of
            the student's educational record.
          </p>
        </section>

        <section className="student-section attendance-section">
          <div className="student-section-header">
            <div>
              <p className="eyebrow">
                ATTENDANCE RECORD
              </p>

              <h3>Attendance</h3>
            </div>
          </div>

          <div className="attendance-summary">
            <div className="attendance-circle">
              <strong>
                {attendancePercentage}%
              </strong>

              <span>present</span>
            </div>

            <div className="attendance-details">
              <div>
                <span>Present</span>

                <strong>
                  {attendance.present}
                </strong>
              </div>

              <div>
                <span>Absent</span>

                <strong>
                  {attendance.absent}
                </strong>
              </div>

              <div>
                <span>Late</span>

                <strong>
                  {attendance.late}
                </strong>
              </div>
            </div>
          </div>

          <p className="attendance-hint">
            Attendance recording will be managed from
            the class dashboard.
          </p>
        </section>
      </div>

      {/* =====================================================
          EXAMS & GRADES
          ===================================================== */}

      <section className="student-section">
        <div className="student-section-header">
          <div>
            <p className="eyebrow">
              PERFORMANCE
            </p>

            <h3>Exams & Grades</h3>

            <span>
              Record exams and track this student's
              results.
            </span>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setIsExamModalOpen(true)
            }
          >
            + Add Exam
          </button>
        </div>

        {grades.length > 0 ? (
          <div className="grade-list">
            {grades.map((grade) => {
              const percentage =
                (grade.score /
                  grade.maxScore) *
                100;

              return (
                <div
                  className="grade-row"
                  key={grade.id}
                >
                  <div className="grade-icon">
                    ✎
                  </div>

                  <div className="grade-info">
                    <strong>
                      {grade.examName}
                    </strong>

                    <span>
                      {grade.examDate}
                    </span>
                  </div>

                  <div className="grade-progress">
                    <div>
                      <div
                        className="grade-progress-bar"
                        style={{
                          width: `${Math.min(
                            percentage,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grade-value">
                    <strong>
                      {grade.score}
                    </strong>

                    <span>
                      / {grade.maxScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="student-empty-list">
            <div>📝</div>

            <h3>No exams recorded</h3>

            <p>
              Add the student's first exam result.
            </p>
          </div>
        )}
      </section>

        {/* =====================================================
    CLASS ACTIVITIES
    ===================================================== */}

<section className="student-section">
  <div className="student-section-header">
    <div>
      <p className="eyebrow">
        CLASSROOM PERFORMANCE
      </p>

      <h3>Class Activities</h3>

      <span>
        Record classroom participation,
        performance, and daily activities.
      </span>
    </div>

    <button
      className="primary-button"
      onClick={() =>
        setIsActivityModalOpen(true)
      }
    >
      + Add Activity
    </button>
  </div>

  {classActivities.length > 0 ? (
    <div className="class-activity-list">
      {classActivities.map(
        (activity) => (
          <div
            className="class-activity-row"
            key={activity.id}
          >
            <div className="class-activity-icon">
              ✦
            </div>

            <div className="class-activity-info">
              <strong>
                {activity.description}
              </strong>

              <span>
                {activity.date}
              </span>
            </div>

            <div className="class-activity-progress">
              <div>
                <div
                  className="class-activity-progress-bar"
                  style={{
                    width: `${
                      (activity.score /
                        20) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="class-activity-value">
              <strong>
                {activity.score}
              </strong>

              <span>/ 20</span>
            </div>
          </div>
        ),
      )}
    </div>
  ) : (
    <div className="student-empty-list">
      <div>✦</div>

      <h3>
        No class activities recorded
      </h3>

      <p>
        Add the student's first
        classroom activity.
      </p>
    </div>
  )}
</section>

      {/* =====================================================
          ASSIGNMENTS
          This section is intentionally directly below
          Exams & Grades.
          ===================================================== */}

      <section className="student-section">
        <div className="student-section-header">
          <div>
            <p className="eyebrow">
              COURSEWORK
            </p>

            <h3>Assignments</h3>

            <span>
              Manage assignments given to this
              student.
            </span>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setIsAssignmentModalOpen(true)
            }
          >
            + Add Assignment
          </button>
        </div>

        {assignments.length > 0 ? (
          <div className="assignment-list">
            {assignments.map(
              (assignment) => (
                <div
                  className="assignment-row"
                  key={assignment.id}
                >
                  <div className="assignment-icon">
                    ✓
                  </div>

                  <div className="assignment-info">
                    <strong>
                      {assignment.title}
                    </strong>

                    {assignment.description && (
                      <span>
                        {assignment.description}
                      </span>
                    )}

                    <small>
                      Due:{" "}
                      {assignment.dueDate}
                    </small>
                  </div>

                  <div className="assignment-status">
                    Assigned
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="student-empty-list">
            <div>📚</div>

            <h3>No assignments yet</h3>

            <p>
              Add the first assignment for this
              student.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          ENCOURAGEMENT & POINTS
          ===================================================== */}

      <section className="student-section">
        <div className="student-section-header">
          <div>
            <p className="eyebrow">
              POSITIVE FEEDBACK
            </p>

            <h3>Encouragement & Points</h3>

            <span>
              Reward students for positive behavior
              and achievements.
            </span>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setIsScoreModalOpen(true)
            }
          >
            + Add Score
          </button>
        </div>

        {encouragements.length > 0 ? (
          <div className="encouragement-list">
            {encouragements.map((item) => (
              <div
                className="encouragement-row"
                key={item.id}
              >
                <div className="encouragement-icon">
                  ★
                </div>

                <div className="encouragement-info">
                  <strong>
                    {item.reason}
                  </strong>

                  <span>
                    {item.date}
                  </span>
                </div>

                <strong className="encouragement-points">
                  +{item.points}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="student-empty-list">
            <div>★</div>

            <h3>No encouragements yet</h3>

            <p>
              Add a positive note and reward this
              student with points.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          EXAM MODAL
          ===================================================== */}

      {isExamModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setIsExamModalOpen(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  NEW RESULT
                </p>

                <h3>Add Exam Result</h3>

                <p>
                  Add a new exam result for{" "}
                  {student.firstName}.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setIsExamModalOpen(false)
                }
              >
                ×
              </button>
            </div>

            <form
              className="class-form"
              onSubmit={handleAddExam}
            >
              <div className="form-field">
                <label>Exam Name</label>

                <input
                  type="text"
                  placeholder="e.g. Mathematics Midterm"
                  value={examForm.examName}
                  onChange={(event) =>
                    setExamForm(
                      (previous) => ({
                        ...previous,
                        examName:
                          event.target.value,
                      }),
                    )
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Score</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="18"
                    value={examForm.score}
                    onChange={(event) =>
                      setExamForm(
                        (previous) => ({
                          ...previous,
                          score:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={examForm.maxScore}
                    onChange={(event) =>
                      setExamForm(
                        (previous) => ({
                          ...previous,
                          maxScore:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Exam Date</label>

                <input
                  type="date"
                  value={examForm.examDate}
                  onChange={(event) =>
                    setExamForm(
                      (previous) => ({
                        ...previous,
                        examDate:
                          event.target.value,
                      }),
                    )
                  }
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setIsExamModalOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
    CLASS ACTIVITY MODAL
    ===================================================== */}

{isActivityModalOpen && (
  <div
    className="modal-overlay"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setIsActivityModalOpen(false);
      }
    }}
  >
    <div className="modal">
      <div className="modal-header">
        <div>
          <p className="eyebrow">
            CLASSROOM PERFORMANCE
          </p>

          <h3>
            Add Class Activity
          </h3>

          <p>
            Record a classroom activity
            for {student.firstName}.
          </p>
        </div>

        <button
          className="modal-close"
          onClick={() =>
            setIsActivityModalOpen(false)
          }
        >
          ×
        </button>
      </div>

      <form
        className="class-form"
        onSubmit={
          handleAddClassActivity
        }
      >
        <div className="form-field">
          <label>
            Activity Description
          </label>

          <textarea
            rows={4}
            placeholder="e.g. Excellent participation in today's discussion"
            value={
              activityForm.description
            }
            onChange={(event) =>
              setActivityForm(
                (previous) => ({
                  ...previous,
                  description:
                    event.target.value,
                }),
              )
            }
            required
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>
              Score
            </label>

            <input
              type="number"
              min="1"
              max="20"
              step="0.01"
              placeholder="18"
              value={
                activityForm.score
              }
              onChange={(event) =>
                setActivityForm(
                  (previous) => ({
                    ...previous,
                    score:
                      event.target.value,
                  }),
                )
              }
              required
            />

            <small className="form-field-hint">
              Score must be between
              1 and 20.
            </small>
          </div>

          <div className="form-field">
            <label>
              Date
            </label>

            <input
              type="date"
              value={
                activityForm.date
              }
              onChange={(event) =>
                setActivityForm(
                  (previous) => ({
                    ...previous,
                    date:
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
              setIsActivityModalOpen(
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
            Save Activity
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* =====================================================
          ASSIGNMENT MODAL
          ===================================================== */}

      {isAssignmentModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setIsAssignmentModalOpen(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  NEW ASSIGNMENT
                </p>

                <h3>Add Assignment</h3>

                <p>
                  Create a new assignment for{" "}
                  {student.firstName}.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setIsAssignmentModalOpen(
                    false,
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              className="class-form"
              onSubmit={handleAddAssignment}
            >
              <div className="form-field">
                <label>
                  Assignment Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Chapter 4 Exercises"
                  value={
                    assignmentForm.title
                  }
                  onChange={(event) =>
                    setAssignmentForm(
                      (previous) => ({
                        ...previous,
                        title:
                          event.target.value,
                      }),
                    )
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Description
                </label>

                <textarea
                  rows={4}
                  placeholder="Describe the assignment..."
                  value={
                    assignmentForm.description
                  }
                  onChange={(event) =>
                    setAssignmentForm(
                      (previous) => ({
                        ...previous,
                        description:
                          event.target.value,
                      }),
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={
                    assignmentForm.dueDate
                  }
                  onChange={(event) =>
                    setAssignmentForm(
                      (previous) => ({
                        ...previous,
                        dueDate:
                          event.target.value,
                      }),
                    )
                  }
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setIsAssignmentModalOpen(
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
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ENCOURAGEMENT MODAL
          ===================================================== */}

      {isScoreModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setIsScoreModalOpen(false);
            }
          }}
        >
          <div className="modal small-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  POSITIVE FEEDBACK
                </p>

                <h3>
                  Add Encouragement
                </h3>

                <p>
                  Reward{" "}
                  {student.firstName}{" "}
                  {student.lastName} for a
                  positive achievement.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setIsScoreModalOpen(false)
                }
              >
                ×
              </button>
            </div>

            <form
              className="class-form"
              onSubmit={handleAddScore}
            >
              <div className="form-field">
                <label>
                  Reason for Encouragement
                </label>

                <input
                  type="text"
                  placeholder="e.g. Excellent participation"
                  value={scoreForm.reason}
                  onChange={(event) =>
                    setScoreForm(
                      (previous) => ({
                        ...previous,
                        reason:
                          event.target.value,
                      }),
                    )
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Points</label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="10"
                    value={scoreForm.points}
                    onChange={(event) =>
                      setScoreForm(
                        (previous) => ({
                          ...previous,
                          points:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Date</label>

                  <input
                    type="date"
                    value={scoreForm.date}
                    onChange={(event) =>
                      setScoreForm(
                        (previous) => ({
                          ...previous,
                          date:
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
                    setIsScoreModalOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Add Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}