# SigmaGPT

A full-stack ChatGPT-style AI chat application built from scratch using the MERN stack. Supports text conversations, image upload with vision analysis, multi-thread chat history, and JWT-based user authentication.

🌐 **Live Demo:** [sigma-gpt-project-ouwj.vercel.app](https://sigma-gpt-project-ouwj.vercel.app)

---

## Features

- **AI Chat** — Conversational AI powered by OpenRouter (GPT-OSS 20B for text, Gemma 4 for vision)
- **Image Upload & Vision Analysis** — Attach images to messages; the AI analyzes and responds based on image content
- **Edit Messages** — Edit any sent message and instantly get a new AI response from that point
- **Multi-Thread Chat History** — Create, switch between, and delete multiple conversation threads
- **Persistent Storage** — All threads and messages saved to MongoDB Atlas per user
- **JWT Authentication** — Secure register/login with bcrypt password hashing and JWT tokens
- **Markdown Rendering** — Full markdown support including tables, code blocks with syntax highlighting, lists, headings, and blockquotes
- **Animated Typing Effect** — AI responses stream word-by-word for a natural feel
- **Responsive Design** — Works on desktop and mobile with a sliding sidebar drawer on small screens
- **ChatGPT-style UI** — Dark theme, full-width AI responses, rounded pill input, clean typography

---

## Tech Stack

### Frontend
| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool and dev server |
| react-markdown | Markdown rendering |
| remark-gfm | GitHub Flavored Markdown (tables, strikethrough) |
| rehype-highlight | Syntax highlighting for code blocks |
| highlight.js | Code highlighting theme |
| react-spinners | Loading animation |
| uuid | Unique thread ID generation |

### Backend
| Package | Purpose |
|---------|---------|
| Express 5 | HTTP server and routing |
| Mongoose | MongoDB ODM |
| jsonwebtoken | JWT creation and verification |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

### Infrastructure
| Service | Role |
|---------|------|
| MongoDB Atlas | Cloud database |
| OpenRouter API | AI model gateway |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## Architecture

```
Browser (React + Vite)
        │
        │ HTTPS
        ▼
Vercel (Frontend)
        │
        │ REST API calls
        ▼
Render (Express Backend :8080)
   ├── POST /api/auth/register
   ├── POST /api/auth/login
   ├── GET  /api/thread            ← all threads for user
   ├── GET  /api/thread/:id        ← messages in a thread
   ├── DELETE /api/thread/:id      ← delete a thread
   └── POST /api/chat              ← send message, get AI reply
        │
        ├── Text → OpenRouter (GPT-OSS 20B)
        └── Image → OpenRouter (Gemma 4 Vision)
        │
        ▼
MongoDB Atlas (threads + messages + users)
```

---

## API Reference

### Auth Routes (`/api/auth`)

#### `POST /api/auth/register`
Register a new user.

**Body:**
```json
{ "username": "john", "password": "secret123" }
```
**Response:**
```json
{ "token": "eyJ...", "username": "john" }
```

#### `POST /api/auth/login`
Login with existing credentials.

**Body:**
```json
{ "username": "john", "password": "secret123" }
```
**Response:**
```json
{ "token": "eyJ...", "username": "john" }
```

---

### Chat Routes (`/api`) — All require `Authorization: Bearer <token>`

#### `GET /api/thread`
Returns all threads for the authenticated user, sorted by most recent.

**Response:**
```json
[{ "threadId": "abc123", "title": "What is React?", "updatedAt": "..." }]
```

#### `GET /api/thread/:threadId`
Returns all messages in a specific thread.

**Response:**
```json
[{ "role": "user", "content": "Hello", "timestamp": "..." }, ...]
```

#### `DELETE /api/thread/:threadId`
Deletes a thread and all its messages.

#### `POST /api/chat`
Send a message and receive an AI response.

**Body:**
```json
{
  "threadId": "abc123",
  "message": "Explain recursion",
  "imageBase64": null
}
```
**Response:**
```json
{ "reply": "Recursion is when a function calls itself..." }
```

For image analysis, pass a base64 data URL in `imageBase64`:
```json
{
  "threadId": "abc123",
  "message": "What is in this image?",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

---

## Database Schema

### User
```js
{
  username: String (unique, required),
  password: String (hashed with bcrypt)
}
```

### Thread
```js
{
  threadId: String (unique),
  userId: ObjectId (ref: User),
  title: String,
  messages: [Message],
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```js
{
  role: "user" | "assistant",
  content: String,
  imageUrl: String | null,
  timestamp: Date
}
```

---

## Project Structure

```
SigmaGPT/
├── Backend/
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── models/
│   │   ├── Thread.js        # Thread + Message mongoose schema
│   │   └── User.js          # User mongoose schema
│   ├── routes/
│   │   ├── auth.js          # Register and login routes
│   │   └── chat.js          # Thread and chat routes
│   ├── utils/
│   │   └── openai.js        # OpenRouter API calls (text + vision)
│   ├── .env                 # Environment variables (not committed)
│   ├── package.json
│   └── server.js            # Express app entry point
│
└── Frontend/
    ├── public/
    │   └── logo.svg         # App favicon and logo
    └── src/
        ├── assets/          # Static images
        ├── api.js           # Base URL config
        ├── App.jsx          # Root component, auth state, context
        ├── MyContext.jsx    # React context definition
        ├── Login.jsx        # Register/login form
        ├── Sidebar.jsx      # Thread list, new chat, delete
        ├── ChatWindow.jsx   # Navbar, input bar, message sending
        ├── Chat.jsx         # Message list with markdown rendering
        └── *.css            # Component styles
```

---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/Vedant1486/SigmaGPT.git
cd SigmaGPT
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create `Backend/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sigmagpt
JWT_SECRET=your_random_secret_string
OPENROUTER_API_KEY=sk-or-v1-...
```

```bash
npm run dev
# Server runs on http://localhost:8080
```

### 3. Frontend setup
```bash
cd Frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Deployment Guide

### MongoDB Atlas
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Go to **Network Access** → Add IP → `0.0.0.0/0` (allow all)
4. Copy the connection string

### Backend on Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Root Directory: `Backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `OPENROUTER_API_KEY`

### Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Root Directory: `Frontend`
4. Framework: Vite
5. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`

---

## Environment Variables Summary

### Backend
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `OPENROUTER_API_KEY` | API key from [openrouter.ai](https://openrouter.ai) |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (Render deployment URL) |

---

## Author

Built by [Vedant Lawange](https://github.com/Vedant1486)
