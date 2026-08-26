import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type {
  ClassItem,
 // Student,
} from "./pages/Classes";

import {
  loadData,
  saveData,
  type AppData,
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


interface AppContextValue {
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


/*
 * --------------------------------------------------
 * APP PROVIDER
 * --------------------------------------------------
 */

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
   * Prevents the initial empty state from
   * overwriting the JSON file before loading.
   */
  const dataLoaded =
    useRef(false);


  /*
   * --------------------------------------------------
   * LOAD DATA
   * --------------------------------------------------
   */

  useEffect(() => {

    let cancelled = false;


    const initializeData =
      async () => {

        try {

          const data =
            await loadData();


          if (cancelled) {
            return;
          }


          /*
           * Restore classes.
           *
           * All student information is inside
           * the students belonging to each class.
           */
          setClasses(
            Array.isArray(data.classes)
              ? (data.classes as ClassItem[])
              : [],
          );


          /*
           * Restore recent activities.
           */
          setActivities(
            Array.isArray(data.activities)
              ? (
                  data.activities as RecentActivity[]
                )
              : [],
          );


          /*
           * Only enable saving AFTER loading
           * existing data.
           */
          dataLoaded.current = true;

        } catch (error) {

          console.error(
            "Failed to load application data:",
            error,
          );


          /*
           * Allow the application to continue
           * even if loading fails.
           */
          dataLoaded.current = true;

        }

      };


    initializeData();


    return () => {

      cancelled = true;

    };

  }, []);


  /*
   * --------------------------------------------------
   * SAVE DATA
   * --------------------------------------------------
   *
   * There is ONE save effect for the entire
   * application state.
   *
   * This prevents classes and activities from
   * overwriting each other.
   */

  useEffect(() => {

    if (!dataLoaded.current) {
      return;
    }


    const timeout =
      window.setTimeout(
        async () => {

          try {

            /*
             * Create normalized student data.
             *
             * The actual source of truth remains:
             *
             * classes -> students
             *
             * These arrays are also stored in JSON
             * so backup/export will be easier later.
             */

            const students =
              classes.flatMap(
                (classItem) =>
                  classItem.students.map(
                    (student) => ({
                      ...student,

                      classId:
                        classItem.id,
                    }),
                  ),
              );


            /*
             * Attendance
             */

            const attendance =
              classes.flatMap(
                (classItem) =>
                  classItem.students.flatMap(
                    (student) =>
                      (
                        student.attendanceRecords ??
                        []
                      ).map(
                        (record) => ({
                          ...record,

                          studentId:
                            student.id,

                          classId:
                            classItem.id,
                        }),
                      ),
                  ),
              );


            /*
             * Exams / Grades
             */

            const exams =
              classes.flatMap(
                (classItem) =>
                  classItem.students.flatMap(
                    (student) =>
                      (
                        student.grades ??
                        []
                      ).map(
                        (grade) => ({
                          ...grade,

                          studentId:
                            student.id,

                          classId:
                            classItem.id,
                        }),
                      ),
                  ),
              );


            /*
             * Assignments
             */

            const assignments =
              classes.flatMap(
                (classItem) =>
                  classItem.students.flatMap(
                    (student) =>
                      (
                        student.assignments ??
                        []
                      ).map(
                        (assignment) => ({
                          ...assignment,

                          studentId:
                            student.id,

                          classId:
                            classItem.id,
                        }),
                      ),
                  ),
              );


            /*
             * Class activities
             */

            const classActivities =
              classes.flatMap(
                (classItem) =>
                  classItem.students.flatMap(
                    (student) =>
                      (
                        student.classActivities ??
                        []
                      ).map(
                        (activity) => ({
                          ...activity,

                          studentId:
                            student.id,

                          classId:
                            classItem.id,
                        }),
                      ),
                  ),
              );


            /*
             * Encouragements
             */

            const encouragements =
              classes.flatMap(
                (classItem) =>
                  classItem.students.flatMap(
                    (student) =>
                      (
                        student.encouragements ??
                        []
                      ).map(
                        (encouragement) => ({
                          ...encouragement,

                          studentId:
                            student.id,

                          classId:
                            classItem.id,
                        }),
                      ),
                  ),
              );


            /*
             * Student notes
             */

            const notes =
              classes.flatMap(
                (classItem) =>
                  classItem.students
                    .filter(
                      (student) =>
                        Boolean(
                          student.notes?.trim(),
                        ),
                    )
                    .map(
                      (student) => ({
                        studentId:
                          student.id,

                        classId:
                          classItem.id,

                        text:
                          student.notes ?? "",
                      }),
                    ),
              );


            /*
             * Build the complete JSON object.
             */

            const dataToSave: AppData = {

              version: 1,

              classes,

              students,

              attendance,

              exams,

              assignments,

              classActivities,

              encouragements,

              notes,

              activities,

            };


            await saveData(
              dataToSave,
            );


            console.log(
              "Application data saved successfully.",
            );

          } catch (error) {

            console.error(
              "Failed to save application data:",
              error,
            );

          }

        },

        /*
         * Small debounce.
         *
         * Prevents multiple immediate writes
         * when several React states change quickly.
         */
        100,
      );


    return () => {

      window.clearTimeout(
        timeout,
      );

    };

  }, [
    classes,
    activities,
  ]);


  /*
   * --------------------------------------------------
   * RECENT ACTIVITIES
   * --------------------------------------------------
   */

  const addActivity = (
    activity: Omit<
      RecentActivity,
      "id" | "timestamp"
    >,
  ) => {

    const now =
      Date.now();


    setActivities(
      (previous) => [

        {
          ...activity,

          id: now,

          timestamp: now,
        },

        ...previous,

      ],
    );

  };


  const clearActivities =
    () => {

      setActivities([]);

    };


  /*
   * --------------------------------------------------
   * CONTEXT VALUE
   * --------------------------------------------------
   */

  const value =
    useMemo(
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
      ],
    );


  return (

    <AppContext.Provider
      value={value}
    >

      {children}

    </AppContext.Provider>

  );

}


/*
 * --------------------------------------------------
 * useApp
 * --------------------------------------------------
 */

export function useApp() {

  const context =
    useContext(
      AppContext,
    );


  if (!context) {

    throw new Error(
      "useApp must be used inside AppProvider",
    );

  }


  return context;

}