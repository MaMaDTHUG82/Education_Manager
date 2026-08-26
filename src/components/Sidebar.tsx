import type { Page } from "../App";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navigationItems: {
  id: Page;
  label: string;
  icon: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "⌂",
  },
  {
    id: "classes",
    label: "Classes",
    icon: "▦",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: "▤",
  },
];

export default function Sidebar({
  currentPage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">E</div>

        <div>
          <h1>Education</h1>
          <span>Manager</span>
        </div>
      </div>

      <nav className="navigation">
        <div className="nav-section-title">
          WORKSPACE
        </div>

        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              currentPage === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${
            currentPage === "settings" ? "active" : ""
          }`}
          onClick={() => onNavigate("settings")}
        >
          <span className="nav-icon">⚙</span>
          <span>Settings</span>
        </button>

        <div className="sidebar-version">
          Education Manager
          <span>v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}