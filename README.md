# Smart Campus Companion - Setup Guide

This project consists of a Spring Boot backend and a Vite + React frontend.

## Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher
- **Maven** (or use the provided `./mvnw`)
- **npm**

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Pafnew
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd IT23234048
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in the required values (MongoDB URI, Google OAuth Credentials, etc.).
   - *Note: If you don't have the Google credentials, ask the project owner.*
4. Run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd my-react-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

## Troubleshooting

### "401 Unauthorized" Errors
If you see 401 errors, it means you are not logged in. Navigate to `/login` to authenticate via Google or standard login.

### MongoDB Connection Issues
Ensure your IP address is whitelisted in the MongoDB Atlas dashboard.

### Port Conflicts
- Backend defaults to **8080**.
- Frontend defaults to **5173**.
Ensure these ports are free on your machine.
