const notes = [
  {
    title: "Parent meeting",
    text: "Discussed student's recent progress and attendance.",
    date: "Today",
  },
  {
    title: "Class 7/1",
    text: "Students need additional practice with fractions.",
    date: "Yesterday",
  },
  {
    title: "Science project",
    text: "Remember to review the project submissions.",
    date: "Aug 10",
  },
];

export default function Notes() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h2>Notes</h2>
          <p className="page-description">
            Keep track of important information and reminders.
          </p>
        </div>

        <button className="primary-button">
          + New Note
        </button>
      </header>

      <div className="notes-grid">
        {notes.map((note) => (
          <article
            className="note-card"
            key={note.title}
          >
            <div className="note-card-top">
              <span className="note-icon">▤</span>

              <button className="icon-button">
                •••
              </button>
            </div>

            <h3>{note.title}</h3>

            <p>{note.text}</p>

            <span className="note-date">
              {note.date}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}