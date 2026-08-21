# DBA Page — React Vite Clone

A full clone of dbapage.com built with React + Vite, backed by a Django REST
Framework API (see `../backend/`), with authentication and course-specific
video access.

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx / .css        # Top bar + sticky navbar with dropdowns
│   ├── Footer.jsx / .css        # Footer with links and newsletter
│   ├── AuthForms.jsx / .css     # Login + Register panel (in hero)
├── contexts/
│   └── AuthContext.jsx          # Global auth state (user, profile)
├── lib/
│   ├── apiClient.js             # Thin fetch wrapper around the Django API
│   └── useCourses.js            # Active-course list, with a fallback
├── pages/
│   ├── Home.jsx / .css          # Full homepage (Hero+Auth, About, Services, etc.)
│   ├── Dashboard.jsx / .css     # Protected student dashboard with course videos
│   ├── Videos.jsx / .css        # Public videos page with filters
│   ├── CoursePage.jsx / .css    # Course detail pages (all 4 courses)
│   ├── AdminDashboard.jsx / .css # Admin panel (candidates, courses, videos, messages)
│   └── Placeholders.jsx         # Quiz, Blogs, Labs, Interview Questions stubs
├── styles/
│   └── global.css               # Global variables, reset, typography
├── App.jsx                      # Router + layout
└── main.jsx                     # Entry point
```

## Setup Instructions

### 1. Start the backend
See `../backend/README` (or just `../backend/.env.example`) — this app needs
the Django API running before login/registration/videos/admin will work.

### 2. Install & configure
```bash
cd frontend
npm install
```
Create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

## How It Works

### Registration Flow
1. User fills the **Register** tab in the hero section (name, email, password, course)
2. This calls `POST /api/auth/register/` on the backend, creating an account with `approved = false`
3. No session is created — they cannot log in yet

### Admin Approval
Approve a pending student either through the `/admin` panel in this app (Candidates tab),
or via the Django admin site at `<API_URL>/admin/`.

### Login Flow
1. User submits the Login form, which calls `POST /api/auth/login/`
2. If the account isn't approved yet, the backend returns 403 and no session token is issued
3. If approved, a token is returned and stored, and the user can visit `/dashboard`

### Dashboard (Course-Filtered Videos)
- Fetches from `GET /api/videos/mine/`, which returns videos matching the student's
  primary course plus any additional courses an admin has assigned them
- An Oracle DBA student sees Oracle DBA videos (and any other assigned courses)
- Enforced server-side by the Django view, not by anything in the browser

## Adding Videos (Admin)
Use the `/admin` panel's Videos tab, or the Django admin site, to add a video with:
- `title` — Video title
- `video_url` — Full YouTube URL (e.g. https://www.youtube.com/watch?v=XXXX)
- `course` — Must exactly match an existing course name (e.g. `Oracle DBA`)
- `is_public` — `true` = shown on public /videos page; `false` = dashboard only
- `description` — Short description
- `duration` — e.g. `45:30`

## Build for Production
```bash
npm run build
npm run preview
```
