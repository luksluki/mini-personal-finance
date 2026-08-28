# Personal Finance Dashboard

A full-stack personal finance application designed to help you track your transactions, analyze expenses, and manage your money efficiently. 

This project is built using a modern, typesafe stack and is organized as a monorepo using Bun workspaces.

## Tech Stack

- **Backend** (`apps/backend`):
  - [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
  - [ElysiaJS](https://elysiajs.com/) - Ergonomic web framework for Bun
  - [SQLite](https://www.sqlite.org/) - Lightweight, embedded database
  - [TypeBox](https://github.com/sinclairzx81/typebox) - For runtime type validation

- **Frontend** (`apps/frontend`):
  - [Svelte](https://svelte.dev/) - Cybernetically enhanced web apps
  - [Vite](https://vitejs.dev/) - Next generation frontend tooling
  - [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
  - [Elysia Eden](https://elysiajs.com/eden/overview.html) - End-to-end type safety between frontend and backend
  - [Chart.js](https://www.chartjs.org/) - Simple yet flexible JavaScript charting

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine (v1.0 or higher recommended)
- Alternatively, you can use [Docker](https://www.docker.com/) and Docker Compose to run the application.

## Installation & Running Locally (Development)

1. **Install dependencies**
   From the root of the project, run:
   ```bash
   bun install
   ```
   This will install dependencies for both the frontend and backend workspaces.

2. **Run the backend**
   Open a terminal and start the backend server:
   ```bash
   cd apps/backend
   bun run --watch index.ts
   ```
   The backend will start on `http://localhost:3000`.

3. **Run the frontend**
   Open a second terminal and start the frontend development server:
   ```bash
   cd apps/frontend
   bun run dev
   ```
   The frontend will be accessible at the URL provided by Vite (usually `http://localhost:5173`).

## Running with Docker (Production/Testing)

If you prefer to run the application using Docker, a `docker-compose.yml` file is provided.

From the root of the project, run:
```bash
docker-compose up --build
```

This will build the Docker images for both the frontend and backend, and start the containers. 
- The frontend will be accessible at `http://localhost:80`
- The backend API will be accessible at `http://localhost:3000`
- The SQLite database will be persisted in a Docker volume.

## Project Structure

```
personal-finance/
├── apps/
│   ├── backend/       # Elysia API server & database setup
│   └── frontend/      # Svelte web client
├── package.json       # Workspace root
├── bun.lock           # Bun lockfile
└── docker-compose.yml # Docker compose configuration
```
