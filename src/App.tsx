import { useState } from "react";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/utilities.css";

import "./App.css";

import { AppProvider } from "./AppContext";

import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "./pages/Dashboard/Dashboard";

import Classes from "./pages/Classes/Classes";

import Tasks from "./pages/Tasks/Tasks" ;

import Settings from "./pages/Settings/Settings";


export type Page =
  | "dashboard"
  | "classes"
  | "tasks"
  | "settings";


function App() {

  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");


  const renderPage = () => {

    switch (currentPage) {

      case "classes":
        return <Classes />;

      case "tasks":
        return <Tasks />;

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