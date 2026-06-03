<p align="center">
  <h1 align="center">🏍️ MotoRescue.ID</h1>
  <p align="center"><strong>Rescue, Repair, Relax</strong></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.11+-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11+"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

---

## 📖 About

**MotoRescue.ID** is a mobile-web-based roadside assistance platform for motorcyclists in Indonesia. It connects stranded riders with nearby mechanics through an intuitive interface featuring real-time GPS tracking, AI-powered damage triage, and transparent price estimation — all accessible from any smartphone browser.

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| **Backend**  | Python 3.11, FastAPI, Uvicorn       |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript     |
| **AI**       | OpenRouter API (LLM-powered triage) |
| **Maps**     | Leaflet.js + OpenStreetMap          |
| **Container**| Docker, Docker Compose              |

---

## 🚀 Quick Start (Docker)

> **Prerequisites:** [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/motorescue-id.git
cd motorescue-id
```

### 2. Configure environment (optional)

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

> **Note:** The app works without an API key — AI features will use mock/fallback responses.

### 3. Build and run

```bash
docker-compose up --build
```

### 4. Open in browser

Navigate to **[http://localhost:8000](http://localhost:8000)** and enjoy! 🎉

> 💡 **Tip:** For the best experience, open Chrome DevTools (`F12`) → Toggle Device Toolbar (`Ctrl+Shift+M`) → select a mobile device.

---

## 💻 Manual Run (Without Docker)

### 1. Install Python

Ensure you have **Python 3.11+** installed. [Download here](https://www.python.org/downloads/).

### 2. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Set environment variable (optional)

```bash
# Linux/macOS
export OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxx

# Windows (PowerShell)
$env:OPENROUTER_API_KEY="sk-or-xxxxxxxxxxxxxxxxxxxxxxxx"
```

### 4. Start the server

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🔐 Environment Variables

| Variable             | Required | Default | Description                                      |
|----------------------|----------|---------|--------------------------------------------------|
| `OPENROUTER_API_KEY` | No       | —       | API key for OpenRouter LLM (AI triage & pricing) |

---

## ✨ Features

- 🗺️ **Interactive Map Dashboard** — Locate nearby mechanics with real-time GPS via Leaflet.js & OpenStreetMap
- 🤖 **AI-Powered Triage** — Describe your issue and get intelligent damage assessment & repair estimates
- 💰 **Transparent Pricing** — AI-generated cost breakdowns before you confirm a service request
- 📍 **Real-Time Tracking** — Watch your assigned mechanic approach on a live-updating map
- 📱 **Mobile-First UI** — Designed for smartphone browsers with a native-app feel
- 🐳 **One-Command Deploy** — Fully containerized with Docker for instant setup

---

## 📁 Project Structure

```
motorescue-id/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── requirements.txt     # Python dependencies
│   ├── routers/             # API route modules
│   │   ├── ai.py            # AI triage & pricing endpoints
│   │   ├── mechanics.py     # Mechanic data endpoints
│   │   └── tracking.py      # Live tracking endpoints
│   └── services/            # Business logic
│       ├── ai_service.py    # OpenRouter API integration
│       └── mock_data.py     # Simulated mechanics & data
├── frontend/
│   ├── index.html           # Main SPA entry point
│   ├── css/
│   │   └── styles.css       # Global styles & mobile UI
│   └── js/
│       ├── app.js           # Core application logic
│       ├── map.js           # Leaflet map integration
│       ├── triage.js        # AI triage flow
│       └── tracking.js      # Real-time tracking UI
├── Dockerfile               # Container image definition
├── docker-compose.yml       # Multi-service orchestration
├── .env                     # Environment variables (create manually)
└── README.md                # You are here!
```

---

## 📸 Screenshots

> _Screenshots coming soon — run the app to see it in action!_

<!-- 
![Dashboard](docs/screenshots/dashboard.png)
![AI Triage](docs/screenshots/triage.png)
![Live Tracking](docs/screenshots/tracking.png)
-->

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 MotoRescue.ID

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Made with ❤️ for Indonesian riders<br/>
  <strong>MotoRescue.ID</strong> — Rescue, Repair, Relax
</p>
