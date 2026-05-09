# TaskMatrix Production Deployment Guide

This guide provides step-by-step instructions for deploying TaskMatrix to Vercel and configuring it for a production environment.

## 1. Pre-Deployment Verification
Before pushing to GitHub, ensure your local build completes without errors. Run:
```bash
npm run build
```
*(Note: TaskMatrix is already optimized and configured to build cleanly.)*

## 2. Pushing to GitHub
Commit your latest changes and push them to your repository:
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

## 3. Vercel Deployment Steps
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** and select **"Project"**.
3. Import the GitHub repository for TaskMatrix.
4. In the **"Configure Project"** screen:
   - **Framework Preset**: Next.js (This should be auto-detected)
   - **Root Directory**: `./` (Leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

## 4. Environment Variables (Critical Step)
Before clicking "Deploy", expand the **Environment Variables** section and add all your keys from your `.env.local`. 

**Required Variables:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GEMINI_API_KEY`

> **Warning:** Do NOT skip this step. Without these variables, authentication and AI features will crash in production.

Click **Deploy**!

## 5. Firebase Production Setup
Once Vercel gives you your production URL (e.g., `https://taskmatrix.vercel.app`):
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication > Settings > Authorized domains**.
3. Add your new Vercel domain to the list so Google OAuth and Email Auth work securely.

## 6. Post-Deployment Lighthouse Optimization
The code is already optimized for a high Lighthouse score:
- **Global `loading.tsx`** eliminates layout shifts.
- **Custom `not-found.tsx`** improves error handling UX.
- **Optimized Next.js Metadata** boosts SEO and Accessibility (a11y).
- **Image component configurations** in `next.config.ts` are ready for external avatars.

Run a Lighthouse test via Chrome DevTools on your live Vercel URL to confirm 90+ scores!
