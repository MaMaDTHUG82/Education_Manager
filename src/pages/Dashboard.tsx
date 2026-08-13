export default function Dashboard() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Dashboard</h2>
          <p className="page-description">
            Welcome back. Here is an overview of your education workspace.
          </p>
        </div>

        <div className="date-card">
          <span>Today</span>
          <strong>August 13, 2026</strong>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">▦</div>
          <div>
            <span>Total Classes</span>
            <strong>4</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◉</div>
          <div>
            <span>Students</span>
            <strong>118</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <span>Attendance</span>
            <strong>94%</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div>
            <span>Pending Tasks</span>
            <strong>12</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel calendar-panel">
          <div className="panel-header">
            <div>
              <h3>Calendar</h3>
              <span>August 2026</span>
            </div>

            <button className="icon-button">•••</button>
          </div>

          <div className="calendar">
            <div className="calendar-week">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>

            <div className="calendar-days">
              {Array.from({ length: 31 }, (_, index) => {
                const day = index + 1;

                return (
                  <div
                    key={day}
                    className={`calendar-day ${
                      day === 13 ? "today" : ""
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Upcoming</h3>
              <span>Next activities</span>
            </div>
          </div>

          <div className="activity-list">
            <div className="activity">
              <div className="activity-dot purple" />

              <div>
                <strong>Mathematics Class</strong>
                <span>Today · 10:00 AM</span>
              </div>
            </div>

            <div className="activity">
              <div className="activity-dot blue" />

              <div>
                <strong>Science Assignment</strong>
                <span>Tomorrow · Due</span>
              </div>
            </div>

            <div className="activity">
              <div className="activity-dot green" />

              <div>
                <strong>Class 8/2</strong>
                <span>Friday · 09:30 AM</span>
              </div>
            </div>

            <div className="activity">
              <div className="activity-dot orange" />

              <div>
                <strong>Student Report</strong>
                <span>Friday · Review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel recent-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Activity</h3>
            <span>Latest changes in your workspace</span>
          </div>

          <button className="text-button">View all</button>
        </div>

        <div className="recent-list">
          <div className="recent-item">
            <div className="recent-avatar">AR</div>

            <div>
              <strong>Ali Rahimi</strong>
              <span>Grade updated to 18.5</span>
            </div>

            <time>10 min ago</time>
          </div>

          <div className="recent-item">
            <div className="recent-avatar">SM</div>

            <div>
              <strong>Sara Mohammadi</strong>
              <span>Attendance marked present</span>
            </div>

            <time>35 min ago</time>
          </div>

          <div className="recent-item">
            <div className="recent-avatar">MA</div>

            <div>
              <strong>Math Assignment</strong>
              <span>New assignment created</span>
            </div>

            <time>1 hour ago</time>
          </div>
        </div>
      </section>
    </div>
  );
}