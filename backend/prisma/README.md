Prisma schema and migrations for the Workout Tracker project.

Files:
- `schema.prisma` — canonical Prisma data model for Module 2 based on `PRD.doc`.
- `migrations/000000_init/migration.sql` — an initial SQL migration that can be applied to a PostgreSQL database.

Notes:
- To run migrations and generate the client, set `DATABASE_URL` in your environment and run:

```bash
npm install
npx prisma generate
npx prisma migrate deploy   # or `prisma migrate dev` for development when a DB is present
```

If you don't have PostgreSQL locally, you can use a managed instance or a Docker container.
