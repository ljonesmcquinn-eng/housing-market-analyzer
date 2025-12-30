# 🚀 Deployment Guide

## Quick Deploy to Render.com (5 minutes)

### Step 1: Push to GitHub

1. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Name it `housing-market-analyzer` (or your preferred name)
   - Choose Public or Private
   - **DO NOT** initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code:**
   ```bash
   cd /Users/lucasmcquinn/housing-market-analyzer
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Sign up/Login:**
   - Go to https://render.com
   - Sign up with GitHub (easiest option)

2. **Create Web Service:**
   - Click **"New +"** in the top right
   - Select **"Web Service"**
   - Click **"Connect GitHub"** and authorize Render
   - Find your `housing-market-analyzer` repository
   - Click **"Connect"**

3. **Configure (Auto-detected from render.yaml):**
   - **Name:** `housing-market-analyzer` (or customize)
   - **Environment:** Node
   - **Build Command:** `npm install` (auto-filled)
   - **Start Command:** `npm start` (auto-filled)
   - **Plan:** Free
   - Click **"Create Web Service"**

4. **Wait for deployment:**
   - First deployment takes 2-3 minutes
   - Watch the logs in real-time
   - Once deployed, you'll see: ✅ **Live** at the top

5. **Your website is live!**
   ```
   https://housing-market-analyzer-XXXX.onrender.com
   ```

### Step 3: Share Your Website

Copy the URL and send it to anyone! They can access it from any device.

---

## Custom Domain (Optional)

### Add Your Own Domain

1. **In Render Dashboard:**
   - Go to your service
   - Click **"Settings"** tab
   - Scroll to **"Custom Domain"**
   - Click **"Add Custom Domain"**

2. **Enter your domain:**
   ```
   housingmarkets.com
   ```

3. **Update DNS:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the CNAME record Render provides
   - Example:
     ```
     Type: CNAME
     Name: www
     Value: housing-market-analyzer-XXXX.onrender.com
     ```

4. **SSL Certificate:**
   - Render automatically provisions SSL (HTTPS)
   - Takes 5-10 minutes after DNS propagates

---

## Alternative: Railway.app Deploy

Railway offers generous free tier and is super simple:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

Your site will be live at: `https://your-project-name.up.railway.app`

---

## Alternative: Vercel Deploy

Good for static sites and serverless functions:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then your site is live!
```

---

## Environment Variables (If Needed)

For production, you might want to set:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `3000` | Port to run on (auto-set by Render) |

These are already configured in `render.yaml`.

---

## Troubleshooting

### ❌ Build Failed
- Check logs in Render dashboard
- Ensure `package.json` has all dependencies
- Verify Node.js version compatibility

### ❌ Database Not Working
- SQLite database file is included in git
- Should work automatically
- Check that `.gitignore` doesn't exclude `*.db` files

### ❌ Site Times Out
- Free tier sleeps after 15 mins of inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are instant
- Upgrade to paid tier for always-on ($7/month)

### ❌ Can't Find GitHub Repo
- Ensure repository is not empty
- Make sure you pushed all files
- Refresh Render's repository list

---

## Performance Tips

### Keep Free Tier Awake
Use a service like UptimeRobot to ping your site every 5 minutes:

1. Sign up at https://uptimerobot.com
2. Add Monitor → HTTP(s)
3. URL: Your Render URL
4. Monitoring Interval: 5 minutes

### Upgrade for Production
If you get significant traffic:
- **Render Starter:** $7/month (always-on, faster)
- **Render Pro:** $25/month (autoscaling, better performance)

---

## Support

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs

---

**Ready to deploy? Start with Step 1! 🚀**
