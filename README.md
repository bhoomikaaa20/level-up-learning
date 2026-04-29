# 🎮 QuestXP – Gamified Learning Platform

## 📌 Overview

QuestXP is a full-stack MERN application that provides a gamified learning experience. Users can play quizzes, earn XP, coins, and streaks, while admins dynamically manage all content including subjects, levels, and questions.

---

## 🚀 Features

### 👤 User

* Signup & Login (JWT Authentication)
* View subjects and levels
* Play quizzes with timer
* Earn XP, coins, and streaks
* Dashboard with progress tracking
* Global & Weekly Leaderboard
* Daily challenge system

---

### 🛠️ Admin

* Create / Delete Subjects
* Create / Delete Levels
* Create / Edit / Delete Questions
* View and manage users
* Ban / Unban users
* View platform stats (users, questions, attempts)

---

## 🧠 Architecture

```text
Frontend (React + TypeScript)
        ↓
Backend (Node.js + Express)
        ↓
Database (MongoDB)
```

* Fully dynamic (no hardcoded data)
* Role-based access (admin/user)
* REST API driven

---

## 📁 Folder Structure

### Backend (`server/`)

```text
src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── app.ts
 ├── server.ts
```

### Frontend (`client/`)

```text
src/
 ├── pages/
 ├── components/
 ├── hooks/
 ├── routes/
```

---

## ⚙️ Tech Stack

### Frontend

* React (TypeScript)
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt (password hashing)

---

## 🔐 Authentication

* JWT-based authentication
* Token stored in localStorage
* Protected routes (admin/user)
* Role-based access control

---

## 🔌 API Endpoints

### Auth

* `POST /api/auth/signup`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Subjects & Levels

* `GET /api/subjects`
* `GET /api/subjects/:id/levels`

### Quiz

* `GET /api/quiz/:levelId`
* `POST /api/quiz/submit`

### Leaderboard

* `GET /api/leaderboard/global`
* `GET /api/leaderboard/weekly`

### Admin

* `POST /api/admin/subject`
* `POST /api/admin/level`
* `POST /api/admin/question`
* `GET /api/admin/users`
* `PATCH /api/admin/users/:id/ban`

---

## 🛠️ Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd level-up-learning
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/levelup
JWT_SECRET=your_secret_key
```

Run server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🧪 Test Flow

1. Register/Login user
2. Login as Admin (set role in DB)
3. Create:

   * Subjects
   * Levels
   * Questions
4. Go to Home → Play quiz
5. Check leaderboard & dashboard

---

## ⚠️ Important Notes

* No hardcoded data — everything is admin-driven
* Ensure MongoDB is running locally
* Admin role must be manually assigned in DB
* All IDs use `_id` (MongoDB standard)

---

## 🚀 Future Enhancements

* Multiplayer quiz
* Real-time leaderboard (Socket.io)
* Badge & achievement system
* Notifications
* Mobile responsiveness improvements

