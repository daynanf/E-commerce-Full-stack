# Daynan Tech Store - Backend

Welcome to the backend repository for **Daynan Tech Store**, a premium e-commerce platform built with Node.js, Express, and MongoDB. This API handles user authentication, product management, and order processing with a focus on security and scalability.

## 🚀 Features

- **Authentication**: Secure JWT-based authentication with role-based access control (User/Admin).
- **Product Management**: Full CRUD operations for admins; advanced search, filtering, and pagination for users.
- **Order Processing**: Transactional order placement ensuring stock consistency using MongoDB sessions.
- **Security**: Implemented Helmet for headers, CORS policies, and password hashing with bcrypt.
- **Logging**: Request logging with Morgan.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via [Mongoose](https://mongoosejs.com/))
- **Authentication**: [JSON Web Token (JWT)](https://jwt.io/)
- **Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs), [helmet](https://www.npmjs.com/package/helmet), [cors](https://www.npmjs.com/package/cors)

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers (Auth, Product, Order)
│   ├── middlewares/    # Custom middlewares (Auth, Error handling)
│   ├── models/         # Mongoose schemas (User, Product, Order)
│   ├── routes/         # API route definitions
│   └── app.js          # Express app setup
├── .env                # Environment variables
├── server.js           # Entry point
└── package.json        # Dependencies and scripts
```

## ⚡ Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/daynan-tech-store.git
    cd daynan-tech-store/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/daynan-tech-store
    JWT_SECRET=your_super_secret_key
    NODE_ENV=development
    ```

4.  **Run the Server:**
    ```bash
    # Development mode (with nodemon)
    npm run dev

    # Production mode
    npm start
    ```

## 🧪 Testing

We have included a script to verify the core API functionalities.

```bash
node test-api.js
```
*Note: Ensure the server is running before executing the test script.*

---

# � API Documentation

Base URL: `http://localhost:5000`

## 🔐 Authentication

### Register User
Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "object": { ... }
  }
  ```

### Login User
Authenticate a user and receive a JWT.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "object": {
      "token": "eyJhbGciOiJIUzI1NiIsInR...",
      ...
    }
  }
  ```

## 📦 Products

### Get All Products
Retrieve a list of products with pagination and search.

- **URL**: `/products`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term for product name
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "object": [ ... ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalSize": 50,
    "totalPages": 5
  }
  ```

### Get Product Details
Retrieve details of a specific product.

- **URL**: `/products/:id`
- **Method**: `GET`

### Create Product (Admin)
- **URL**: `/products`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Gaming Laptop",
    "description": "High performance laptop...",
    "price": 1200.99,
    "stock": 10,
    "category": "Electronics"
  }
  ```

### Update Product (Admin)
- **URL**: `/products/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`

### Delete Product (Admin)
- **URL**: `/products/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`

## 🛒 Orders

### Place Order
Create a new order. Deducts stock automatically.

- **URL**: `/orders`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "products": [
      { "productId": "63f...", "quantity": 1 },
      { "productId": "63f...", "quantity": 2 }
    ]
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "object": { ... }
  }
  ```

### Get My Orders
Retrieve order history for the logged-in user.

- **URL**: `/orders`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

---

# 🏗️ Architecture & Design

## Overview
The Daynan Tech Store backend follows a **Layered Architecture** (Controller-Service-Repository pattern simplified to Controller-Model for this scale) to ensure separation of concerns and maintainability.

## Key Components

### 1. Models (Data Layer)
We use **Mongoose** to define schemas and interact with MongoDB.
- **User**: Handles identity and roles. Passwords are hashed using `bcryptjs` via pre-save hooks.
- **Product**: Represents catalog items. Includes validation for price and stock.
- **Order**: Represents a purchase. Contains a snapshot of product prices at the time of purchase.

### 2. Controllers (Logic Layer)
Controllers handle the business logic for each route.
- **Auth Controller**: Manages registration and login.
- **Product Controller**: Handles CRUD and search logic.
- **Order Controller**: Manages order placement. Crucially, it uses **MongoDB Sessions** to wrap stock deduction and order creation in an **Atomic Transaction**. This prevents race conditions where multiple users might buy the last item simultaneously.

### 3. Middlewares
- **Auth Middleware**: Intercepts requests to protected routes, verifies the JWT, and attaches the user object to `req`.
- **RBAC (Role-Based Access Control)**: The `authorize` middleware checks if the authenticated user has the required role (e.g., 'Admin') to proceed.

## Design Decisions

### Database: MongoDB
Chosen for its flexibility with JSON-like documents, which maps well to e-commerce product data (which can vary in attributes).

### Authentication: JWT
Stateless authentication allows the API to be scalable and easily consumed by different frontends (Web, Mobile).

### Error Handling
We use a consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Optional detailed errors"]
}
```
This ensures the frontend can always parse errors predictably.

---

# 🤝 Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## We Develop with Github
We use github to host code, to track issues and feature requests, and to accept pull requests.

## Report bugs using Github's [issue tracker](https://github.com/yourusername/daynan-tech-store/issues)
We use GitHub issues to track public bugs. Report a bug by opening a new issue; it's that easy!

## Pull Requests
1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes.
4.  Make sure your code lints.
5.  Issue that pull request!

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
