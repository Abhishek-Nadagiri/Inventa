# 🚀 Inventa Deployment Guide

Deploy Inventa to make it accessible from **any device worldwide**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────────┐                 ┌─────────────────────┐
│   FRONTEND (React)  │                 │  BACKEND (Flask)    │
│                     │  ◄── API ───►   │                     │
│  - Vercel           │                 │  - Render           │
│  - Netlify          │                 │  - Railway          │
│  - GitHub Pages     │                 │  - PythonAnywhere   │
└─────────────────────┘                 └─────────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────────┐
                                        │   DATABASE (TinyDB) │
                                        │   inventa_db.json   │
                                        └─────────────────────┘
```

---

## Option 1: Deploy Backend to Render (FREE)

### Step 1: Create GitHub Repository

1. Create a new repository on GitHub
2. Push the `backend/` folder to the repository:

```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventa-backend.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `inventa-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
5. Add Environment Variables:
   - `SECRET_KEY`: Click "Generate"
   - `JWT_SECRET_KEY`: Click "Generate"
   - `FLASK_ENV`: `production`
6. Click **"Create Web Service"**

### Step 3: Get Your Backend URL

After deployment, you'll get a URL like:
```
https://inventa-backend.onrender.com
```

---

## Option 2: Deploy Backend to Railway (FREE)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Deploy

```bash
cd backend
railway login
railway init
railway up
```

### Step 3: Add Environment Variables

```bash
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set JWT_SECRET_KEY=$(openssl rand -hex 32)
railway variables set FLASK_ENV=production
```

---

## Option 3: Deploy to PythonAnywhere (FREE)

### Step 1: Create Account

Go to [pythonanywhere.com](https://www.pythonanywhere.com) and create a free account.

### Step 2: Upload Files

1. Go to **Files** tab
2. Upload all files from `backend/` folder
3. Create a virtual environment:

```bash
mkvirtualenv inventa --python=/usr/bin/python3.11
pip install -r requirements.txt
```

### Step 3: Configure Web App

1. Go to **Web** tab
2. Click **"Add a new web app"**
3. Choose **Flask**
4. Set:
   - **Source code**: `/home/YOUR_USERNAME/backend`
   - **Working directory**: `/home/YOUR_USERNAME/backend`
   - **Virtualenv**: `/home/YOUR_USERNAME/.virtualenvs/inventa`
5. Edit WSGI file to point to your app

---

## Deploy Frontend to Vercel (FREE)

### Step 1: Update API URL

Create `.env.production`:

```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Step 2: Deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Deploy Frontend to Netlify (FREE)

### Step 1: Build

```bash
npm run build
```

### Step 2: Deploy

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `dist/` folder
3. Set environment variable:
   - `VITE_API_URL`: Your backend URL

---

## Environment Variables

### Backend (.env)

```env
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
FLASK_ENV=production
DATABASE_PATH=data/inventa_db.json
UPLOAD_FOLDER=data/uploads
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## After Deployment

### Update Frontend API URL

Edit `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';
```

### Test Cross-Device Access

1. Open the app on your phone
2. Register a new account
3. Login from your laptop
4. Verify the same data is accessible

---

## Troubleshooting

### "Failed to fetch" Error

1. Check if backend is running: `https://your-backend-url.com/health`
2. Verify CORS is configured correctly
3. Check browser console for detailed errors

### Data Not Persisting

1. Ensure `data/` folder exists on server
2. Check write permissions
3. Verify `DATABASE_PATH` environment variable

### PDF Download Not Working

1. Ensure jsPDF is installed
2. Check browser console for errors
3. Try a different browser

---

## Quick Checklist

- [ ] Backend deployed to Render/Railway/PythonAnywhere
- [ ] Backend URL obtained
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Frontend deployed to Vercel/Netlify
- [ ] CORS configured for frontend domain
- [ ] Environment variables set on both platforms
- [ ] Tested login from multiple devices
- [ ] PDF download working
- [ ] Document upload working

---

## Support

If you encounter issues:

1. Check the browser console (F12 → Console)
2. Check the backend logs on Render/Railway
3. Verify environment variables are set correctly
4. Ensure CORS allows your frontend domain

---

## Security Recommendations

1. **Use HTTPS**: Both Render and Vercel provide free SSL
2. **Strong Secrets**: Use long, random SECRET_KEY values
3. **Rate Limiting**: Add rate limiting in production
4. **Backup Database**: Regularly backup `inventa_db.json`
5. **Monitor Logs**: Check for suspicious activity

---

## Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Render (Backend) | **FREE** | 750 hours/month free |
| Vercel (Frontend) | **FREE** | 100GB bandwidth free |
| Total | **$0/month** | Perfect for MVP |

For higher traffic, upgrade to paid plans starting at ~$7/month.
