# TaskMaster Pro - Full-Stack To-Do Application

A complete, high-performance To-Do and Task Management platform with an automated **FastAPI** backend and a modern **React 19 + Vite + Tailwind CSS** frontend.

---

## 🌟 Features Overview

### 🎨 Frontend (React 19 + Vite + Tailwind CSS)
- **Dark / Light Mode**: Instant toggle with persistence in `localStorage`.
- **Dashboard & Productivity Analytics**:
  - Live counts for Total, Completed, In Progress, Pending, and Urgent tasks.
  - Interactive overall completion percentage bar.
- **Task Management**:
  - Create, view, edit, and organize tasks.
  - Priority flags (**High**, **Medium**, **Low**) with distinct badges.
  - Real-time search by Title and Description.
  - Multi-filtering by Status (**Pending**, **In Progress**, **Completed**) and Priority.
  - Sorting by **Creation Date**, **Due Date**, **Priority**, or **Alphabetical**.
  - One-click task completion with celebratory **confetti animations**.
- **Trash & Soft-Delete Recovery**:
  - Soft delete system: tasks are safely held in the Trash drawer.
  - 1-click **Restore** or **Permanent Delete**.
- **Automated Task Reminders**:
  - "Send Reminders" button triggers the email dispatch for tasks due tomorrow.
- **Authentication & User Profiles**:
  - Secure JWT authentication with persistent session.
  - Password strength validation checking length, uppercase, lowercase, numbers, and symbols.
  - **Email OTP Verification** (send & verify 4-digit code).
  - **Forgot Password Flow** with email OTP verification.
  - In-app profile editor (update name/email, change password, delete account).
- **Administrative Control Panel** (for Admins):
  - Global user directory with roles and verification statuses.
  - View individual user's task lists.
  - Global task explorer across all users.
  - Create new administrators (Main Admin privilege).
  - Soft-delete or remove users and tasks.

---

## 🛠️ Backend Bug Fixes Applied

1. **CORS Middleware Enabled**: Unblocked browser cross-origin requests (`http://localhost:5173`).
2. **Missing `.env` Setup**: Copied configuration `.env` file with PostgreSQL connection and SMTP settings, and added safe fallback defaults in `config.py`.
3. **Static UUID Evaluation Bug**: Changed `default=str(uuid.uuid4())` in `User` and `Todo` models to dynamic callables `default=lambda: str(uuid.uuid4())` and explicit UUID assignment in route handlers to avoid primary key collisions.
4. **`create_access_token` Timedelta Bug**: Fixed `timedelta(expires_delta)` crash when passed integer minutes or None. Now safely supports `int`, `float`, `timedelta`, or default token expiration.
5. **FastAPI Route Parameter Mismatch**: Fixed `/Todo_data/{id}` where function parameter was `todo_id: str` causing 422 Unprocessable Entity errors.
6. **Task Creation Blocker**: Fixed `description_exists(None, ...)` blocking multiple tasks with empty descriptions.
7. **Admin Route Query Bug**: Fixed `admin/users/{user_id}/todos` filtering `Todo.id == None` when `todo_id` query param was omitted, which caused empty results.
8. **Admin Role Authorization**: Fixed `get_current_admin` so standard admins can view admin routes while reserving admin creation for main admin (`is_main_admin`).
9. **OTP Queries Cross-Join Bug**: Fixed unjoined `User.is_deleted == False` inside `OTP_Model` queries in email and password reset verification.
10. **Missing Return Statements**: Fixed `all_data_read` which was querying users but omitted `return all_user`.
11. **New API Endpoints Added**:
    - `GET /v1/user/me`: Current authenticated user profile.
    - `GET /v1/Todo/trash`: Soft-deleted tasks for recovery.
    - `DELETE /v1/Todo/permanent_delete/{todo_id}`: Permanent task removal.

---

## 🚀 How to Run the Project

### Option A: One-Click Launcher (Windows)
Double-click **`run_project.bat`** in the project root. It will:
1. Start the FastAPI backend on `http://127.0.0.1:8000`.
2. Start the Vite React frontend on `http://localhost:5173`.
3. Automatically launch your default browser to `http://localhost:5173`.

---

### Option B: Run Services Manually

#### 1. Start the Backend
```bash
cd to_do
.\venv\Scripts\activate
python main.py
```
- API is running at: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger UI): `http://127.0.0.1:8000/docs`

#### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
- Frontend UI is running at: `http://localhost:5173`

---

## 👥 Pre-Configured Admin Credentials
- **Admin Email**: `dhameliyautsav08@gmail.com`
- **Main Admin**: UTSAV
- Or register any new account via the **Sign Up** tab in the UI!
