import { getDatabase } from "./database/db";
import { useState } from "react";
import "./App.css";

import { AppProvider } from "./AppContext";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";



export type Page =
  | "dashboard"
  | "classes"
  | "notes"
  | "settings";

function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "classes":
        return <Classes />;

      case "notes":
        return <Notes />;

      case "settings":
        return <Settings />;

      case "dashboard":
      default:
        return <Dashboard />;
    }
  };
            
  return (
    <AppProvider>
      <div className="app">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />

        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;