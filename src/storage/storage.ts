export interface AppData {
  version: number;

  classes: unknown[];
  students: unknown[];
  attendance: unknown[];
  exams: unknown[];
  assignments: unknown[];
  classActivities: unknown[];
  encouragements: unknown[];
  notes: unknown[];
  activities: unknown[];
}

const STORAGE_KEY = "education_manager_data";

const defaultData: AppData = {
  version: 1,

  classes: [],
  students: [],
  attendance: [],
  exams: [],
  assignments: [],
  classActivities: [],
  encouragements: [],
  notes: [],
  activities: [],
};


export function loadData(): AppData {
  try {
    const savedData = localStorage.getItem(
      STORAGE_KEY
    );

    if (!savedData) {
      return defaultData;
    }

    const parsedData = JSON.parse(savedData);

    return {
      ...defaultData,
      ...parsedData,
    };

  } catch (error) {

    console.error(
      "Failed to load application data:",
      error
    );

    return defaultData;
  }
}


export function saveData(data: AppData): void {
  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );

  } catch (error) {

    console.error(
      "Failed to save application data:",
      error
    );

  }
}


export function clearData(): void {
  localStorage.removeItem(
    STORAGE_KEY
  );
}