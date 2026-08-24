import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;


export async function getDatabase() {

  if (!db) {

    db = await Database.load(
      "sqlite:education_manager.db"
    );

    console.log(
      "SQLite database connected"
    );
  }

  return db;
}