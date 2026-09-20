# ⚡ Groq AI API Server

A lightweight, high-performance Node.js (Express) API server that wraps the official [Groq AI SDK](https://github.com/groq/groq-sdk-js). Designed for easy local development and seamless 1-click deployment on [Render](https://render.com).

---

## 🚀 Features

- **Groq AI Integration**: Powered by Groq's fast LLM inference (`llama-3.3-70b-versatile`, `llama3-8b-8192`, etc.).
- **Flexible Request Formats**: Supports simple `{ "prompt": "..." }` or OpenAI-compatible `{ "messages": [...] }`.
- **Render Ready**: Built-in `render.yaml` blueprint and `/health` check route for easy Render deployment.
- **CORS Enabled**: Out of the box support for frontend applications (React, Next.js, Vue, mobile apps).

---

## 🛠️ Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=3000
```
> 🔑 Get your API key from the [Groq Console](https://console.groq.com).

### 3. Run the Server
```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```

The server will run on `http://localhost:3000`.

---

## 📡 API Usage & Endpoints

### 1. Health Check (`GET /health` or `GET /`)
**Response:**
```json
{
  "status": "ok",
  "service": "Groq AI Server",
  "version": "1.0.0",
  "defaultModel": "llama-3.3-70b-versatile",
  "hasApiKey": true
}
```

---

### 2. Generate Completion (`POST /api/generate` or `POST /api/chat` or `POST /`)

#### Option A: Simple Prompt
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing in 2 simple sentences.",
    "systemPrompt": "You are a friendly physics teacher."
  }'
```

#### Option B: Chat Messages Array
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "What is the capital of France?" }
    ],
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.7
  }'
```

#### Request Body Parameters:
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `prompt` | `string` | Yes (or `messages`) | - | Simple user prompt text |
| `messages` | `array` | Yes (or `prompt`) | - | OpenAI format: `[{ role: "user", content: "..." }]` |
| `systemPrompt` | `string` | No | - | Optional system instructions |
| `model` | `string` | No | `llama-3.3-70b-versatile` | Groq model name |
| `temperature` | `number` | No | `0.7` | Sampling temperature (0.0 to 2.0) |
| `maxTokens` | `number` | No | - | Maximum response tokens |

#### Sample Response:
```json
{
  "response": "Quantum computing is a type of computation that uses quantum bits (qubits)..."
}
```

---

## 🌐 Deploying to Render.com

### Step 1: Push Code to GitHub
Create a new GitHub repository and push your project:
```bash
git init
git add .
git commit -m "Initial commit - Groq server"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/groq-server.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`groq-server`).
4. Render will auto-detect Node.js settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GROQ_API_KEY`: `gsk_...` (Your Groq API Key)
6. Click **Create Web Service**.

Once deployed, Render will provide a live public URL (e.g., `https://groq-server-xxxx.onrender.com`). You can send POST requests directly to `https://groq-server-xxxx.onrender.com/api/generate`!
