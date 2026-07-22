# AI Consensus Checker

AI Consensus Checker is a hackathon-ready architecture scaffold for a full-stack application that will eventually allow users to ask one question, gather responses from multiple free AI models, compare them, and determine a consensus answer.

## Project Structure

```text
AI-Consensus-Checker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── assets/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── types/
│   │   ├── interfaces/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   └── .env.example
└── README.md
```

## Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Development Commands

### Frontend

- `npm run dev` — start Vite dev server
- `npm run build` — create a production build
- `npm run lint` — lint the frontend codebase

### Backend

- `npm run dev` — start development server with ts-node-dev
- `npm run build` — compile TypeScript to dist
- `npm run start` — run the compiled server

## Notes

- No AI APIs are integrated yet.
- No business logic is implemented yet.
- Only architecture and placeholder UI are included.
