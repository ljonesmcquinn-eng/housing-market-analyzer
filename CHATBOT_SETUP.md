# DeedIQ AI Chatbot Setup Guide

This guide will help you set up the AI chatbot feature for DeedIQ using Google's Gemini API (free tier).

## Overview

The chatbot provides real-time assistance to users for:
- Real estate market analysis questions
- Investment metrics explanations (IRR, Cash-on-Cash, CAP rates)
- Property comparison guidance
- Deal analysis help
- General real estate investing questions

## Getting Your Free Gemini API Key

### Step 1: Access Google AI Studio

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey) or [https://aistudio.google.com/](https://aistudio.google.com/)
2. Sign in with your Google account (any Google account works - no credit card required!)

### Step 2: Create an API Key

1. Once logged in, click on **"Get API key"** in the left sidebar
2. Click **"Create API key"**
3. Select **"Create API key in new project"** (or select an existing Google Cloud project if you have one)
4. Your API key will be generated instantly
5. **IMPORTANT:** Copy the API key immediately - you won't be able to see it again!

### Step 3: Configure Your Environment

1. In your project root directory, create or edit the `.env` file
2. Add your API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the actual API key you copied.

### Step 4: Restart Your Server

After adding the API key to your `.env` file:

```bash
# Stop the server if it's running (Ctrl+C)

# Restart the server
npm start
```

## Testing the Chatbot

1. Start your server: `npm start`
2. Open the website in your browser: `http://localhost:3000`
3. Look for the **🤖 chatbot button** in the bottom-right corner
4. Click it to open the chat window
5. Try asking questions like:
   - "What is IRR and how is it calculated?"
   - "How do I compare two housing markets?"
   - "What's a good Cash-on-Cash return?"
   - "Should I invest in appreciation or cash flow markets?"

## Free Tier Limits

Google Gemini's free tier includes:
- **60 requests per minute**
- **1,500 requests per day**
- **1 million requests per month**

This is more than enough for personal use and small-scale deployments!

## Troubleshooting

### Error: "AI service is not configured"
- Make sure `GEMINI_API_KEY` is set in your `.env` file
- Verify there are no extra spaces or quotes around the key
- Restart your server after adding the key

### Error: "Rate limit exceeded"
- You've hit the free tier limit (60/min, 1500/day, 1M/month)
- Wait a few minutes and try again
- Consider upgrading to paid tier if needed for production use

### Chatbot not appearing
- Check browser console for JavaScript errors
- Ensure `chatbot.css` and `chatbot.js` are loaded (check Network tab)
- Clear browser cache and refresh

### AI responses are slow
- Gemini typically responds in 1-3 seconds
- Check your internet connection
- If persistent, the API may be experiencing high load

## Production Deployment (Render)

When deploying to Render.com:

1. Go to your Render dashboard
2. Select your web service
3. Go to **Environment** section
4. Add a new environment variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key
5. Click **Save Changes**
6. Render will automatically redeploy with the new environment variable

## Security Notes

- **NEVER commit your `.env` file to Git** (it's already in `.gitignore`)
- **NEVER expose your API key in client-side code**
- The API key is only used on the backend (in `/routes/chat.js`)
- Users never see or have access to your API key

## Cost Considerations

The Gemini API is **completely free** for the tier we're using with very generous limits. If you need more capacity in the future, Google offers paid tiers, but the free tier should handle hundreds of users per day without issues.

## Additional Features

The chatbot is context-aware and can:
- Detect which page the user is on
- Access current market data being viewed
- Understand if the user is using the calculator
- Provide relevant answers based on context

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify your API key is valid at [Google AI Studio](https://aistudio.google.com/)
3. Review this guide for common solutions

---

**Ready to test it out?**

1. Get your free API key: https://aistudio.google.com/
2. Add it to `.env`: `GEMINI_API_KEY=your_key`
3. Restart server: `npm start`
4. Open localhost:3000 and click the 🤖 button!
