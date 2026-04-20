# Learnbro Frontend

Pixel-perfect Next.js 15+ frontend for the **Learnbro** learning platform. Integrates deeply with the backend for AI-driven lesson generation, knowledge graphs, markdown notes, and gamification.

---

## 🚀 Core Features

- **Authentication:** JWT & OAuth2 (Google, GitHub)
- **Lesson Builder:** AI-powered lesson generation with external sources, file upload, and custom objectives
- **Notes:** Markdown editor, folder tree, and knowledge graph visualization
- **Coding:** Monaco-based code editor, real-time code execution via WebSocket
- **Gamification:** XP, streaks, and spaced-repetition flashcards
- **Notifications:** Push notifications for reviews and reminders

## 🛠 Tech Stack

| Component     | Technology                        |
| :------------ | :-------------------------------- |
| **Framework** | Next.js 15+, React 19, TypeScript |
| **Styling**   | Tailwind CSS (pixel font), Geist  |
| **State**     | Zustand, TanStack Query           |
| **Editor**    | Monaco Editor                     |
| **API**       | OpenAPI client, REST, WebSocket   |

## 🏗️ Folder Structure

```
Frontend/
├── app/                # Main app directory (Next.js app router)
│   ├── _components/    # UI components
│   ├── _data/          # Data loaders
│   ├── api/            # API route handlers
│   └── ...
├── hooks/              # React hooks
├── lib/                # API clients, config
├── public/             # Static assets
├── scripts/            # Utility scripts (e.g. OpenAPI sync)
├── types/              # TypeScript types (OpenAPI, domain)
├── ...
```

## ⚡ Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   # or yarn install / npm install
   ```

2. **Sync OpenAPI types:**

   ```bash
   pnpm api:sync
   ```

3. **Run development server:**

   ```bash
   pnpm dev
   # or yarn dev / npm run dev
   ```

4. **Open:** [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

To build and run the frontend container:

```bash
docker compose -f Frontend/docker-compose.yml up --build
```

## 🔗 API Integration

- All API endpoints are documented in [FRONTEND_API_ENDPOINTS_GUIDE.md](FRONTEND_API_ENDPOINTS_GUIDE.md)
- Backend base URL (dev): `http://localhost:8000`
- Most endpoints require `Authorization: Bearer <token>`
- Lesson generation, file upload, and markdown ingestion use `multipart/form-data`

## 🧩 Key Features

- **Lesson Builder:**
  - Supports all backend-required fields: prompt, topic, subject, subtopics, objectives, level, style, pace, daily study time, quiz settings, mindmap, coding, answer key, external sources, file upload
  - Pixel-perfect UI with Tailwind CSS
- **Notes & Knowledge Graph:**
  - Markdown editor, folder tree, Neo4j graph visualization
- **Coding:**
  - Monaco editor, real-time Judge0 execution, gamification hooks
- **Notifications:**
  - Push API integration, Celery/Redis backend

## 🧪 Testing & Linting

```bash
pnpm lint
# or yarn lint / npm run lint
```

## 📦 Build & Deploy

```bash
pnpm build
pnpm start
# or yarn build/start / npm run build/start
```

Deploy easily on [Vercel](https://vercel.com/) or any Node.js hosting.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

> See [FRONTEND_API_ENDPOINTS_GUIDE.md](FRONTEND_API_ENDPOINTS_GUIDE.md) for full API usage and integration details.
