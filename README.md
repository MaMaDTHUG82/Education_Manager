# Teacher_THUG

# 🎓 Teacher Manager

> A simple, fast, offline-first desktop application designed to help teachers manage students, classes, attendance, grades, and daily educational tasks.

---

## 📌 About the Project

I am building this project to help teachers and small educational institutes that still manage many of their daily tasks manually using paper and traditional methods.

The main goal is to make tasks such as **student management, class management, attendance tracking, grading, note-taking, and reporting** faster, more organized, and less error-prone.

This project is not intended to be a complicated or enterprise-level management system.

My goal is to build a **simple, practical, fast, and easy-to-use tool that a teacher can actually use every day.**

---

## 🎯 Goals

* Reduce the amount of paperwork
* Reduce time spent on repetitive tasks
* Prevent student information from being lost or scattered
* Provide quick access to student records
* Make attendance tracking faster
* Make class management easier
* Simplify grade management
* Generate printable reports
* Work without requiring an internet connection
* Remain lightweight enough for older or low-end laptops

---

## ✨ Features

### 👨‍🎓 Student Management

Manage all student information in one place:

* Full name
* Phone number
* Class
* Registration date
* Student status
* Teacher notes
* Educational history

---

### 📚 Class Management

Each class can contain information such as:

* Class name
* Level / grade
* Schedule
* Teacher
* Enrolled students
* Class sessions

---

### 📅 Attendance

Quickly record student attendance for each session.

The system can automatically calculate:

* Total sessions
* Attendance count
* Absence count
* Late arrivals
* Attendance percentage

The goal is to make recording attendance for an entire class possible in just a few seconds.

---

### 📝 Grade Management

Record grades for exams, assignments, and other activities.

The system can provide:

* Individual student grades
* Average grades
* Highest grade
* Lowest grade
* Overall student performance

---

### 📋 Assignments

Manage assignments for each class and track whether students have completed them.

---

### 🗒️ Teacher Notes

Teachers can keep private notes for individual students.

For example:

> The student needs more practice with speaking.

These notes become part of the student's educational record.

---

### 📊 Reports

Generate useful reports from stored data, including:

* Student performance reports
* Attendance reports
* Grade reports
* Class reports

Reports should eventually support printing and exporting to different formats.

---

### 🖨️ Printing

Since many educational institutes still rely on paper, printing is an important part of the project.

The application should support printing:

* Student lists
* Attendance sheets
* Grade sheets
* Student reports
* Class schedules

---

## 🖥️ Technology Stack

The project is being developed as a desktop application.

### Frontend

* React
* TypeScript
* Tailwind CSS

### Desktop

* Tauri

### Database

* SQLite

### Data Layer

* Drizzle ORM

---

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│          React UI           │
│       TypeScript + UI       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│            Tauri            │
│      Desktop Application    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│           SQLite            │
│        Local Database       │
└─────────────────────────────┘
```

The application stores its data locally and does not require an internet connection for normal use.

---

## 🗂️ Core Data

The main entities of the application include:

```text
Students
Classes
Class Members
Sessions
Attendance
Grades
Assignments
Assignment Submissions
Notes
```

Basic relationships:

```text
Class
  │
  ├── Students
  │
  └── Sessions
          │
          └── Attendance

Student
  ├── Grades
  ├── Assignments
  └── Notes
```

---

## 🚀 Development Roadmap

The project is currently under development and features will be added incrementally.

### Phase 1 — Foundation

* [ ] Project setup
* [ ] Tauri setup
* [ ] SQLite setup
* [ ] Database design
* [ ] UI foundation
* [ ] Dashboard

### Phase 2 — Education Management

* [ ] Student management
* [ ] Class management
* [ ] Session management
* [ ] Attendance tracking
* [ ] Grade management
* [ ] Teacher notes

### Phase 3 — Reports & Export

* [ ] Student reports
* [ ] Class reports
* [ ] Printing
* [ ] CSV export
* [ ] Excel export
* [ ] PDF export

### Phase 4 — Advanced Features

* [ ] Backup & restore
* [ ] Assignment management
* [ ] Calendar
* [ ] Multiple teachers
* [ ] Institute management
* [ ] Communication features

---

## 💾 Offline First

One of the core principles of this project is **Offline First**.

The application should remain fully functional without an internet connection.

```text
No Internet
     ↓
Application
     ↓
Local SQLite Database
     ↓
Everything keeps working
```

This is especially important for small educational institutes where reliable internet access may not always be available.

---

## 🎨 Design Principles

### Simplicity

A teacher should not need to navigate through multiple screens to perform a simple task.

### Speed

Daily tasks such as attendance should take only a few clicks.

### Ease of Use

The application should be understandable without requiring technical training.

### Centralized Information

All information related to a student should be accessible from one place.

### Lightweight

The application should remain lightweight and run comfortably on ordinary and older laptops.

---

## 🔐 Privacy

Student and educational data should remain as local as possible.

In the initial version, data is stored locally on the teacher's computer, and normal application usage does not require sending student information to an external server.

---

## 🎯 Final Goal

The goal of this project is not to build a complicated piece of software just to showcase technology.

My goal is to build a tool that a teacher can actually use every day and eventually say:

> **"I used to spend a lot of time and paper doing these things. Now it only takes a few clicks."**

---

## 👤 Developer

Developing by **MaMaD_THUG**



---

## 📄 License

This project is currently under development.

License information will be added later.

