const classes = [
  {
    name: "Mathematics 7/1",
    subject: "Mathematics",
    students: 30,
    color: "purple",
  },
  {
    name: "Science 8/2",
    subject: "Science",
    students: 28,
    color: "blue",
  },
  {
    name: "Physics 9/1",
    subject: "Physics" ,
    students: 30,
    color: "green",
  },
  {
    name: "Mathematics 8/1",
    subject: "Mathematics",
    students: 30,
    color: "orange",
  },
];

export default function Classes() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h2>Classes</h2>
          <p className="page-description">
            Manage your classes and students.
          </p>
        </div>

        <button className="primary-button">
          + Create Class
        </button>
      </header>

      <div className="class-toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search classes..."
          />
        </div>

        <button className="filter-button">
          All Classes ▾
        </button>
      </div>

      <section className="classes-grid">
        {classes.map((item) => (
          <button
            className="class-card"
            key={item.name}
          >
            <div
              className={`class-card-icon ${item.color}`}
            >
              ▦
            </div>

            <div className="class-card-content">
              <h3>{item.name}</h3>

              <p>{item.subject}</p>

              <div className="class-card-footer">
                <span>
                  👥 {item.students} students
                </span>

                <span className="arrow">→</span>
              </div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}