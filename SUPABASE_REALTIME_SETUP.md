# Supabase Realtime Messaging Setup

## Environment Variables Required

Add these to your Vercel Frontend project:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get These Values:

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Enable Realtime in Supabase:

1. Go to Database → Replication
2. Enable replication for the `messages` table
3. Select all operations: INSERT, UPDATE, DELETE

## Test Real-time:

Open two browser windows with different users and send messages - they should appear instantly!

