# Video Demo Link

https://youtu.be/K_ELk7DN_1o

# TaskHub

TaskHub is a full-stack project and task management web app built with React, Redux, Express, MongoDB, and JWT-based authentication.
It lets users register/login, create projects, assign members, and manage tasks collaboratively.

# Installing Dependencies

## backend

cd backend
npm install

## frontend

cd frontend
npm install

# Environment Variables

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/taskhub
JWT_SECRET=your_jwt_secret_here

# Run the app

## backend
cd backend
node server.js

## frontend
cd frontend
npm start

# Features

## Authentication
- Register / Login with form validation using Yup
- Password hashing (via Mongoose pre-save hook)
- JWT-based login sessions (1-hour expiry)
- Role system: owner and member

## Projects Management
- Create, view, edit, delete projects
- Add or remove members
- Owners have full control; members have limited permissions

## Tasks
- Owners can create, assign, and delete tasks
- Members can update only their task status
- Filtering, sorting, and pagination on tasks

# Design Notes

## Backend
- Built with Express and Mongoose
- Organized routes:
- auth.js → register/login/profile
- projects.js → CRUD + members
- tasks.js → CRUD + permissions
- Middleware:
- requireAuth for token verification
- project-access.js for role-based authorization
- JWT stored in frontend localStorage

## Frontend
- Built with React + Redux Toolkit
- Routing handled by React Router
- Global state in features/UserSlice.js
- Validation via Yup
- Styled with lightweight CSS modules
- Navbar hides on login/register pages
- Protected routes redirect unauthorized users

# Tech Stack
Frontend: React, Redux Toolkit, React Router, Yup
Backend: Node.js, Express, Mongoose, JWT, bcryptjs
Database: MongoDB (local or Atlas)

