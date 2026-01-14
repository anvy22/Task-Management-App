# Task Management App

A modern, full-stack Task Management Application built with Next.js, Express, MongoDB, and Firebase Auth.

## 🚀 Overview

This application provides a robust platform for managing tasks and tickets, featuring role-based access control (Admin/User), real-time updates (planned), and a comprehensive dashboard. It includes a Kanban board for task management, ticket tracking with comments and activity logs, and user management capabilities.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **UI Components**: Shadcn UI (Radix Primitives)
- **State Management**: React Context (Auth)
- **Data Fetching**: Axios, SWR, Custom Hooks
- **Drag & Drop**: @dnd-kit

### Backend
- **Runtime**: Node.js (Bun)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Firebase Admin SDK
- **Validation**: Custom hook (RBAC)

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Package Manager**: Bun (Backend), npm/bun (Frontend)

## ✨ Core Features

### 1. Authentication & Authorization
- **Firebase Authentication**: Secure sign-up/login flows.
- **Role-Based Access Control (RBAC)**:
    - **Admin**: Full access to manage tickets, users, and system settings.
    - **User**: Can view assigned tickets/tasks and update their status.

### 2. Ticket Management
- **Create/Edit/Delete**: Full CRUD operations for tickets.
- **Status Workflow**: Track tickets through To Do, In Progress, and Done.
- **Priority Levels**: Low, Medium, High categorization.
- **Comments**: Add comments to tickets for collaboration.
- **Activity Log**: Track history of changes (status updates, assignments).
- **Review System**: Admin approval workflow for completed tickets.

### 3. Task Management (Kanban)
- **Kanban Board**: Drag-and-drop interface for managing tasks.
- **Personal Tasks**: Users can manage their own private tasks.

### 4. User Management
- **Admin Dashboard**: View all users and their assigned tickets.
- **Profile Management**: Update user details.

## 🐳 Running with Docker (Recommended)

The easiest way to run the application is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed on your machine.
- A `.env` file in the `backend` directory (see Backend README).
- A `.env.local` file in the `frontend` directory (see Frontend README).

### Steps
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Task_management_app
   ```

2. **Setup Environment Variables**:
   Ensure you have the necessary environment variables set up in `backend/.env` and `frontend/.env.local` as described in their respective sections below.

3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:5000
   - **MongoDB**: mongodb://localhost:27017

4. **Stop the containers**:
   ```bash
   docker-compose down
   ```

## 🔧 Running Manually (Without Docker)

If you prefer to run the services locally on your machine.

### Prerequisites
- Node.js (v18+) or Bun installed.
- MongoDB running locally or a connection string to a remote instance.

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Create a `.env` file based on `.env.example` (if available) or add:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/task_management
   FIREBASE_PROJECT_ID=...
   FIREBASE_PRIVATE_KEY=...
   FIREBASE_CLIENT_EMAIL=...
   ```
   *Note: You need a `firebase-admin.json` key file or valid credentials.*

4. Start the server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```
   Server will run on `http://localhost:5000`.

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   App will run on `http://localhost:3000`.

## 📁 Project Structure

```
.
├── backend/                # Express.js Server
│   ├── src/
│   │   ├── controllers/    # Request Handlers
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # API Route definitions
│   │   ├── middlewares/    # Auth & Validation
│   │   └── ...
│   ├── Dockerfile
│   └── ...
├── frontend/               # Next.js Application
│   ├── app/                # App Router Pages
│   ├── components/         # Reusable UI Components
│   ├── context/            # Global State (Auth)
│   ├── lib/                # Utilities (API client)
│   ├── Dockerfile
│   └── ...
└── docker-compose.yml      # Container Orchestration
```

## 📜 License

[MIT](LICENSE)
