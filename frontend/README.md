# Plexus Frontend

TanStack Start frontend for Plexus. The app keeps Clerk for authentication and
talks directly to the FastAPI backend for upload flows.

## Environment

Create `frontend/.env` with:

```bash
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
VITE_API_BASE_URL=http://localhost:8000
```

## Development

```bash
bun install
bun run dev
```

The web app runs on `http://localhost:3000`.

## Build

```bash
bun run build
```
