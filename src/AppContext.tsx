import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { ClassItem } from "./pages/Classes";

export type ActivityType =
  | "class_created"
  | "class_deleted"
  | "student_added"
  | "student_removed"
  | "student_moved"
  | "grade_added"
  | "attendance_recorded"
  | "assignment_added"
  | "class_activity_added"
  | "encouragement_added";

export interface RecentActivity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: number;
}

export interface AppContextValue {
  classes: ClassItem[];

  setClasses: Dispatch<
    SetStateAction<ClassItem[]>
  >;

  activities: RecentActivity[];

  addActivity: (
    activity: Omit<
      RecentActivity,
      "id" | "timestamp"
    >,
  ) => void;

  clearActivities: () => void;
}

const AppContext =
  createContext<
    AppContextValue | undefined
  >(undefined);

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
    >,
  ) => {
    const now = Date.now();

    setActivities((previous) => [
      {
        ...activity,
        id: now,
        timestamp: now,
      },
      ...previous,
    ]);
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const value = useMemo(
    () => ({
      classes,
      setClasses,
      activities,
      addActivity,
      clearActivities,
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