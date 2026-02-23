# OnWay Backend

A robust RESTful API backend built with Node.js, Express, and MongoDB to power the OnWay ride-sharing platform. This backend handles user management, blog content distribution, and acts as the central data hub for the client applications.

---

## 🚀 Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** None (Currently open endpoints)
- **Environment Management:** dotenv
- **Middleware:** CORS, Express JSON parser

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)

---

## 🛠️ Installation Guide

Follow these steps to get the development environment running locally:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd OnWay/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root of the `backend` directory (see [Environment Variables Setup](#-environment-variables-setup)).

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server will start running at `http://localhost:5000` (or your configured port).

---

## 🔐 Environment Variables Setup

Create a `.env` file in the root directory of the backend project and add the following variables.

**`.env` Example Format:**
```env
# Server Configuration
PORT=5000

# Database Configuration (MongoDB Atlas URI)
# Replace the placeholder credentials with your actual database access details
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?appName=<AppName>
```
> [!IMPORTANT]
> Never commit your `.env` file to version control. It is already included in `.gitignore`.

---

## ⌨️ Scripts

The project includes the following npm scripts in `package.json`:

- **Development Mode** (uses auto-restart on file changes):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 🌐 API Reference

### Base URL
```
http://localhost:5000/api
```

### Example Route Structure

Currently available endpoints:

| Endpoints | Method | Description | Request Body | Response |
| :--- | :---: | :--- | :--- | :--- |
| `/health` | `GET` | API Health check | - | `{ "status": "onWay Backend running " }` |
| `/users` | `GET` | Fetch all registered users | - | List of user objects |
| `/users` | `POST` | Register a new user | `{ "name": "...", "email": "..." }` | New user object with `_id` |
| `/blogs` | `GET` | Fetch all blog posts | - | List of blog objects |

> Note: Error responses follow a standard format: `{ "success": false, "error": "Error message" }`. If a route is not found, it returns a 404 response.

---

## 📂 Folder Structure

```
backend/
├── node_modules/       # Project dependencies (ignored in git)
├── .env                # Environment variables (not tracked by git)
├── package-lock.json   # Exact dependency tree resolution
├── package.json        # Project metadata and dependencies
├── server.js           # Application entry point, DB connection, and API routes
└── README.md           # This document
```
*(Currently all routes and logic are located within `server.js`. As the project scales, consider moving routes into a `routes/` directory and logic into a `controllers/` directory.)*

---

## 🤝 Contribution Guidelines

We welcome contributions from the team! To ensure a smooth collaborative process, please follow these guidelines:

1. **Keep it Modular:** When adding new features, try to keep functions small and focused.
2. **Handle Errors:** Always wrap database calls in `try...catch` blocks and return appropriate HTTP status codes.
3. **Comment Your Code:** Leave comments for complex logic or business rules.
4. **Test Before Committing:** Ensure your changes do not break existing endpoints. Use Postman or Thunder Client to verify.

---

## 🌿 Git Workflow Instructions

To maintain a clean and organized commit history, follow this branch naming convention and workflow:

### Branch Naming Suggestion
- **Features:** `feature/<short-feature-name>` (e.g., `feature/user-auth`)
- **Bug Fixes:** `bugfix/<short-bug-name>` (e.g., `bugfix/db-connection-issue`)
- **Hotfixes:** `hotfix/<critical-issue>`
- **Documentation:** `docs/<topic>`

### Workflow Steps
1. Make sure you are on the `main` or `development` branch and pull the latest changes:
   ```bash
   git checkout development
   git pull origin development
   ```
2. Create your new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them with clear, descriptive messages.
4. Push your branch to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request (PR) for review.

---

## ⚠️ Important Notes for Developers

- **Database Connection Tracking:** The backend is configured to close the MongoDB connection gracefully upon receiving a `SIGINT` block (e.g., stopping the server with `Ctrl+C`).
- **Data Validation:** Basic validation exists for creating users (checking for `name` and `email`), but more robust validation (using libraries like Joi or express-validator) should be implemented as the project grows.
- **Future Enhancements:** Currently, all logic is contained within `server.js`. A planned refactor will involve separating concerns into specialized folders (`routes`, `controllers`, `models`, `middlewares`).
