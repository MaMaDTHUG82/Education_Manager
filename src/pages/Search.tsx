import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import type { ClassItem, Student } from "./Classes";

interface StudentSearchResult {
  student: Student;
  classInfo: ClassItem;
}

interface SearchProps {
  onOpenClass?: (classId: number) => void;
  onOpenStudent?: (
    classId: number,
    studentId: number,
  ) => void;
}

export default function Search({
  onOpenClass,
  onOpenStudent,
}: SearchProps) {
  const { classes } = useApp();

  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const classResults = useMemo(() => {
    if (!query) {
      return [];
    }

    return classes.filter((classItem) => {
      return (
        classItem.name
          .toLowerCase()
          .includes(query) ||
        classItem.subject
          .toLowerCase()
          .includes(query) ||
        classItem.location
          .toLowerCase()
          .includes(query)
      );
    });
  }, [classes, query]);

  const studentResults = useMemo<StudentSearchResult[]>(
    () => {
      if (!query) {
        return [];
      }

      const results: StudentSearchResult[] = [];

      classes.forEach((classInfo) => {
        classInfo.students.forEach((student) => {
          const fullName =
            `${student.firstName} ${student.lastName}`
              .toLowerCase();

          if (
            fullName.includes(query) ||
            student.firstName
              .toLowerCase()
              .includes(query) ||
            student.lastName
              .toLowerCase()
              .includes(query)
          ) {
            results.push({
              student,
              classInfo,
            });
          }
        });
      });

      return results;
    },
    [classes, query],
  );

  const totalResults =
    classResults.length +
    studentResults.length;

  const handleClassClick = (
    classId: number,
  ) => {
    onOpenClass?.(classId);
  };

  const handleStudentClick = (
    classId: number,
    studentId: number,
  ) => {
    onOpenStudent?.(
      classId,
      studentId,
    );
  };

  return (
    <div className="page search-page">
      <header className="page-header search-page-header">
        <div>
          <p className="eyebrow">
            SEARCH
          </p>

          <h2>Search</h2>

          <p className="page-description">
            Find classes and students quickly.
          </p>
        </div>
      </header>

      <section className="search-menu-panel">
        <div className="search-menu-input-wrapper">
          <span className="search-menu-icon">
            🔎
          </span>

          <input
            type="text"
            className="search-menu-input"
            placeholder="Search students or classes..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            autoFocus
          />

          {search && (
            <button
              type="button"
              className="search-menu-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {!query ? (
          <div className="search-menu-empty">
            <div className="search-menu-empty-icon">
              🔎
            </div>

            <h3>
              Search your education data
            </h3>

            <p>
              Search by student name,
              class name, subject or location.
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="search-menu-empty">
            <div className="search-menu-empty-icon">
              ?
            </div>

            <h3>
              No results found
            </h3>

            <p>
              Try searching with another
              student or class name.
            </p>
          </div>
        ) : (
          <div className="search-menu-results">
            <div className="search-results-summary">
              <span>
                Search results
              </span>

              <strong>
                {totalResults}
              </strong>
            </div>

            {classResults.length > 0 && (
              <section className="search-results-section">
                <div className="search-results-heading">
                  <span className="search-results-heading-icon">
                    ▦
                  </span>

                  <h3>Classes</h3>

                  <span>
                    {classResults.length}
                  </span>
                </div>

                <div className="search-results-list">
                  {classResults.map(
                    (classInfo) => (
                      <button
                        type="button"
                        className="search-result-card"
                        key={`class-${classInfo.id}`}
                        onClick={() =>
                          handleClassClick(
                            classInfo.id,
                          )
                        }
                      >
                        <div className="search-result-icon class-result-icon">
                          ▦
                        </div>

                        <div className="search-result-content">
                          <h4>
                            {classInfo.name}
                          </h4>

                          <p>
                            {classInfo.subject}
                          </p>

                          <div className="search-result-meta">
                            <span>
                              📍{" "}
                              {classInfo.location}
                            </span>

                            <span>
                              👥{" "}
                              {
                                classInfo.students
                                  .length
                              }{" "}
                              students
                            </span>
                          </div>
                        </div>

                        <span className="search-result-arrow">
                          →
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </section>
            )}

            {studentResults.length > 0 && (
              <section className="search-results-section">
                <div className="search-results-heading">
                  <span className="search-results-heading-icon">
                    👤
                  </span>

                  <h3>Students</h3>

                  <span>
                    {studentResults.length}
                  </span>
                </div>

                <div className="search-results-list">
                  {studentResults.map(
                    ({
                      student,
                      classInfo,
                    }) => (
                      <button
                        type="button"
                        className="search-result-card"
                        key={`student-${classInfo.id}-${student.id}`}
                        onClick={() =>
                          handleStudentClick(
                            classInfo.id,
                            student.id,
                          )
                        }
                      >
                        <div className="search-result-icon student-result-icon">
                          👤
                        </div>

                        <div className="search-result-content">
                          <h4>
                            {student.firstName}{" "}
                            {student.lastName}
                          </h4>

                          <p>
                            {classInfo.name}
                          </p>

                          <div className="search-result-meta">
                            <span>
                              📚{" "}
                              {classInfo.subject}
                            </span>
                          </div>
                        </div>

                        <span className="search-result-arrow">
                          →
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
}