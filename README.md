# ✅ Task Management App

A full-stack task management application built with Next.js 16.
Manage projects, track tasks, collaborate with team members.

🔗 **[Live Demo](https://task-management-app-...vercel.app/)**

---

## ✨ Features

- 📁 Projects with task boards (Kanban-style)
- 📝 Tasks with rich-text description, status, priority, due date
- 👥 Assignees per task
- 🗑 Soft delete & trash restore
- 📊 Dashboard with stats & activity feed
- 🔐 Authentication (credentials + GitHub OAuth via NextAuth)
- 📜 Activity log per task

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM 7
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui + Tiptap (rich text)
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL
- pnpm

### Installation
\`\`\`bash
git clone https://github.com/Anatolii-Lykhohodenko/task-management-app
cd task-management-app
cp .env.example .env
pnpm install
pnpm prisma migrate dev
pnpm dev
\`\`\`

## 🌍 Environment Variables

\`\`\`env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
\`\`\`

## 📄 License
MIT
