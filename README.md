# TRACOM Nova — Deployment Guide

## Deploy to Netlify (Recommended)

### Option A — Drag & Drop (Easiest, no account setup needed)
1. Go to https://app.netlify.com/drop
2. Drag and drop the entire `excellence-quest` folder onto the page
3. Netlify will build and deploy it automatically
4. You'll get a live URL like `https://random-name-123.netlify.app`

### Option B — Connect to GitHub
1. Push this folder to a GitHub repository
2. Go to https://netlify.com and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Build settings are auto-detected from netlify.toml
6. Click Deploy

---

## Deploy to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. In this folder, run: `vercel`
3. Follow the prompts — it will deploy and give you a live URL

Or via GitHub:
1. Push to GitHub
2. Go to https://vercel.com and import the repo
3. Vercel auto-detects React and deploys

---

## Run Locally

```bash
npm install
npm start
```

Opens at http://localhost:3000

---

## Supabase Setup Reminder

Make sure your Supabase project has:
- All 5 tables created (branches, officers, submissions, redemptions, config)
- RLS disabled on all tables
- At least the branches and admin password seeded

The Supabase URL and anon key are already embedded in src/App.jsx.
# tracom-nova
