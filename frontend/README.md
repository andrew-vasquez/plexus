# Plexus Frontend

TanStack Start frontend for Plexus. The app keeps Clerk for authentication and
talks directly to the FastAPI backend for upload flows.

## Environment

Create `frontend/.env` with:

```bash
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
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

## Deploy

Nitro is enabled for production deployments.

This app is not a static Vite SPA. It uses TanStack Start server rendering and
Clerk middleware, so deploy it as a Nitro server target.

Railway:

```bash
Root Directory: frontend
Install Command: bun install
Build Command: bun run build
Start Command: bun run start
```

Set this environment variable on Railway:

```bash
NITRO_PRESET=node-server
```

Vercel:

```bash
Root Directory: frontend
Install Command: bun install
Build Command: bun run build
```

Set this environment variable on Vercel:

```bash
NITRO_PRESET=vercel
```

Do not set an output directory as if this were a static Vite build.

Required environment variables on either host:

```bash
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
VITE_API_BASE_URL=https://your-backend.example.com
```
