# Task Management - Backend Service

The backend service for the Task Management Application, built with Express.js, MongoDB, and Firebase Admin.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+) or Bun
- MongoDB locally or Atlas cluster
- Firebase Service Account credentials

### Installation

1. Install dependencies:
   ```bash
   bun install
   ```

2. Environment Setup:
   Create a `.env` file in the root of the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/task_management
   # Add Firebase Environment Variables if not using json file direct path
   ```
   Ensure `firebase-admin.json` is present in the root if configured to load from file.

3. Run Development Server:
   ```bash
   bun run dev
   ```

## 📡 API Endpoints

All routes are prefixed with the base URL (typically `http://localhost:5000`).
Most routes require a valid Firebase ID Token in the `Authorization` header: `Bearer <token>`.

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/sync` | Sync user data from Firebase to MongoDB | User |

### 🎫 Tickets (`/tickets`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/tickets` | Get all tickets (filtered by role) | Admin/User |
| `POST` | `/tickets` | Create a new ticket | Admin |
| `GET` | `/tickets/:id` | Get ticket details by ID | Admin/User |
| `PATCH` | `/tickets/:id/status` | Update ticket status | Admin/User |
| `PATCH` | `/tickets/:id/review` | Approve/Review a completed ticket | Admin |
| `DELETE` | `/tickets/:id` | Delete a ticket | Admin |

### 💬 Comments (`/tickets`)
Mounted under `/tickets` router.
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/tickets/:id/comments` | Get all comments for a ticket | Admin/User |
| `POST` | `/tickets/:id/comments` | Add a comment to a ticket | Admin/User |

### 📜 Activity Log (`/tickets`)
Mounted under `/tickets` router.
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/tickets/:id/activity` | Get activity/history for a ticket | Admin/User |

### 📝 Tasks (`/tasks`)
Personal task management endpoints.
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Get all tasks | Admin/User |
| `POST` | `/tasks` | Create a new task | Admin/User |
| `PATCH` | `/tasks/:id` | Update a task | Admin/User |
| `DELETE` | `/tasks/:id` | Delete a task | Admin/User |

### 👥 Users (`/users`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Get list of all users | Admin |
| `PATCH` | `/users/update` | Update current user's name | User |
| `GET` | `/users/details` | Get current user details | User |
| `GET` | `/users/userdetails` | Get details of assigned tickets | Admin |

## 🛠 Scripts

The `package.json` includes several scripts for development and maintenance.

- **`bun run dev`**: Start the server in development mode with hot-reloading.
- **`bun run start`**: Start the production server.
- **`bun run src/scripts/makeAdmin.ts`**: Script to promote a user to Admin role (check file for usage).
- **`bun run src/scripts/clearDatabase.ts`**: Utility to clear the database (use with caution).

## 🐳 Docker

The backend includes a `Dockerfile` for containerization.

```bash
# Build the image
docker build -t task-backend .

# Run the container
docker run -p 5000:5000 --env-file .env task-backend
```
