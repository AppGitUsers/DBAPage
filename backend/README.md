# DBA Page — Backend (Django REST Framework)

Replaces the previous Supabase backend: Postgres (or local sqlite for dev) +
Django REST Framework, serving the same API surface the frontend expects at
`VITE_API_URL`.

## Apps
- `accounts` — custom `User` model (replaces Supabase Auth + `profiles`), auth endpoints, candidate admin endpoints
- `courses` — `Course`, `StudentCourse` (multi-course enrollment)
- `videos` — `Video`
- `contact` — `ContactMessage` + SendGrid email send

## Setup

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate      # or source .venv/bin/activate on Linux/macOS
pip install -r requirements.txt
cp .env.example .env        # then fill in real values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

By default (no `DB_ENGINE` set, or anything other than `postgres`) this runs
against a local `db.sqlite3` with zero external dependencies — useful for
development. Set `DB_ENGINE=postgres` plus `DB_NAME`/`DB_USER`/`DB_PASSWORD`/
`DB_HOST`/`DB_PORT` in `.env` to point at real Postgres (see `.env.example`).

## Auth
Token-based (`rest_framework.authtoken`) — the frontend stores the returned
token and sends it as `Authorization: Token <token>`. Registration never
issues a token (matches the previous "always signed out after signup"
behavior); login only issues one if the account is `approved`.

## Tests
```bash
python manage.py test
```

## API surface
See the top-level project plan / commit history for the full endpoint list —
in short: `/api/auth/*` (register, login, logout, me), `/api/courses/`,
`/api/videos/public/`, `/api/videos/mine/`, `/api/contact/`, and the
staff-only `/api/admin/candidates/`, `/api/admin/courses/`,
`/api/admin/videos/`, `/api/admin/messages/`.
