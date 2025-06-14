# 🛠️ ManageX Backend – Engineering Resource Management API

This is the **backend service** for [ManageX](https://github.com/Abhi9824/engineering-resources-frontend), a full-stack engineering project and resource management system. Built with **Node.js**, **Express.js**, and **MongoDB**, this RESTful API enables robust project creation, assignment management, user authentication, and role-based access control.

---

## 🌐 Frontend Integration

🔗 Frontend Repository:  
https://github.com/Abhi9824/ManageX#

🌍 Live Frontend URL:  
https://manage-x-app.vercel.app/

---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Middleware:** Role-based access control
- **Dev Tools:** dotenv, CORS, nodemon

---

## 🚀 Key Features

- 🔐 **JWT Authentication**
- 👥 **Role-based Authorization** (`manager`, `engineer`)
- 🧑‍💼 **Manager Privileges**
  - Create/update/delete users
  - Create and assign projects
  - View engineers and their capacities
- 👨‍🔧 **Engineer Access**
  - View own assignments and projects
- 📊 **Engineer Capacity Tracking**
  - Calculates available capacity per engineer in real-time

---

## 📁 Project Structure

---

## 🔐 Authentication Routes

| Method | Endpoint             | Access           | Description             |
|--------|----------------------|------------------|-------------------------|
| POST   | `/api/auth/signup`   | Public           | Register a new user     |
| POST   | `/api/auth/login`    | Public           | Login & receive token   |
| GET    | `/api/auth/profile`  | manager, engineer | Get current user profile |

---

## 👤 User Routes

| Method | Endpoint            | Access             | Description           |
|--------|---------------------|--------------------|-----------------------|
| PUT    | `/api/users`        | manager, engineer  | Update user profile   |
| DELETE | `/api/users/:id`    | manager, engineer  | Delete a user         |

---

## 👷‍♂️ Engineer Routes

| Method | Endpoint                         | Access   | Description                          |
|--------|----------------------------------|----------|--------------------------------------|
| GET    | `/api/engineers`                 | manager  | Get all engineers with capacity info |
| GET    | `/api/engineers/:id/capacity`    | manager  | Get specific engineer’s capacity     |
| GET    | `/api/engineers/capacity`        | manager  | Get capacity data for all engineers  |

---

## 📁 Project Routes

| Method | Endpoint            | Access             | Description                  |
|--------|---------------------|--------------------|------------------------------|
| GET    | `/api/projects`     | manager, engineer  | Get all projects             |
| GET    | `/api/projects/:id` | manager, engineer  | Get project by ID            |
| POST   | `/api/projects`     | manager            | Create a new project         |

---

## 📋 Assignment Routes

| Method | Endpoint              | Access  | Description                    |
|--------|-----------------------|---------|--------------------------------|
| GET    | `/api/assignments`    | manager, engineer | Get all assignments        |
| POST   | `/api/assignments`    | manager | Create a new assignment        |
| PUT    | `/api/assignments/:id`| manager | Update an assignment           |
| DELETE | `/api/assignments/:id`| manager | Delete an assignment           |

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Abhi9824/engineering-resources-backend
cd engineering-resources-backend

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the root with:
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret

4. Run the Server
npm run dev




