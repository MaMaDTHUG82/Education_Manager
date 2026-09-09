import { useState } from "react";

import "./App.css";

import { AppProvider } from "./AppContext";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";

import Classes from "./pages/Classes";

import Tasks from "./pages/Tasks" ;

import Settings from "./pages/Settings";

import Search from "./pages/Search";



export type Page =
  | "dashboard"
  | "classes"
  | "tasks"
  | "settings"
  | "search";




function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");

  const [openClassId, setOpenClassId] =
    useState<number | null>(null);

  const [openStudentId, setOpenStudentId] =
    useState<number | null>(null);

  const renderPage = () => {
  switch (currentPage) {
    case "classes":
      return (
        <Classes
          initialClassId={openClassId}
          initialStudentId={openStudentId}
        />
      );

    case "tasks":
      return <Tasks />;

    case "search":
      return (
        <Search
          onOpenClass={(classId) => {
            setOpenStudentId(null);
            setOpenClassId(classId);
            setCurrentPage("classes");
          }}
          onOpenStudent={(classId, studentId) => {
            setOpenClassId(classId);
            setOpenStudentId(studentId);
            setCurrentPage("classes");
          }}
        />
      );

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