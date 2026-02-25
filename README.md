# DBA Page — React Vite Clone

A full clone of dbapage.com built with React + Vite + Supabase, with added authentication and course-specific video access.

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
│   └── supabase.js              # Supabase client
├── pages/
│   ├── Home.jsx / .css          # Full homepage (Hero+Auth, About, Services, etc.)
│   ├── Dashboard.jsx / .css     # Protected student dashboard with course videos
│   ├── Videos.jsx / .css        # Public videos page with filters
│   ├── CoursePage.jsx / .css    # Course detail pages (all 4 courses)
│   └── Placeholders.jsx         # Quiz, Blogs, Labs, Interview Questions stubs
├── styles/
│   └── global.css               # Global variables, reset, typography
├── App.jsx                      # Router + layout
└── main.jsx                     # Entry point
```

## Setup Instructions

### 1. Clone & Install
```bash
cd dbapage
npm install
```

### 2. Configure Supabase
1. Go to https://supabase.com and create a new project
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Create a `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Supabase SQL Setup
1. In Supabase Dashboard → SQL Editor
2. Paste and run the entire contents of `supabase_setup.sql`
3. This creates: `profiles`, `videos`, `contact_messages` tables + RLS policies + sample video data

### 4. Run Development Server
```bash
npm run dev
```

## How It Works

### Registration Flow
1. User fills the **Register** tab in the hero section (name, email, password, course)
2. A Supabase Auth user is created + a `profiles` row with `approved = false`
3. User is signed out immediately — they cannot log in yet

### Admin Approval
In Supabase SQL Editor, run:
```sql
-- See pending registrations
SELECT id, name, email, course, created_at
FROM profiles
WHERE approved = false
ORDER BY created_at DESC;

-- Approve a student
UPDATE profiles SET approved = true WHERE email = 'student@example.com';
```

### Login Flow
1. User submits Login form
2. Supabase Auth signs them in
3. Their `profiles` row is checked — if `approved = false`, they are signed back out with a message
4. If approved, they stay logged in and can visit `/dashboard`

### Dashboard (Course-Filtered Videos)
- Fetches only videos where `videos.course = profile.course`
- An Oracle DBA student ONLY sees Oracle DBA videos
- Row Level Security (RLS) enforces this at the database level

## Adding Videos (Admin)
In Supabase Dashboard → Table Editor → videos, insert rows:
- `title` — Video title
- `video_url` — Full YouTube URL (e.g. https://www.youtube.com/watch?v=XXXX)
- `course` — Must exactly match one of: `Oracle DBA`, `Oracle Developer`, `PostgreSQL DBA`, `PostgreSQL Developer`
- `is_public` — `true` = shown on public /videos page; `false` = dashboard only
- `description` — Short description
- `duration` — e.g. `45:30`

## Build for Production
```bash
npm run build
npm run preview
```
