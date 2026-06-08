
# College ERP System

A full-featured College ERP (Enterprise Resource Planning) web application for managing students, professors, departments, subjects, attendance, notifications, and more. This repository contains a Java Spring Boot backend and a React + Vite frontend with Firebase integration for storage and authentication.

---

**Status:** Production-ready components (backend + frontend). Development and testing workflows included.

---

## Project

College ERP System provides role-based access for HODs, Professors and Students. HODs can manage users, departments, courses and academic records; Professors can manage student records, attendance and notifications; Students can view and update their profile and view attendance and notifications.

## Features

- Role-based access control (HOD, Professor, Student)
- Student, Professor, Subject, Department and Semester management (CRUD)
- Attendance recording and retrieval
- Notifications and bulk email capability
- Firebase-based image storage and optional authentication
- Charts and dashboards for analytics (ApexCharts)

## Architecture

- Backend: Spring Boot application exposing REST APIs and JPA entities (MySQL)
- Frontend: React + Vite, Redux for state management, TailwindCSS for styling
- Firebase: Storage for images and (optional) authentication

## Tech stack

- Java 11+, Spring Boot
- MySQL
- React, Vite, Redux, TailwindCSS
- Firebase (Storage / Auth)
- Maven build tooling

## Local setup

Follow these steps to run the project locally (Windows & Unix examples included).

1) Backend

Open a terminal and run:

```bash
cd Back-End/stud-erp
# Windows
./mvnw.cmd clean install
./mvnw.cmd spring-boot:run
# Unix / macOS
./mvnw clean install
./mvnw spring-boot:run
```

The backend reads configuration from `src/main/resources/application.properties` (see Configuration below).

2) Frontend

Open a separate terminal and run:

```bash
cd Fron-End/College-ERP
npm install
npm run dev
```

Vite will print the local URL (usually http://localhost:5173). Open the URL shown in your terminal.

3) Running both

Keep both servers running in separate terminals. The frontend communicates with the backend via configured API endpoints.

## Configuration

- Backend: update database and Firebase credentials in `src/main/resources/application.properties` inside the backend module.
- Place your Firebase service account JSON in `src/main/resources/` (the project includes an example key file; replace it with your own).

Essential properties to set in `application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/college_erp
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
# Firebase service account file name
firebase.service.account-file=erpsystem1-fa499-firebase-adminsdk-fbsvc-10d094ff89.json
```

## Database

Create a MySQL database before starting the backend. Example:

```sql
CREATE DATABASE college_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

When the backend starts, JPA will create/update tables automatically depending on the JPA settings in `application.properties`.

## Firebase

1. Create a Firebase project and enable Storage (and Authentication if required).
2. Generate a service account key (JSON) and save it to `src/main/resources/` of the backend module.
3. Update the `application.properties` Firebase file reference if you rename the key file.

## Testing

- Backend unit/integration tests are located in `Back-End/stud-erp/src/test/java` and can be run via Maven:

```bash
cd Back-End/stud-erp
./mvnw.cmd test
```

## Contributing

Contributions are welcome. Suggested workflow:

```bash
git fork <repo>
git clone <your-fork-url>
git checkout -b feat/short-description
# implement changes
git add .
git commit -m "feat: short description"
git push origin feat/short-description
# open a pull request
```

Please open issues for bugs or feature requests.

## License & contact

This repository is provided for educational use. Add a license as needed (MIT, Apache-2.0, etc.).

For questions contact: ankushgupta4747@gmail.com

---

