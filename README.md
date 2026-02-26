# Knowledge Platform — Backend API

RESTful API for the Knowledge Sharing Platform built with Node.js, Express, and MySQL.

## Architecture Overview

```
backend/
├── src/
│   ├── config/database.js      # Sequelize MySQL connection
│   ├── middleware/auth.js       # JWT authentication middleware
│   ├── models/
│   │   ├── User.js             # User model (id, username, email, password)
│   │   └── Article.js          # Article model with User association
│   ├── controllers/
│   │   ├── authController.js   # Signup, Login, GetMe
│   │   ├── articleController.js # CRUD + search/filter
│   │   └── aiController.js     # AI improve, summarize, suggest-tags
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── articleRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   └── aiService.js        # Google Gemini AI integration
│   └── index.js                # Express app entry point
├── .env
└── package.json
```

### Key Design Decisions

- **Sequelize ORM** for MySQL — auto-creates DB and syncs tables on startup
- **JWT Authentication** — 24h tokens, bcrypt password hashing
- **Google Gemini AI** — real AI integration for content improvement, summary generation, and tag suggestions
- **Author-only authorization** — edit/delete restricted to article owners
- **Auto-generated summaries** — AI generates a short summary on article creation/update

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/articles` | No | List articles (search, filter, paginate) |
| GET | `/api/articles/:id` | No | Get single article |
| POST | `/api/articles` | Yes | Create article |
| PUT | `/api/articles/:id` | Yes | Update article (author only) |
| DELETE | `/api/articles/:id` | Yes | Delete article (author only) |
| GET | `/api/articles/user/me` | Yes | Get user's articles |
| POST | `/api/ai/improve` | Yes | AI improve content |
| POST | `/api/ai/summarize` | Yes | AI generate summary |
| POST | `/api/ai/suggest-tags` | Yes | AI suggest tags |

## AI Usage

**AI Tool Used:** Google Gemini (Claude/Cursor AI assisted during development)

### Where AI Helped:
- **Code generation**: Initial Express boilerplate, Sequelize model definitions, JWT middleware
- **API design**: Route structure, controller patterns, error handling
- **AI service integration**: Prompt engineering for Gemini API calls (content improvement, summarization, tag suggestion)
- **SQL schema**: Database schema design with proper foreign keys and indexes
- **Security**: Password hashing strategy, JWT implementation, authorization middleware

### What Was Reviewed/Corrected Manually:
- Optimized error handling and validation logic in controllers
- Refined AI prompts for better output quality
- Added proper CORS configuration and request body size limits
- Implemented auto-database creation on startup
- Added pagination and search/filter logic for article listing

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.x running locally

### Environment Variables
Create a `.env` file in the backend root:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=knowledge_platform
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### Install & Run
```bash
cd backend
npm install
npm start        # Production
npm run dev      # Development (nodemon)
```

The server will:
1. Auto-create the `knowledge_platform` database if it doesn't exist
2. Sync all Sequelize models (create tables)
3. Start on `http://localhost:5000`
