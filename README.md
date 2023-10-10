# README

This repository is a Node.js application that utilizes the following technologies:

- Nest.js
- Prisma ORM
- PostgreSQL database
- Docker and Docker Compose for local development

Below, you'll find a detailed explanation of how to set up and run the application on your local machine.

## Steps to Run the Application

Follow these steps to set up and run the application on your local machine:

#### 1. Clone the repository

```bash
git clone https://github.com/nahuelsoma/movies-api.git
```

#### 2. Install the dependencies

```bash
npm ci
```

#### 3. Add environment variables to a .env file in the project's root directory. Make sure to define the following variables

- `DATABASE_URL_DEV`: The PostgreSQL database connection URL.
- `AUTH_SECRET`: A secret string for authentication (can be any secure value).

#### 4. Start the Docker container with PostgreSQL and PgAdmin

```bash
docker compose up
```

#### 5. Run Prisma migrations to initialize the database

```bash
npx prisma migrate dev --name init
```

#### 6. Start the server

```bash
npm run start:dev
```

The API will be available at: http://localhost:3000/

PgAdmin can be accessed at: http://localhost:5050/browser

## API Documentation

Swagger documentation is available at: http://localhost:3000/api/

To populate the database, make a `POST` request to the `http://localhost:3000/movies/seed` endpoint.
