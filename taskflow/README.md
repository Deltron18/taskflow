# TaskFlow — Project & Task Manager

A full-stack web app for managing projects and tasks with role-based access control.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT
- **Frontend**: React 18, React Router v6, Axios
- **Deploy**: Railway (monorepo)

## Project Structure

```
taskflow/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + role check
│   │   └── error.js           # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Project.js         # Project + members schema
│   │   └── Task.js            # Task schema
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   ├── projects.js        # /api/projects/*
│   │   └── tasks.js           # /api/tasks/*
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   └── Layout.js  # Sidebar + top bar
│       │   ├── projects/
│       │   │   ├── ProjectCard.js
│       │   │   └── ProjectModal.js
│       │   └── tasks/
│       │       ├── TaskCard.js
│       │       └── TaskModal.js
│       ├── context/
│       │   └── AuthContext.js  # Auth state + helpers
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js
│       │   ├── ProjectsPage.js
│       │   ├── ProjectDetailPage.js
│       │   ├── MyTasksPage.js
│       │   └── ProfilePage.js
│       ├── utils/
│       │   └── api.js          # Axios instance + interceptors
│       ├── App.js
│       ├── index.js
│       └── index.css
├── package.json               # Root build script
├── railway.json
├── nixpacks.toml
└── .gitignore
```

## Features

- **Auth**: Signup / Login with JWT, protected routes
- **Projects**: Create, edit, delete projects with color labels and status
- **Team Management**: Invite members by email, assign Admin/Member roles, remove members
- **Tasks**: Create, assign, edit, delete tasks with priority, status, due dates, tags
- **Kanban Board**: 4-column board (To Do → In Progress → Review → Done)
- **Dashboard**: Stats overview + recent tasks + project list
- **My Tasks**: All tasks assigned to you across projects
- **Role-Based Access**:
  - **Admin**: Full CRUD on project, tasks, members, roles
  - **Member**: Create tasks, update status of assigned tasks

## Local Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd taskflow
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start
```

---

## Deploy to Railway

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2 — Create Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `taskflow` repository

### Step 3 — Add MongoDB

1. In your Railway project, click **+ New** → **Database** → **MongoDB**
2. Once provisioned, click the MongoDB service → **Connect** tab
3. Copy the `MONGO_PUBLIC_URL` value

### Step 4 — Set environment variables

Click your app service → **Variables** tab → add:

| Variable | Value |
|---|---|
| `MONGO_URI` | (paste MongoDB URL from step 3) |
| `JWT_SECRET` | any long random string |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

### Step 5 — Deploy

Railway will automatically build and deploy. Your app will be live at the generated Railway URL.

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Private | List user's projects |
| POST | `/api/projects` | Private | Create project |
| GET | `/api/projects/:id` | Member | Get project detail |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Admin | Remove member |
| PUT | `/api/projects/:id/members/:uid` | Admin | Change member role |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks?project=id` | Member | List project tasks |
| GET | `/api/tasks/my` | Private | Tasks assigned to me |
| GET | `/api/tasks/dashboard` | Private | Dashboard stats |
| POST | `/api/tasks` | Member | Create task |
| PUT | `/api/tasks/:id` | Member/Admin | Update task |
| DELETE | `/api/tasks/:id` | Admin/Creator | Delete task |
