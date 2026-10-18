# 🚀 User Management REST API (Express.js)

A clean, modular, and professional RESTful API built with **Node.js** and **Express.js**, following the **MVC (Model-View-Controller)** pattern. This project demonstrates clean routing architecture, controller separation, mock data management, and standard HTTP error handling.

---

## 📌 Features

- **Modular Architecture**: Clean separation between server configuration ([`app.js`](./app.js)), routes ([`router/`](./router/)), and business logic ([`controllers/`](./controllers/)).
- **Complete CRUD Operations**:
  - `GET` all users
  - `GET` single user by ID
  - `POST` create a new user
  - `PUT` update existing user by ID
  - `DELETE` remove user by ID
- **Robust Error Handling**:
  - Catches 404 for undefined routes
  - Global 500 internal server error handler
  - Request body validation
- **Middleware Support**:
  - JSON payload parsing (`express.json()`)
  - URL-encoded form data parsing (`express.urlencoded()`)

---

## 📂 Project Structure

```plaintext
API-Part-2/
├── controllers/
│   └── userControllers.js   # Request handlers & business logic with mock data
├── router/
│   └── user.js              # Express routing definitions
├── app.js                   # Main application entry point & middleware setup
├── package.json             # Project dependencies and npm scripts
├── .gitignore               # Ignored files & folders (e.g. node_modules)
└── README.md                # Project documentation
```

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) (v5.x)
- **Architecture**: REST API / MVC

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

```bash
node -v
npm -v
```

### 1. Clone the Repository

```bash
git clone <repository-url>
cd API-Part-2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

**Production mode:**
```bash
npm start
```

**Development mode (Auto-restart with Nodemon):**
```bash
npm run dev
```

The server will start at: **`http://localhost:3000`**

---

## 📡 API Endpoints

**Base URL**: `http://localhost:3000`

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Health check / Welcome message | None |
| **GET** | `/api/users` | Get list of all users | None |
| **GET** | `/api/users/:id` | Get user by ID | None |
| **POST** | `/api/users` | Create a new user | JSON (`name`, `email`, `role`) |
| **PUT** | `/api/users/:id` | Update existing user by ID | JSON (`name`, `email`, `role`) |
| **DELETE** | `/api/users/:id` | Delete user by ID | None |

---

## 🧪 Request & Response Examples

### 1. Get All Users
- **Request**: `GET http://localhost:3000/users`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": 1,
      "name": "Aftab Farhan",
      "email": "farhan@example.com",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Rahim Ahmed",
      "email": "rahim@example.com",
      "role": "user"
    }
  ]
}
```

---

### 2. Get User By ID
- **Request**: `GET http://localhost:3000/users/1`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Aftab Farhan",
    "email": "farhan@example.com",
    "role": "admin"
  }
}
```

---

### 3. Create User
- **Request**: `POST http://localhost:3000/users`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Tanvir Hasan",
  "email": "tanvir@example.com",
  "role": "user"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 5,
    "name": "Tanvir Hasan",
    "email": "tanvir@example.com",
    "role": "user"
  }
}
```

---

### 4. Update User
- **Request**: `PUT http://localhost:3000/users/1`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Aftab Farhan (Updated)",
  "role": "superadmin"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "Aftab Farhan (Updated)",
    "email": "farhan@example.com",
    "role": "superadmin"
  }
}
```

---

### 5. Delete User
- **Request**: `DELETE http://localhost:3000/users/1`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "name": "Aftab Farhan",
    "email": "farhan@example.com",
    "role": "admin"
  }
}
```

---

## ⚠️ Error Handling

- **400 Bad Request**: When required fields (`name`, `email`) are missing in `POST` requests.
- **404 Not Found**: When requesting a user ID or route that does not exist.
- **500 Internal Server Error**: Unhandled server exceptions.

Example Error Response:
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 👨‍💻 Author

Developed by **Aftab Farhan**
