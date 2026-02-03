# AI Integration Setup Guide

## Google Gemini API Setup (FREE)

### Step 1: Get Your API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure Backend

1. Navigate to backend folder:
```bash
cd /home/sheba/VS/cv-generator-backend
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Restart Backend Server

Kill the current backend process (Ctrl+C) and restart:
```bash
cd /home/sheba/VS/cv-generator-backend
./venv/bin/python app.py
```

## How to Use AI Features

### 1. Generate Professional Summary
- Fill in "Profession/Job Title" (e.g., "Nurse")
- Optionally add "Years of Experience" and "Specialization"
- Click "🤖 AI Generate Summary" button
- AI will create a professional summary tailored to your profession

### 2. Suggest Skills
- Go to Step 2 (Skills)
- Click "🤖 AI Suggest Skills" button
- AI will generate 12-15 relevant skills for your profession
- You can edit, remove, or add more skills manually

### 3. Caching
- AI responses are automatically cached
- Same profession + specialization = instant results (no API call)
- Reduces costs and improves speed

## API Limits (Free Tier)

**Google Gemini Free Tier:**
- 1,500 requests per day
- 1 million tokens per month
- More than enough for hundreds of CVs daily

## Features Included

✅ AI-powered professional summary generation
✅ Intelligent skills suggestions
✅ Experience description enhancement (backend ready)
✅ Response caching for efficiency
✅ Zambian job market optimization
✅ Error handling and loading states

## Troubleshooting

**"Failed to connect to AI service"**
- Check if backend server is running
- Verify API key is set in `.env` file
- Restart backend server

**"Failed to generate summary"**
- Ensure profession field is filled
- Check backend console for detailed errors
- Verify API key is valid

**AI not working**
- Make sure you created `.env` file
- API key should have no quotes in `.env` file
- Backend should show "Gemini AI configured" message on startup

## Testing Different Professions

Try these Zambian professions:
- Nurse
- Teacher
- Software Developer
- Accountant
- Mining Engineer
- Agricultural Officer
- Social Worker
- Marketing Manager
- Electrician
- Chef

Each will get customized suggestions relevant to the Zambian job market!

## Cost Estimate (if you exceed free tier)

- Summary generation: ~$0.001 per request
- Skills generation: ~$0.002 per request
- With caching: ~$0.10 per 100 unique CVs
- Very affordable even at scale!

---

**Ready to test!** Fill in the profession field and click the AI buttons! 🤖
