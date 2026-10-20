# TaskMaster Pro — Contra Portfolio Showcase Package

Everything you need to publish this project onto **[Contra](https://contra.com)** and attract freelance clients or showcase your full-stack engineering skills.

---

## 📸 Portfolio Screenshots (Ready in `contra_assets/`)

All images have been generated in **Retina HD (2x resolution)** inside:
📁 `C:\Users\PRENEEL\OneDrive\Desktop\to_do list - Copy\contra_assets\`

| Image File Name | Screen Description | Recommended Contra Section |
|---|---|---|
| **`01_Landing_Hero_Light.png`** | Clean, high-converting Landing Hero (Light Mode) | Project Cover / Hero Image |
| **`02_Landing_Hero_Dark.png`** | Sleek Dark Mode Landing Hero with gradient accents | Carousel Slide 2 |
| **`03_Dashboard_Tasks_Dark.png`** | Full Productivity Dashboard with Task Cards & Progress Bar | Key Feature / Solution |
| **`04_Dashboard_Tasks_Light.png`** | Clean daytime Dashboard view | Light/Dark Mode Comparison |
| **`05_Task_Creation_Modal.png`** | Interactive Task Creation Modal with Priority & Date Presets | UX / Interactive Design |
| **`06_Trash_And_Recovery_Drawer.png`** | Soft-Delete Recovery System (Restore or Delete Permanently) | Engineering Highlights |
| **`07_Admin_Console_User_Directory.png`** | Global Admin Panel & User Management Directory | Role-Based Access Control |
| **`08_Admin_Console_Global_Tasks.png`** | Multi-tenant task oversight and administrative tools | Scalability & Architecture |
| **`09_User_Profile_And_Security.png`** | Email verification, password security & user settings | Security & Authentication |

---

## 📝 Copy-Paste Text for Contra Project Fields

### 1. Project Title
```text
TaskMaster Pro — Full-Stack Task & Productivity SaaS Platform
```

### 2. Project Subtitle / Tagline
```text
A modern, high-performance task management web application engineered with FastAPI, React 19, PostgreSQL, and Tailwind CSS.
```

### 3. Role & Services
- **Full-Stack Web Development**
- **Frontend Development (React / Tailwind CSS)**
- **Backend API Engineering (FastAPI / Python)**
- **Database Architecture (PostgreSQL / SQLAlchemy)**

### 4. Skills & Tools (Tags)
`React`, `FastAPI`, `Python`, `PostgreSQL`, `Tailwind CSS`, `Vite`, `REST API`, `JWT Authentication`, `SQLAlchemy`, `UI/UX Design`, `Responsive Web Design`

---

## 📄 Contra Project Description / Case Study (Copy & Paste)

### 📌 Project Overview
**TaskMaster Pro** is a production-grade full-stack task management and productivity SaaS application designed for individuals and teams seeking clarity, speed, and organization. Built with a **FastAPI** Python backend, **PostgreSQL** relational database, and an ultra-responsive **React 19** frontend styled with **Tailwind CSS**, the platform offers seamless task management, soft-delete trash recovery, automated email reminders, and administrative governance.

---

### 🎯 The Challenge
Most standard to-do applications are either too basic or overly bloated. Users frequently encounter:
1. **Accidental Deletions**: Permanent loss of tasks due to missing recovery or undo systems.
2. **Poor Mobile & Theme Support**: Clunky interfaces lacking smooth dark mode.
3. **No Centralized Governance**: Inability for administrators to inspect system status, manage users, or moderate content.
4. **Sluggish Performance**: Heavy frameworks with slow load times.

---

### 💡 The Solution
TaskMaster Pro addresses these pain points with a snappy, intuitive, and secure solution:
- **Instant Productivity Dashboard**: Real-time counters for Total, Completed, In Progress, Pending, and Urgent tasks, accompanied by a dynamic progress bar.
- **Smart Prioritization & Filtering**: High, Medium, and Low priority tags with custom date shortcuts (Today, Tomorrow, Next Week) and multi-field real-time search.
- **Soft-Delete Trash & Recovery**: Deleted tasks are moved into a safe Trash Drawer where they can be restored with a single click within 7 days.
- **Automated Task Reminders**: Integrated SMTP service that dispatches email notifications for upcoming tasks.
- **Role-Based Access Control (RBAC)**: Dedicated Admin Console providing platform-wide metrics, a user directory, global task moderation, and admin role creation.
- **Robust Security**: Bcrypt password hashing, JWT token authentication, and email OTP verification for identity validation and password recovery.

---

### 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas-Confetti
- **Backend**: FastAPI (Python 3.13), Uvicorn, Pydantic v2
- **Database & ORM**: PostgreSQL, SQLAlchemy, Alembic Migrations
- **Authentication**: JWT (python-jose), Bcrypt password hashing
- **Notifications**: Python smtplib with TLS encryption

---

## 🔗 How to Provide Live URLs on Contra

Contra allows you to attach **Live Website URLs** and **GitHub Repository URLs**:

### 1. GitHub Repository URL
You can push this repository to GitHub in 3 commands:
```bash
git init
git add .
git commit -m "Initial commit: TaskMaster Pro Full-Stack App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskmaster-pro.git
git push -u origin main
```
Paste your repo link on Contra:
`https://github.com/YOUR_USERNAME/taskmaster-pro`

### 2. Free One-Click Live Demo Deployment
To have a live working link on Contra:
- **Frontend (Vercel / Netlify)**: Connect your GitHub repo to [Vercel](https://vercel.com) (Root directory: `frontend`). It will automatically build and provide a live URL like:
  `https://taskmaster-pro.vercel.app`
- **Backend (Render / Railway)**: Connect your repo to [Render](https://render.com) (Root directory: `to_do`, Build command: `pip install -r requirement.txt`, Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`).
