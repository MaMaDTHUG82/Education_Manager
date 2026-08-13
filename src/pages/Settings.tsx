export default function Settings() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">APPLICATION</p>
          <h2>Settings</h2>
          <p className="page-description">
            Manage your Education Manager preferences.
          </p>
        </div>
      </header>

      <section className="settings-list">
        <div className="setting-card">
          <div>
            <span className="setting-icon">文</span>

            <div>
              <h3>Language</h3>
              <p>
                Select the application language.
              </p>
            </div>
          </div>

          <select defaultValue="English">
            <option>English</option>
          </select>
        </div>

        <div className="setting-card disabled">
          <div>
            <span className="setting-icon">◐</span>

            <div>
              <h3>Appearance</h3>
              <p>
                Customize the application theme.
              </p>
            </div>
          </div>

          <span className="coming-soon">
            Coming soon
          </span>
        </div>

        <div className="setting-card disabled">
          <div>
            <span className="setting-icon">↥</span>

            <div>
              <h3>Backup & Restore</h3>
              <p>
                Backup and restore your education data.
              </p>
            </div>
          </div>

          <span className="coming-soon">
            Coming soon
          </span>
        </div>
      </section>
    </div>
  );
}