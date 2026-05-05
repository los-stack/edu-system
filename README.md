# EPlatform - Educational Management System

A comprehensive, full-stack Educational Management System designed to facilitate online learning, course administration, and student assessment. Built with a modern JavaScript ecosystem, the platform features secure role-based access control, interactive assessment tools, and dynamic document generation.

## Architecture & Tech Stack

**Frontend:**

- React 18
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Router DOM (Routing)
- Axios (HTTP Client)
- React-Hot-Toast (Notifications)

**Backend:**

- Node.js
- Express.js
- PostgreSQL (Hosted on Neon)
- node-postgres (`pg` library)
- JSON Web Tokens (JWT) for authentication
- bcrypt (Password hashing)
- PDFKit (Server-side PDF generation)

**Infrastructure & Storage:**

- Vercel (Frontend Deployment)
- Render (Backend Deployment)
- Cloudinary (Cloud media & document storage)
- Multer (Multipart/form-data handling)

## Core Features

### Role-Based Access Control (RBAC)

- **Student:** Can browse courses, enroll, submit assignments, take quizzes, view progress, and generate certificates.
- **Teacher:** Can create/manage courses, create assignments and quizzes, review student submissions, leave feedback, and grade assignments.
- **Administrator:** Global oversight of the platform, user management, and system analytics.

### Functional Modules

- **Course Management:** CRUD operations for courses, structured content delivery.
- **Assessment System:** \* Automated Quizzes with immediate result calculation.
  - Manual Assignments requiring file uploads and teacher grading.
- **Interactive Communication:** Contextual comment sections for individual assignments.
- **Certification Engine:** Dynamic, server-side PDF generation of course completion certificates. Strictly validated against 100% graded task completion.
- **Security:** \* Cross-Origin Resource Sharing (CORS) configured for specific domains.
  - Secure, HTTP-only cookie implementation with `SameSite=None` for cross-domain authentication.
  - Parameterized SQL queries to prevent SQL injection vulnerabilities.

## Installation & Setup

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database instance
- Cloudinary account

### 1. Clone the repository

```bash
git clone <https://github.com/los-stack/edu-system.gitl>
cd edu-system
```

### 2. Environment Variables Configuration

**Backend (`backend/.env`)**
Create a `.env` file in the `backend` directory with the following keys:

```env
PORT=5000
DATABASE_URL=postgres://<user>:<password>@<host>/<database>
JWT_SECRET=<your_secure_jwt_secret_key>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
NODE_ENV=development
```

**Frontend (`frontend/.env`)**
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Install Dependencies & Run

**Start the Backend server:**

```bash
cd backend
npm install
npm run dev
```

**Start the Frontend development server:**

```bash
cd frontend
npm install
npm run dev
```

## Deployment Notes

This project is configured for cloud deployment.

- **Frontend** is optimized for Vercel. Ensure `Root Directory` is set to `frontend` and the `VITE_API_URL` environment variable points to the production backend URL.
- **Backend** is optimized for Render (Web Service). Set the `Start Command` to `npm start` (or `node server.js`). Ensure the `Trust Proxy` setting is enabled in the Express app to support secure cookies over Render's proxy infrastructure.

## License

MIT
