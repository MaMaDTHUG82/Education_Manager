import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import {
  appDataDir,
  join,
} from "@tauri-apps/api/path";


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


const FILE_NAME = "education_manager.json";


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


async function getStoragePath(): Promise<string> {
  const directory = await appDataDir();

  const directoryExists = await exists(directory);

  if (!directoryExists) {
    await mkdir(directory, {
      recursive: true,
    });
  }

  const filePath = await join(
    directory,
    FILE_NAME
  );

  console.log(
    "Education Manager storage path:",
    filePath
  );

  return filePath;
}


export async function loadData(): Promise<AppData> {

  try {

    const filePath =
      await getStoragePath();

    const fileExists =
      await exists(filePath);


    if (!fileExists) {

      await saveData(defaultData);

      return defaultData;

    }


    const content =
      await readTextFile(filePath);


    if (!content.trim()) {

      return defaultData;

    }


    const parsedData =
      JSON.parse(content);


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


export async function saveData(
  data: AppData
): Promise<void> {

  try {

    const filePath =
      await getStoragePath();


    await writeTextFile(
      filePath,
      JSON.stringify(
        data,
        null,
        2
      )
    );


  } catch (error) {

    console.error(
      "Failed to save application data:",
      error
    );

    throw error;

  }

}


export async function clearData(): Promise<void> {

  const filePath =
    await getStoragePath();


  await writeTextFile(
    filePath,
    JSON.stringify(
      defaultData,
      null,
      2
    )
  );

}