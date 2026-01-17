# Vehicle Rental System Backend API

## Project Overview
This is a backend API for a vehicle rental management system, designed to handle vehicle inventory, customer accounts, booking management, and secure role-based access control.

## Live URL
[Link to your live deployment will go here]

## Features
-   **Vehicles**: Manage vehicle inventory, including availability tracking.
-   **Customers**: Manage customer accounts and profiles.
-   **Bookings**: Handle vehicle rentals, returns, and cost calculation.
-   **Authentication**: Secure role-based access control (Admin and Customer roles) using JWT.

## Technology Stack
-   **Node.js**: JavaScript runtime environment.
-   **TypeScript**: Superset of JavaScript for type-safe development.
-   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
-   **PostgreSQL**: Powerful open-source relational database.
-   **Drizzle ORM**: TypeScript ORM for type-safe database interactions.
-   **bcryptjs**: Library for hashing passwords.
-   **jsonwebtoken**: Library for implementing JSON Web Tokens (JWT) for authentication.
-   **Zod**: TypeScript-first schema declaration and validation library.

## Setup & Usage Instructions

### Prerequisites
-   Node.js (LTS version recommended)
-   npm or yarn
-   PostgreSQL database (e.g., a NeonDB instance as provided)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd Web-Maker
```

### 2. Install Dependencies
```bash
npm install
```
*(If using yarn: `yarn install`)*

### 3. Environment Variables
Create a `.env` file in the root directory of the project and add your PostgreSQL database connection URL and a JWT secret key:

```
DATABASE_URL='your-postgresql-connection-string'
JWT_SECRET='your-very-strong-secret-key'
```
*Replace `your-postgresql-connection-string` with the actual connection string for your PostgreSQL database.*
*Replace `your-very-strong-secret-key` with a strong, random string.*

### 4. Database Setup
Push the Drizzle ORM schema to your PostgreSQL database:

```bash
npm run db:push
```

### 5. Run the Application
#### Development Mode
To run the server in development mode (with live reloading if configured):

```bash
npm run dev
```

#### Production Mode
To build the application for production and then start it:

```bash
npm run build
npm start
```

The API server will start on the port specified in your `.env` file (or default to `5000`).

### API Endpoints
The API documentation details are provided in the project description. Here's a summary of the available endpoints:

**Authentication**
-   `POST /api/v1/auth/signup`: Register a new user.
-   `POST /api/v1/auth/signin`: Login and receive a JWT token.

**Vehicles**
-   `POST /api/v1/vehicles`: Add a new vehicle (Admin only).
-   `GET /api/v1/vehicles`: Get all vehicles (Public).
-   `GET /api/v1/vehicles/:vehicleId`: Get a specific vehicle by ID (Public).
-   `PUT /api/v1/vehicles/:vehicleId`: Update vehicle details (Admin only).
-   `DELETE /api/v1/vehicles/:vehicleId`: Delete a vehicle (Admin only, if no active bookings).

**Users**
-   `GET /api/v1/users`: Get all users (Admin only).
-   `PUT /api/v1/users/:userId`: Update user details (Admin or own profile).
-   `DELETE /api/v1/users/:userId`: Delete a user (Admin only, if no active bookings).

**Bookings**
-   `POST /api/v1/bookings`: Create a new booking (Customer or Admin).
-   `GET /api/v1/bookings`: Get bookings (Admin sees all, Customer sees own).
-   `PUT /api/v1/bookings/:bookingId`: Update booking status (Customer can cancel before start date, Admin can mark as returned).

### Admin User Seeding
Upon the first run, if no users exist in the database, an admin user will be seeded automatically with the following credentials:
-   **Email**: `admin@example.com`
-   **Password**: `admin123`

## What You Need to Provide
-   GitHub Repository Link
-   Live Deployment Link


take my everything but fix this PS C:\Users\user\Downloads\Web-Maker> npm run dev

> rest-express@1.0.0 dev > set NODE_ENV=development && tsx server/index.ts

C:\Users\user\Downloads\Web-Maker\node_modules\pg-pool\index.js:45 Error.captureStackTrace(err) ^

Error: getaddrinfo ENOTFOUND db.bmjkiuvaaiqaczkxkopi.supabase.co at C:\Users\user\Downloads\Web-Maker\node_modules\pg-pool\index.js:45:11 at process.processTicksAndRejections (node:internal/process/task_queues:103:5) at async <anonymous> (C:\Users\user\Downloads\Web-Maker\node_modules\src\node-postgres\session.ts:104:19) at async DatabaseStorage.getUsers (C:\Users\user\Downloads\Web-Maker\server\storage.ts:47:12) at async registerRoutes (C:\Users\user\Downloads\Web-Maker\server\routes.ts:197:8) at async <anonymous> (C:\Users\user\Downloads\Web-Maker\server\index.ts:64:3) { errno: -3008, code: 'ENOTFOUND', syscall: 'getaddrinfo', hostname: 'db.bmjkiuvaaiqaczkxkopi.supabase.co' }

Node.js v24.11.1

take this

Type

URI Source

Primary database Method

Direct connection Learn how to connect to your Postgres databases. Read docs

Direct connection Ideal for applications with persistent and long-lived connections, such as those running on virtual machines or long-standing containers.

postgresql://postgres:[YOUR-PASSWORD]@db.bmjkiuvaaiqaczkxkopi.supabase.co:5432/postgres

View parameters host: db.bmjkiuvaaiqaczkxkopi.supabase.co

port: 5432

database: postgres

user: postgres

Type

Node.js Source

Primary database Method

Direct connection Learn how to connect to your Postgres databases. Read docs

1 Install the following npm install postgres

2 Add file to project db.js import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL const sql = postgres(connectionString)

export default sql

3 Connect to your database Direct connection Ideal for applications with persistent and long-lived connections, such as those running on virtual machines or long-standing containers.

.env DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.bmjkiuvaaiqaczkxkopi.supabase.co:5432/postgres

View parameters host: db.bmjkiuvaaiqaczkxkopi.supabase.co

port: 5432

database: postgres

user: postgres