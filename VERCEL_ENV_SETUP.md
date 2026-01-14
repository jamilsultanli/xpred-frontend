# Vercel Environment Variables Configuration

Add these environment variables to your Vercel project:

## Frontend (xpred-frontend)
```
VITE_API_URL=https://xpred-backend.vercel.app/api/v1
VITE_API_BASE_URL=https://xpred-backend.vercel.app
```

## Backend (xpred-backend)
Already configured with Supabase environment variables.

## How to Set in Vercel:

### For Frontend:
1. Go to: https://vercel.com/jamilsultanli/xpred-frontend/settings/environment-variables
2. Add:
   - Name: `VITE_API_URL`
   - Value: `https://xpred-backend.vercel.app/api/v1`
   
   - Name: `VITE_API_BASE_URL`  
   - Value: `https://xpred-backend.vercel.app`

3. Select all environments (Production, Preview, Development)
4. Click "Save"
5. Redeploy the frontend

### Notes:
- Socket.IO will automatically work with these settings
- WebSocket URL will be derived from API_BASE_URL
- No localhost references in production

