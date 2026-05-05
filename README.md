# 📚 Darija Knowledge AI

A complete, AI-powered Moroccan Darija language learning platform with OCR, translation, audio, and gamification.

## ✨ Key Features

- 🔐 **User Authentication** - Secure signup and login with JWT
- 📤 **File Upload** - Import PDFs, images, and text files
- 🤖 **AI Translation** - Automatic French/English → Moroccan Darija
- 🎤 **Text-to-Speech** - Listen to pronunciations
- 📖 **Reading Interface** - Side-by-side French/Darija display
- 🎮 **Gamification** - Earn XP, unlock levels and badges
- 📊 **Progress Tracking** - Monitor learning journey
- 🏆 **Learning Path** - 5 progressive difficulty levels

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 16+
- MongoDB (local or MongoDB Atlas)
- Google Generative AI API key (free from https://makersuite.google.com/app/apikey)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Setup environment variables:**
   
   Copy `.env.example` to `.env` and add your API keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   VITE_GOOGLE_API_KEY=your_google_api_key
   ```
   See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed Supabase configuration.

3. **Start services (2 terminals):**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

4. **Open:** http://localhost:5173

## 📋 What's Included

### ✅ Fully Implemented
- Complete REST API with Express.js
- MongoDB database with 4 main collections
- React frontend with 7 pages
- User authentication with JWT
- File upload and OCR
- AI-powered Darija translation
- Text-to-speech audio
- Quiz system with auto-generated questions
- Learning levels and XP system
- User profiles and statistics
- Responsive mobile design

### 🎯 Ready to Use
- All backend routes documented
- All database schemas defined
- All frontend pages styled
- Authentication flow complete
- API client configured
- Error handling implemented

## 🗂️ Project Structure

```
darija-knowledge-ai/
├── server/                 # Backend (Node.js + Express)
│   ├── server.js          # Express app
│   ├── package.json       # Dependencies
│   ├── .env              # Configuration
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication
│   └── config/           # Database setup
│
├── src/                  # Frontend (React)
│   ├── pages/           # Page components
│   ├── components/      # UI components
│   ├── services/        # API & utilities
│   ├── context/         # Auth state
│   └── assets/          # Images
│
├── SUPABASE_SETUP.md    # Supabase configuration guide
└── supabase/            # Database schema
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Texts
- `POST /api/texts/save` - Save text
- `GET /api/texts/list` - Get user texts
- `GET /api/texts/:id` - View text
- `POST /api/texts/:id/favorite` - Toggle favorite
- `POST /api/texts/translate` - Translate to Darija

### Quiz
- `GET /api/quiz/text/:textId` - Get questions
- `GET /api/quiz/random/:count` - Random questions
- `POST /api/quiz/submit` - Submit answer

### User
- `GET /api/users/profile` - Get profile
- `POST /api/users/addxp` - Add XP
- `POST /api/users/badge` - Unlock badge

### Journey
- `GET /api/journey/progress` - Get progress
- `POST /api/journey/complete-level/:id` - Complete level

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Tesseract.js, Google Generative AI

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

**Deployment:** Docker, MongoDB Atlas, Render/Railway, Vercel/Netlify

## 🎯 Learning Levels

| Level | Name | Range | Description |
|-------|------|-------|-------------|
| 1 | Découverte 🔍 | 0-499 XP | Learn basics |
| 2 | Apprenti 📚 | 500-999 | Build vocabulary |
| 3 | Curieux 🤔 | 1000-1499 | Understand culture |
| 4 | Savant 🧠 | 1500-1999 | Master grammar |
| 5 | Maître 👑 | 2000+ | Expert level |

## 📖 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Database configuration

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Supabase connection error | Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env |
| API 404 errors | Check backend runs on :5000 |
| OCR not working | Use clear image, PNG/JPG format |
| Google API error | Get key from https://makersuite.google.com/app/apikey |
| Login fails | Verify Supabase credentials and run schema.sql in SQL Editor |

## 🚢 Deployment

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for hosting your Supabase database and deploying to production.

## 📊 Database Models

- **profiles** - User accounts, profiles, stats
- **texts** - Saved documents, translations

## 🔒 Security

- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Environment variables
- ✅ Input validation

## 💡 Next Steps

1. Get Google API key from https://makersuite.google.com/app/apikey
2. Set up Supabase project (see SUPABASE_SETUP.md)
3. Configure your .env with Supabase credentials
4. Start backend and frontend
5. Open http://localhost:5173

## 📝 Test Account

```
Email: test@example.com
Password: test123456
```

## 🤝 Support

- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database configuration
- View logs in terminal for debugging
- Check browser console for frontend errors

## 📄 License

Educational use only.

---

**Built with ❤️ for Moroccan Darija learners**

Lis dans ta langue, comprends vraiment 📚

