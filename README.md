# 🚀 TaskFlow — Smart Team Task Management Platform

<div align="center">

### Organize Projects • Manage Teams • Track Progress

A modern full-stack task management platform built for teams to collaborate efficiently using project boards, role-based workflows, analytics dashboards, and secure authentication.

<br/>

![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/API-Express-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)
![Railway](https://img.shields.io/badge/Deploy-Railway-7B3FE4?style=for-the-badge)

</div>

---

# 🌐 Live Demo

🔗 Live Application:  
https://taskflow-production-9110.up.railway.app/

---

# 📌 Overview

TaskFlow is a full-stack collaborative task management application designed for teams and organizations to streamline workflow management.

The platform provides:

- 🔐 Secure authentication system
- 👥 Role-based access control
- 📋 Project & task organization
- 📊 Analytics dashboard
- ⚡ Kanban workflow management
- 📱 Fully responsive UI

---

# ✨ Core Features

## 🔑 Authentication & Security
- JWT-based authentication
- Secure password hashing using bcrypt
- Protected API routes
- Persistent login sessions

## 👨‍💼 Role-Based Access
### Admin
- Create/Delete projects
- Create/Delete tasks
- Assign tasks to members
- Manage teams

### Members
- View assigned tasks
- Update task progress
- Access personal dashboard

---

# 📋 Project Management

- Create and manage multiple projects
- Assign project members
- Color-coded project organization
- Real-time workflow visibility

---

# 📌 Task Management

- Create tasks with:
  - priority levels
  - due dates
  - project mapping
  - member assignments

- Kanban board workflow:
  - 📝 To Do
  - ⚡ In Progress
  - ✅ Completed

---

# 📊 Dashboard Analytics

Track:
- Total tasks
- Completed tasks
- Pending tasks
- Overdue tasks
- Priority distribution
- Completion percentage

---

# 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Styling | Custom CSS |
| Deployment | Railway |

---

# 📁 Project Structure

```bash
TaskFlow/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   │
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   └── vite.config.js
│
├── railway.json
└── README.md
