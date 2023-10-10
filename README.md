# README

This repository is a Node.js application that utilizes the following technologies:

- Nest.js
- Prisma ORM
- PostgreSQL database
- Docker and Docker Compose for local development

Below, you'll find a detailed explanation of how to set up and run the application on your local machine.

## Productive Domain

The application is deployed to Railway and can be accessed at: `https://movies-api-production-9a3f.up.railway.app/`

### API Documentation

Swagger documentation can be accessed from [here](https://movies-api-production-9a3f.up.railway.app/api/).

## Steps to Run the Application Locally

Follow these steps to set up and run the application on your local machine:

#### 1. Clone the repository

```bash
git clone https://github.com/nahuelsoma/movies-api.git
```

#### 2. Install the dependencies

```bash
npm ci
```

#### 3. Add environment variables

Create a `.env` file in the project's root directory. Make sure to define the following variables:

##### Database variables

```bash
DATABASE_URL = postgresql://postgres-user:postgres-password@localhost:5432/postgres-movies-database
```

##### Authentication variables

```bash
AUTH_SECRET = your-secret
```

#### 4. Start the Docker container with PostgreSQL and PgAdmin

Open a new terminal and run the following command:

```bash
docker compose up
```

This will start the PostgreSQL database and PgAdmin. The database will be available at: `localhost:5432` and PgAdmin at: `localhost:5050`.

PgAdmin can be accessed at: `http://localhost:5050/browser`.

The `-d` flag can be added to run the container in detached mode.

#### 5. Run Prisma migrations to initialize the database

```bash
npx prisma migrate dev --name init
```

This will create the required tables in the database. You can check the database schema in PgAdmin.

#### 6. Start the server

```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/`

#### 7. Seed the database

To populate the database, make a `POST` request to the `http://localhost:3000/movies/seed` endpoint.

This endpoint is only available for the `admin` role and requires a valid JWT token to be passed in the `Authorization` header.

Sign up as a new `admin` user and then log in to get a valid JWT token to perform this request.

## Running Tests

To run the tests, run the following command:

```bash
npm run test
```

## Running Linter

To run the linter, run the following command:

```bash
npm run lint
```
