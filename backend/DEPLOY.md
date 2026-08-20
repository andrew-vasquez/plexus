# Backend Deploy Notes

## Railway

Use the `backend/` directory as the Railway service root.

Railway should build from the included `Dockerfile`.

## Required environment variables

```bash
PLEXUS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

If you deploy preview frontends on Vercel, you can optionally allow them with:

```bash
PLEXUS_ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app
```

Notes:

- Do not include trailing slashes in `PLEXUS_ALLOWED_ORIGINS`
- Multiple fixed origins can be comma-separated
- Example: `PLEXUS_ALLOWED_ORIGINS=https://plexustabs.vercel.app,https://www.plexustabs.com`

Optional overrides:

```bash
PLEXUS_INFERENCE_PROVIDER=local
PLEXUS_DEMUCS_MODEL=htdemucs_6s
PLEXUS_MAX_UPLOAD_MB=50
PLEXUS_GUITAR_STEM_STRATEGY=direct
PLEXUS_REFINEMENT_PROVIDER=none
```

## Persistent storage

If you want uploads and generated artifacts to survive restarts or redeploys, attach a Railway volume and mount it into the container.

Suggested mount path:

```bash
/app
```

That keeps these runtime directories persistent:

- `/app/uploads`
- `/app/work`
- `/app/artifacts`
- `/app/refinement_dumps`

Without a persistent volume, the API still works, but generated files can disappear after restart or redeploy.
