# Deployment Notes - Netlify

## Overview
This document provides step-by-step instructions for deploying the appointments system to Netlify.

---

## Prerequisites

1. **GitHub Repository**: Code must be pushed to GitHub
2. **Netlify Account**: Sign up at https://app.netlify.com
3. **Neon Database**: PostgreSQL database hosted on Neon (or any PostgreSQL provider)

---

## Environment Variables

### Required Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `NEXTAUTH_SECRET` | JWT secret (min 32 characters) | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Production URL | `https://your-site.netlify.app` (update after first deploy) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` (auto-set by Netlify) |

---

## Netlify Configuration

### Build Settings

The project includes `netlify.toml` with the following configuration:

```toml
[build]
  command = "npm run build"
  publish = ".next"
  
[build.environment]
  NODE_VERSION = "20"
  PRISMA_GENERATE_DATAPROXY = "true"
```

### Manual Configuration (if needed)

If `netlify.toml` is not detected:

1. Go to **Site Settings** → **Build & Deploy**
2. Set **Build command**: `npm run build`
3. Set **Publish directory**: `.next`
4. Set **Node version**: `20`

---

## Deployment Steps

### Step 1: Connect Repository

1. Log in to Netlify Dashboard
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub
5. Select repository: `shalevtr/Nihul_Torim`

### Step 2: Configure Environment Variables

1. Before deploying, go to **Site Settings** → **Environment Variables**
2. Add all required variables (see above)
3. **Important**: Set `NEXTAUTH_URL` to your Netlify URL after first deploy

### Step 3: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (3-5 minutes)
3. Check build logs for any errors

### Step 4: Update NEXTAUTH_URL

1. After successful deploy, copy your site URL (e.g., `https://your-site.netlify.app`)
2. Go to **Site Settings** → **Environment Variables**
3. Update `NEXTAUTH_URL` to your actual URL
4. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## Build Process

### What Happens During Build

1. **Install Dependencies**: `npm install`
2. **Generate Prisma Client**: `prisma generate`
3. **Build Next.js**: `next build`
4. **Output**: `.next` directory

### Build-Time Safety

The build process is designed to be resilient:

- **Missing DATABASE_URL**: Build will succeed, but runtime DB calls will fail
- **Missing NEXTAUTH_SECRET**: Build will succeed, but auth will fail at runtime
- **Prisma Connection**: No connection attempt during build (only at runtime)

### Dynamic Routes

The following routes are marked as dynamic and require DB access at runtime:

- `/api/*` - All API routes
- `/b/[id]` - Public business pages (cached for 5 minutes)
- `/api/sitemap` - Sitemap generation
- `/api/robots` - Robots.txt

---

## Troubleshooting

### Build Fails

**Error**: `DATABASE_URL environment variable is not set`
- **Solution**: Add `DATABASE_URL` to Netlify environment variables

**Error**: `NEXTAUTH_SECRET must be at least 32 characters`
- **Solution**: Generate a longer secret (see Required Variables section)

**Error**: `Prisma Client generation failed`
- **Solution**: Check `DATABASE_URL` format and ensure it includes `sslmode=require`

### Runtime Errors

**Error**: Database connection timeout
- **Solution**: Ensure `DATABASE_URL` includes `?sslmode=require&pgbouncer=true` for Neon pooler

**Error**: Authentication not working
- **Solution**: Verify `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your domain

### Build Succeeds but Site Doesn't Load

1. Check **Deploy logs** for runtime errors
2. Check **Function logs** in Netlify Dashboard
3. Verify all environment variables are set correctly

---

## Post-Deployment

### Custom Domain (Optional)

1. Go to **Site Settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy

### Monitoring

- **Deploy Logs**: View in Netlify Dashboard → Deploys
- **Function Logs**: View in Netlify Dashboard → Functions
- **Analytics**: Enable in Netlify Dashboard → Analytics

---

## Calendar Component Fix

### What Was Fixed

The calendar component (`src/components/calendar-view.tsx`) had a bug where every month started on Sunday regardless of the actual weekday.

### Solution

- Added calculation of the first day's weekday using `getDay()` from `date-fns`
- Added empty cells before the first day to align with the correct weekday
- Calendar now correctly displays months with proper weekday alignment

### How It Works

```typescript
// Calculate weekday of first day (0 = Sunday, 6 = Saturday)
const firstDayOfWeek = getDay(monthStart)

// Create empty cells before first day
const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => i)

// Render empty cells, then days of month
{emptyCells.map(...)}
{daysInMonth.map(...)}
```

---

## Build Stability Improvements

### Changes Made

1. **Database Connection**: Made non-fatal during build
   - Returns placeholder URL during build if `DATABASE_URL` is missing
   - Only connects at runtime

2. **Environment Validation**: Deferred to runtime
   - `validateEnv()` only runs in production runtime, not during build
   - Build succeeds even if env vars are missing (will fail at runtime)

3. **Session Management**: Safe during build
   - `getSession()` returns `null` during build phase
   - Prevents Prisma calls during static generation

4. **Dynamic Routes**: Properly marked
   - API routes marked as `force-dynamic`
   - Public pages allow dynamic rendering if DB fails

---

## Summary

- ✅ Build process is resilient to missing env vars
- ✅ Calendar displays correct weekday alignment
- ✅ Dynamic routes properly configured
- ✅ Prisma only connects at runtime, not during build
- ✅ All fixes tested and verified

---

## Support

For issues:
1. Check Netlify build logs
2. Check function logs
3. Verify environment variables
4. Check database connection string format

