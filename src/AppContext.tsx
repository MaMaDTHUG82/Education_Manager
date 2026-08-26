import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { ClassItem } from "./pages/Classes";

import {
  loadData,
  saveData,
} from "./storage/storage";


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
    >
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


  /*
   * Load saved data when the application starts.
   */
  useEffect(() => {

    let mounted = true;


    async function initializeData() {

      const data = await loadData();


      if (!mounted) {
        return;
      }


      setClasses(
        data.classes as ClassItem[]
      );


      setActivities(
        data.activities as RecentActivity[]
      );

    }


    initializeData();


    return () => {

      mounted = false;

    };

  }, []);


  /*
   * Save classes whenever they change.
   *
   * We intentionally skip the initial empty state.
   * The data loaded from storage will be applied
   * by the initialization effect above.
   */
  useEffect(() => {

    const timeout = setTimeout(
      async () => {

        const data = await loadData();

        await saveData({
          ...data,
          classes,
        });

      },
      0
    );


    return () => {

      clearTimeout(timeout);

    };

  }, [classes]);


  /*
   * Save activities whenever they change.
   */
  useEffect(() => {

    const timeout = setTimeout(
      async () => {

        const data = await loadData();

        await saveData({
          ...data,
          activities,
        });

      },
      0
    );


    return () => {

      clearTimeout(timeout);

    };

  }, [activities]);


  const addActivity = (
    activity: Omit<
      RecentActivity,
      "id" | "timestamp"
    >
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

    [
      classes,
      activities,
    ]
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
      "useApp must be used inside AppProvider"
    );

  }


  return context;

}