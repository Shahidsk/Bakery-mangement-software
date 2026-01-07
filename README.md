# Bakery Employee Management System

A mobile-first web application for managing bakery employees, attendance, and salary calculations.

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Hosting:** Cloudflare Pages

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd bakery-management
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase-setup.sql` in the SQL Editor
3. Enable Email/Password authentication
4. Create an admin user in Authentication → Users

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

## Deploy to Cloudflare Pages

### Option A: Via Cloudflare Dashboard (Recommended)

1. Push code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Save and Deploy"

### Option B: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy
wrangler pages deploy dist --project-name=bakery-management
```

## Features

- 📊 **Dashboard** - Overview with quick stats and actions
- 👥 **Employee Management** - Add, edit, activate/deactivate employees
- 📅 **Attendance Tracking** - Daily attendance with date navigation
- 💰 **Expenses/Advances** - Record cash advances and bakery purchases
- 📈 **Salary Reports** - Monthly salary calculations with deductions

## License

MIT

