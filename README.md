# Full Stack Application Template
This is an update

This repository is a student-friendly starter template for a full stack application using:

- React
- Vite
- JavaScript
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- REST API endpoints
- Docker Compose
- Git and GitHub
- Environment variables with `.env`

## Project structure

```text
.
├── README.md
├── .gitignore
├── docker-compose.yml
└── apps/
    ├── frontend/
    │   ├── package.json
    │   ├── index.html
    │   ├── vite.config.js
    │   └── src/
    │       ├── App.jsx
    │       ├── main.jsx
    │       ├── styles.css
    │       ├── api/
    │       │   └── items.js
    │       └── components/
    │           └── ItemList.jsx
    └── backend/
        ├── package.json
        ├── .env.example
        ├── prisma.config.ts
        ├── prisma/
        │   ├── schema.prisma
        │   ├── migrations/
        │   └── seed.js
        ├── database/
        │   ├── schema.sql
        │   └── seed.sql
        └── server/
            ├── db/
            │   └── prisma.js
            ├── controllers/
            │   └── itemController.js
            ├── routes/
            │   └── items.js
            └── server.js
```



## Example application

This template uses two related tables:

- `categories`
- `items`

The `items` table has a foreign key to `categories`, which gives students a simple example of relational database design.

In Prisma code, the models are named `Category` and `Item`, but the actual PostgreSQL tables are lowercase: `categories` and `items`.

## Requirements

Before starting, make sure you have these installed:

- Node.js
- npm
- Docker Desktop
- PostgreSQL client tools if you want to use `psql` commands directly



## Environment variables

All secret values should stay in a `.env` file.

1. Go to `apps/backend`
2. Copy `.env.example` to `.env`
3. Update the values if needed

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/backend-db?schema=public"
PORT=3001
```

The root `.gitignore` already includes `.env` so it will not be committed.

## How to create the PostgreSQL database

This project uses Docker Compose for PostgreSQL.

From `apps/backend`, run:

```bash
npm run db:up
```

This starts the PostgreSQL container defined in the root `docker-compose.yml` file.

Prisma 7 reads its CLI database configuration from `apps/backend/prisma.config.ts`.

To stop the database:

```bash
npm run db:down
```

To view database logs:

```bash
npm run db:logs
```



## Backend setup

Open a terminal in `apps/backend` and run:

```bash
npm install
cp .env.example .env
npm run db:up
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
```

Then start the backend:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:3001
```

Available example REST API endpoints:

- `GET /api/health`
- `GET /api/categories`
- `GET /api/items`
- `POST /api/items`



## Frontend setup

Open a second terminal in `apps/frontend` and run:

```bash
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```



## How to run `schema.sql`

The raw SQL files are included in `apps/backend/database` for teaching and testing.

Use this option on a fresh database if you want to set up the tables manually with SQL instead of using Prisma migrations.

From `apps/backend`, after your `.env` is configured and PostgreSQL is running, run:

```bash
npm run sql:schema
```

This executes:

```text
database/schema.sql
```



## How to run `seed.sql`

Run this after `schema.sql` if you are following the raw SQL setup path.

From `apps/backend`, run:

```bash
npm run sql:seed
```

This executes:

```text
database/seed.sql
```



## Prisma workflow

This template uses the current Prisma 7 setup:

- `prisma.config.ts` configures Prisma CLI commands
- `schema.prisma` defines the models
- `@prisma/adapter-pg` connects Prisma Client to PostgreSQL at runtime
- `prisma-client-js` keeps the generated client plain JavaScript-friendly for this class template
- Prisma maps `Category` and `Item` to lowercase PostgreSQL tables so students can query `categories` and `items` directly in `psql`

Useful Prisma commands from `apps/backend`:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
npm run db:seed
npm run db:reset
```



### When you want to change the database schema

Do not create the migration file by hand first.

#### Instead:

- Edit `apps/backend/prisma/schema.prisma`

Run:

- `npm run prisma:migrate -- --name describe-your-change`

Prisma will:

- compare the current schema to the last migration
- generate the new migration SQL file for you
- apply it to your local database

Example:

- If you add a new column or model:
- `npm run prisma:migrate -- --name add-user-table`



## Helpful backend scripts

From `apps/backend`:

```bash
npm run dev
npm run start
npm run db:up
npm run db:down
npm run db:logs
npm run db:psql
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:deploy
npm run prisma:studio
npm run db:seed
npm run db:reset
npm run sql:schema
npm run sql:seed
```

`db:psql` requires PostgreSQL client tools to be installed on your machine.

## Git and GitHub workflow

Suggested student workflow:

1. Create a new GitHub repository from this template.
2. Clone the repository.
3. Create a new branch for your work.
4. Commit your changes regularly.
5. Push your branch to GitHub.



## Suggested startup order

1. In `apps/backend`, run `npm install`.
2. In `apps/frontend`, run `npm install`.
3. In `apps/backend`, copy `.env.example` to `.env`.
4. In `apps/backend`, run `npm run db:up`.
5. In `apps/backend`, run `npm run prisma:generate`.
6. In `apps/backend`, run `npm run prisma:migrate -- --name init`.
7. In `apps/backend`, run `npm run db:seed`.
8. In `apps/backend`, run `npm run dev`.
9. In `apps/frontend`, run `npm run dev`.



## Notes for students

- Keep your backend code inside `apps/backend`.
- Keep your frontend code inside `apps/frontend`.
- Keep secrets in `.env` files only.
- Use Prisma models to represent your database tables.
- Use REST routes in Express to connect the frontend to PostgreSQL.

