# ✅ Taskify — Task Management App

A full-stack task management application built with Next.js 16 App Router.
Organize projects, track tasks with priorities and due dates, collaborate with teammates, and monitor activity — all in one place.

🔗 **[Live Demo](https://task-management-app-gamma-puce.vercel.app/)**

***

## ✨ Features

- 📁 **Projects** — create and manage multiple projects
- 📋 **Task Board** — Kanban-style board with status columns
- 🏷 **Tasks** — title, rich-text description, status, priority, assignee, due date
- 👥 **Assignees** — assign tasks to project members
- 🗑 **Trash & Restore** — soft delete with restore functionality
- 📊 **Dashboard** — stats, status/priority breakdown, recent activity
- 📜 **Activity Log** — per-task history of all changes
- 🔐 **Authentication** — credentials (email/password) + GitHub OAuth

***

## 📸 Screenshots

| Dashboard | Projects |
|-----------|----------|
| (<img width="1881" height="1310" alt="image" src="https://github.com/user-attachments/assets/6b680a3b-30bd-4c1f-a2cd-58dc8c631882" />
) | (<img width="1881" height="1310" alt="image" src="https://github.com/user-attachments/assets/014bcc5c-eb82-462e-a1e7-1eb015fc2d18" />
) |

| Task Board | Task Detail |
|------------|-------------|
| (<img width="1881" height="1310" alt="image" src="https://github.com/user-attachments/assets/6abebf47-b760-49f9-9e26-8056d4a33a51" />
) | (<img width="1881" height="1310" alt="image" src="https://github.com/user-attachments/assets/0f6386f3-cca0-4bb9-a64b-f1e6ef7cbf34" />
) |

| Tasks | Trash |
|-------------|-------------|
| (<img width="1881" height="1310" alt="image" src="https://github.com/user-attachments/assets/b2288aa7-8cae-4b61-a1c4-a9dc52316bbc" />
) | (<img width="1881" height="1310" alt="image" src="https://github.com/user-attachments/assets/5581e38a-089e-4116-98ed-3f53de042fc0" />
) |

***

## 🛠 Tech Stack

### Framework & Language
- **Next.js 16** — App Router, Server Actions, Turbopack
- **TypeScript** — strict mode throughout

### Database & ORM
- **PostgreSQL** — relational database
- **Prisma ORM 7** — schema, migrations, type-safe queries

### Authentication
- **NextAuth.js** — credentials provider + GitHub OAuth

### UI
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible component library
- **Tiptap** — rich-text editor for task descriptions
- **Lucide React** — icon set

### Infrastructure
- **Vercel** — deployment & hosting
- **pnpm** — package manager

***

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or hosted, e.g. Supabase / Neon)
- pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Anatolii-Lykhohodenko/task-management-app
cd task-management-app

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Fill in the required values (see section below)

# 4. Run database migrations
pnpm prisma migrate dev

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

***

## 🌍 Environment Variables

```env
# .env.example

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskify

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth (optional — for GitHub login)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

> For production on Vercel, set these in **Project Settings → Environment Variables**.

***

## 📁 Project Structure

```
task-management-app/
├── prisma/
│   ├── schema.prisma        # Database schema (User, Project, Task, Comment, ActivityLog)
│   └── migrations/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Login, Register pages
│   │   └── (app)/           # Protected: Dashboard, Projects, Tasks
│   ├── components/
│   │   ├── tasks/           # TaskForm, TaskCard, TaskFilters
│   │   └── ui/              # shadcn/ui components + RichTextEditor, ActivityLog
│   ├── constants/           # TASK_STATUSES, TASK_PRIORITIES
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts    # Prisma client singleton
│   │   │   └── queries.ts   # Typed database query helpers
│   │   └── auth.ts          # NextAuth configuration
│   ├── server/
│   │   └── actions/         # Server Actions (tasks, projects, comments)
│   └── types/               # Shared TypeScript types (ActionState, Status, Priority)
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

***

## 🗄 Database Schema

Core models: `User`, `Project`, `Task`, `Comment`, `ActivityLog`

```
User ──< Project ──< Task ──< Comment
                      │
                      └──< ActivityLog
```

Enums: `Status` (OPEN, DEVELOPING, REVIEW, CLOSED), `Priority` (LOW, MEDIUM, HIGH, CRITICAL), `ActivityType`

***

## 📄 License

MIT
