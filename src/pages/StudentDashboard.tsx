import { useMemo, useState } from "react";

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
  encouragements?: Encouragement[];
}

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

export default function StudentDashboard({
  student,
  classInfo,
  onBack,
  onUpdateStudent,
}: StudentDashboardProps) {
  const [isExamModalOpen, setIsExamModalOpen] =
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

  const [scoreForm, setScoreForm] = useState({
    reason: "",
    points: "",
    date: "",
  });

  const grades = student.grades ?? [];

  const encouragements =
    student.encouragements ?? [];

  const attendance = student.attendance ?? {
    present: 26,
    absent: 3,
    late: 1,
    total: 30,
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

    setExamForm({
      examName: "",
      score: "",
      maxScore: "20",
      examDate: "",
    });

    setIsExamModalOpen(false);
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
          <span>Encouragement Points</span>

          <strong>+{totalPoints}</strong>

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
            These notes will be kept as part of the
            student's educational record.
          </p>
        </section>

        <section className="student-section attendance-section">
          <div className="student-section-header">
            <div>
              <p className="eyebrow">
                TEMPORARY VIEW
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

                  <span>{item.date}</span>
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
                  <label>Maximum Score</label>

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

                <h3>Add Encouragement</h3>

                <p>
                  Reward {student.firstName}{" "}
                  {student.lastName} for a positive
                  achievement.
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