import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ClassItem,
  Student,
} from "./pages/Classes";

export interface ClassSchedule {
  day: number;
  startTime: string;
  endTime: string;
}

export interface RecentActivity {
  id: number;
  type:
    | "class_created"
    | "student_added"
    | "grade_added"
    | "attendance"
    | "assignment_added"
    | "class_activity"
    | "encouragement";

  title: string;
  description: string;
  timestamp: number;
}

interface AppContextValue {
  classes: ClassItem[];

  setClasses: React.Dispatch<
    React.SetStateAction<ClassItem[]>
  >;

  activities: RecentActivity[];

  addActivity: (
    activity: Omit<
      RecentActivity,
      "id" | "timestamp"
    >
  ) => void;

  updateClass: (
    updatedClass: ClassItem
  ) => void;

  deleteClass: (
    classId: number
  ) => void;
}

const AppContext =
  createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [classes, setClasses] =
    useState<ClassItem[]>([]);

  const [activities, setActivities] =
    useState<RecentActivity[]>([]);

  const addActivity = (
    activity: Omit<
      RecentActivity,
      "id" | "timestamp"
    >
  ) => {
    setActivities((previous) => [
      {
        ...activity,
        id: Date.now(),
        timestamp: Date.now(),
      },
      ...previous,
    ]);
  };

  const updateClass = (
    updatedClass: ClassItem,
  ) => {
    setClasses((previous) =>
      previous.map((item) =>
        item.id === updatedClass.id
          ? updatedClass
          : item,
      ),
    );
  };

  const deleteClass = (
    classId: number,
  ) => {
    setClasses((previous) =>
      previous.filter(
        (item) => item.id !== classId,
      ),
    );
  };

  const value = useMemo(
    () => ({
      classes,
      setClasses,
      activities,
      addActivity,
      updateClass,
      deleteClass,
    }),
    [classes, activities],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider",
    );
  }

  return context;
}