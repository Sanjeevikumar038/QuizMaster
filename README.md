# 🎯 QuizMaster - Quiz Management System

A full-stack web application for managing and taking quizzes. Admins can create quizzes, manage students, and track results. Students can register, take quizzes in a secure fullscreen environment, and receive results via email.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | https://quizmastersk.netlify.app |
| Backend API | https://quizmaster-backend-m800.onrender.com |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Spring Boot 3.2, Java 17, Maven |
| Database | PostgreSQL (NeonDB - cloud hosted) |
| Email | EmailJS |
| AI | OpenAI GPT-3.5-turbo |
| Frontend Deploy | Netlify |
| Backend Deploy | Render |

---

## ✨ Features

### 👨‍💼 Admin
- Create, edit, delete quizzes
- Add questions manually or via CSV import
- Generate questions using AI (OpenAI GPT-3.5-turbo)
- View all student results and scores
- Manage student accounts (activate/deactivate/delete)
- Grant retake permissions to students
- View leaderboard rankings
- Send quiz reminder emails manually
- View email statistics (reminders sent, results sent, total emails)

### 👨‍🎓 Student
- Register and login with database authentication
- Take quizzes in fullscreen secure mode
- Timer with visual countdown and audio beep in last 10 seconds
- Shuffled questions and answer options per attempt
- Auto-save quiz progress
- View quiz results with score, percentage, and grade
- View full attempt history
- View leaderboard rankings

### 📧 Email System
- Reminder emails automatically sent to all students when a new quiz is created
- Result emails automatically sent to students when they complete a quiz
- Manual reminder sending from Email Management page
- All emails logged to database with timestamps

---

## 🗄️ Database Schema

```
quizzes          → id, title, description, timeLimit, createdAt
questions        → id, quizId, questionText, questionType
options          → id, questionId, optionText, isCorrect
students         → id, username, email, password, active, deleted
quiz_attempts    → id, quizId, studentName, score, totalQuestions, timeTaken, completedAt
retake_permissions → id, studentName, quizId
user_sessions    → id, username, userRole, sessionToken, createdAt
email_logs       → id, email, type, quizId, quizTitle, status, timestamp
```

---

## 📁 Project Structure

```
QuizSystem/
├── reactapp/                        → React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js             → Student & Admin login/signup
│   │   │   ├── EnhancedAdminDashboard.js
│   │   │   ├── EnhancedStudentDashboard.js
│   │   │   ├── TakeQuiz.js          → Fullscreen quiz with timer
│   │   │   ├── QuizResults.js       → Results display + email trigger
│   │   │   ├── QuizForm.js          → Create quiz form
│   │   │   ├── QuestionForm.js      → Add question form
│   │   │   ├── QuestionBank.js      → Manage all questions
│   │   │   ├── ManageQuizzes.js     → Quiz management
│   │   │   ├── AIQuestionGenerator.js → OpenAI question generation
│   │   │   ├── CSVImport.js         → Bulk question import
│   │   │   ├── EmailNotifications.js → Email management UI
│   │   │   ├── EmailService.js      → EmailJS integration
│   │   │   ├── AllStudentResults.js → Admin results view
│   │   │   ├── StudentResults.js    → Student results history
│   │   │   ├── UserAccounts.js      → Student account management
│   │   │   ├── AdminLeaderboard.js  → Admin leaderboard
│   │   │   ├── Leaderboard.js       → Student leaderboard
│   │   │   └── NotificationSystem.js
│   │   ├── utils/
│   │   │   └── constants.js         → API_BASE_URL
│   │   └── App.js                   → Main routing & auth
│   ├── .env                         → Environment variables
│   └── package.json
│
└── springapp/                       → Spring Boot Backend
    └── src/main/java/com/examly/springapp/
        ├── controller/
        │   ├── QuizController.java
        │   ├── QuestionController.java
        │   ├── StudentController.java
        │   ├── WorkingQuizAttemptController.java
        │   ├── ResultsController.java
        │   ├── RetakePermissionController.java
        │   ├── SessionController.java
        │   ├── UserSessionController.java
        │   ├── EmailController.java
        │   └── AdminWebController.java
        ├── model/
        │   ├── Quiz.java
        │   ├── Question.java
        │   ├── Option.java
        │   ├── Student.java
        │   ├── QuizAttempt.java
        │   ├── RetakePermission.java
        │   ├── UserSession.java
        │   └── EmailLog.java
        ├── repository/
        ├── service/
        ├── dto/
        └── config/
            ├── CorsConfig.java
            └── DataInitializer.java
```

