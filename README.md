# TinyLink
Converts Long links into smaller link
# 🎯 TinyLink – URL Shortener

TinyLink is a lightweight and fast URL shortener that lets users create short links, track link analytics, and manage URLs through a clean and modern interface.

## 🚀 Features

- 🔗 Shorten long URLs instantly
- 🎲 Auto-generated short codes (6–8 characters)
- 📈 Click analytics
  - Total clicks
  - Last clicked timestamp
  - Creation timestamp
- 🗑️ Delete links (soft delete)
- 🔀 HTTP 302 redirects
- 🌐 Full absolute URLs (e.g., `https://yourdomain.com/abc123`)
- 💻 Frontend: React (Vite) + Tailwind CSS
- 🛠 Backend: Node.js + Express
- 🗄️ Database: MongoDB (Atlas or local)
- ☁️ Deployable on Vercel + Render

## 🧩 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Lucide Icons

**Backend**
- Node.js
- Express.js
- Mongoose (MongoDB)

**Deployment**
- Frontend: Vercel
- Backend: Render / Railway
- Database: MongoDB Atlas (recommended)

## 📁 Project Structure

```
TinyLink/
│── back/          # Express API backend
│── frontend/      # React + Vite frontend
│── README.md
│── Take-Home Assignment PDF (optional)
```

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

**Install dependencies:**
```bash
cd back
npm install
```

**Create `.env` file:**
```env
PORT=4000
MONGO_URL=<your-mongodb-connection-string>
BASE_URL=http://localhost:4000
```

**Start backend:**
```bash
npm run dev
```

Backend will run at: `http://localhost:4000`

### 2️⃣ Frontend Setup

**Install dependencies:**
```bash
cd frontend
npm install
```

**Create `.env` file:**
```env
VITE_API_URL=http://localhost:4000
VITE_USE_ABSOLUTE_URL=true
```

**Start frontend:**
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

## 📡 API Endpoints

### 🔄 Health Check
```
GET /healthz
```

### ➕ Create Short Link
```
POST /api/links
```
**Body:**
```json
{
  "target": "https://example.com"
}
```

### 📃 List All Links
```
GET /api/links
```

### 📊 Stats for a Link
```
GET /api/links/:code
```

### ❌ Delete Link
```
DELETE /api/links/:code
```

### 🔀 Redirect Handler
```
GET /:code → 302 redirect to target URL
```

## 🚀 Deployment Guide

### Backend Hosting Options
- Render (Web Service)
- Railway
- Fly.io
- Heroku (if available)

**Required environment variables:**
- `MONGO_URL`
- `BASE_URL`
- `PORT` (optional)

### Frontend Hosting
- Vercel (recommended)
- Netlify
- Render Static Site

## 🧪 Local Testing Commands

**Create short link:**
```bash
curl -X POST http://localhost:4000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"https://example.com\"}"
```

**Check redirect:**
```bash
curl -I http://localhost:4000/abc123
```

## 📄 License

This project is for educational and demonstration purposes.
