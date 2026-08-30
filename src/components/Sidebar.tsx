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
        <div className="brand-icon"></div>

        <div>
          <h1>Education Manager</h1>
          
        </div>
      </div>

      <nav className="navigation">
        

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
          Made By MaMaD_THUG
          <span>v0.1.2</span>
        </div>
      </div>
    </aside>
  );
}