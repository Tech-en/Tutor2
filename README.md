# TutorHub

[![Coverage](https://img.shields.io/badge/coverage-no%20tests-lightgrey.svg)](tutorhub-backend/coverage)
[![CI](https://github.com/Tech-en/Tutor2/actions/workflows/ci.yml/badge.svg)](https://github.com/Tech-en/Tutor2/actions/workflows/ci.yml)
[![CI (v1.0.0)](https://github.com/Tech-en/Tutor2/actions/workflows/ci.yml/badge.svg?branch=v1.0.0)](https://github.com/Tech-en/Tutor2/actions/workflows/ci.yml?query=branch%3Av1.0.0)
[![Latest Release](https://img.shields.io/github/v/release/Tech-en/Tutor2.svg)](https://github.com/Tech-en/Tutor2/releases/latest)
[![Package Version](https://img.shields.io/github/package-json/v/Tech-en/Tutor2?filename=tutorhub-backend%2Fpackage.json)](tutorhub-backend/package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Open Issues](https://img.shields.io/github/issues/Tech-en/Tutor2.svg)](https://github.com/Tech-en/Tutor2/issues)
[![Stars](https://img.shields.io/github/stars/Tech-en/Tutor2.svg)](https://github.com/Tech-en/Tutor2/stargazers)
[![Forks](https://img.shields.io/github/forks/Tech-en/Tutor2.svg)](https://github.com/Tech-en/Tutor2/network/members)

A tutoring platform with a Node.js/Express/MongoDB backend and a static HTML/JS frontend.

```
TutorHub/
├── tutorhub-backend/    # REST API (Express, MongoDB, Stripe, Socket.IO)
└── tutorhub-frontend/   # Static dashboard/login/register pages
```

See [tutorhub-backend/README.md](tutorhub-backend/README.md) and
[tutorhub-frontend/README.md](tutorhub-frontend/README.md) for full details. Quick start below.

## Prerequisites

- Node.js v16+
- MongoDB v5+ (local, or a MongoDB Atlas connection string)
- npm

## 1. Backend

```bash
cd tutorhub-backend
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, STRIPE keys, SMTP creds, etc.
npm run dev             # nodemon, auto-restarts on changes
# or: npm start
```

Make sure MongoDB is running (`mongod`) or that `MONGO_URI` in `.env` points to an Atlas cluster.

The API listens on `http://localhost:5000` by default (`PORT` in `.env`).

## 2. Frontend

The frontend is static HTML/JS — no build step. Serve it from its own folder so it doesn't
get mixed up with the backend:

```bash
cd tutorhub-frontend
npx http-server . -p 3000
# or: python3 -m http.server 3000
```

Then open `http://localhost:3000/login.html` (or `dashboard.html`).

The frontend calls the backend at whatever `CLIENT_URL`/API base is configured in
`tutorhub-frontend/js/apiService.js` — make sure it matches where the backend is running
(`http://localhost:5000` by default).

## Notes

- `.env` is gitignored — never commit real credentials. Use `.env.example` as the template.
- Backend tests: `cd tutorhub-backend && npm test`