---

## 🚀 Local Setup

### Prerequisites
- Java 17+
- Node.js 16+
- Maven 3.8+
- PostgreSQL or NeonDB account

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd QuizSystem
```

### 2. Backend Setup
```bash
cd springapp
```

Update `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:postgresql://<your-db-host>/<your-db-name>?sslmode=require
spring.datasource.username=<your-db-username>
spring.datasource.password=<your-db-password>
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

Run the backend:
```bash
mvn spring-boot:run
```

Backend will start at `http://localhost:8080`

### 3. Frontend Setup
```bash
cd reactapp
```

Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
REACT_APP_EMAILJS_TEMPLATE_REMINDER=your_reminder_template_id
REACT_APP_EMAILJS_TEMPLATE_RESULTS=your_results_template_id
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

Install dependencies and start:
```bash
npm install
npm start
```

Frontend will start at `http://localhost:3000`

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | admin | ******** |
| Student | Register via signup form | - |

> Admin login is accessed via the **"Admin Login"** button in the top navbar.



---

## 📊 API Endpoints

### Quizzes
```
GET    /api/quizzes              → Get all quizzes
POST   /api/quizzes              → Create quiz
GET    /api/quizzes/{id}         → Get quiz by ID
PUT    /api/quizzes/{id}         → Update quiz
DELETE /api/quizzes/{id}         → Delete quiz
```

### Questions
```
GET    /api/quizzes/{id}/questions       → Get questions for quiz
POST   /api/quizzes/{id}/questions       → Add question to quiz
DELETE /api/questions/{id}               → Delete question
```

### Students
```
GET    /api/students             → Get all students
POST   /api/students             → Create student
PUT    /api/students/{id}        → Update student
DELETE /api/students/{id}        → Delete student
```

### Quiz Attempts
```
GET    /api/quiz-attempts        → Get all attempts
POST   /api/quiz-attempts        → Submit quiz attempt
GET    /api/quiz-attempts/{studentName} → Get student attempts
```

### Sessions
```
POST   /api/sessions/login       → Create session
DELETE /api/sessions/logout      → End session
```

### Emails
```
GET    /api/emails/stats                    → Get email statistics
POST   /api/emails/send-reminders/{quizId}  → Send reminders for quiz
POST   /api/emails/log                      → Log email sent
POST   /api/emails/log-result               → Log result email
```

---

## 🔒 Security Features

- Role-based access control (Admin / Student)
- Session token authentication
- Fullscreen enforced during quiz
- Copy, paste, cut, right-click disabled during quiz
- Keyboard shortcuts (F11, Escape, Alt+Tab, F12) blocked during quiz
- Deleted/deactivated accounts blocked from login

---

## 📝 CSV Import Format

To bulk import questions, use this CSV format:

```csv
Question Text,Option A,Option B,Option C,Option D,Correct Answer
What is 2+2?,2,3,4,5,C
What is the capital of France?,London,Paris,Berlin,Madrid,B
Which planet is closest to the Sun?,Venus,Earth,Mercury,Mars,C
```

Download a sample CSV from the CSV Import section in the admin dashboard.

---

## 🎓 Grading System

| Percentage | Grade |
|---|---|
| 90% and above | O |
| 85% - 89% | A+ |
| 80% - 84% | A |
| 75% - 79% | B+ |
| 70% - 74% | B |
| 60% - 69% | C+ |
| 50% - 59% | D |
| Below 50% | F |

---

## 🚢 Deployment

### Frontend (Netlify)
```bash
cd reactapp
npm run build
# Deploy the build/ folder to Netlify
# Set environment variables in Netlify dashboard
```

### Backend (Render)
```bash
# Connect your GitHub repo to Render
# Set build command: mvn clean package -DskipTests
# Set start command: java -jar target/springapp-0.0.1-SNAPSHOT.jar
# Add environment variables in Render dashboard
```

---

## 🛠️ Built With

- [React](https://reactjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [PostgreSQL](https://www.postgresql.org/)
- [NeonDB](https://neon.tech/)
- [EmailJS](https://www.emailjs.com/)
- [OpenAI API](https://openai.com/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)
