# JanSewa India Civic Portal 🇮🇳

**JanSewa** is India's unified citizen grievance redressal platform. Designed in accordance with national Swachh Survekshan and Smart City directives, it bridges the gap between citizens and municipal administrations across India, enabling rapid resolution of municipal defects.

---

## 🌟 Core Features

- **Grievance Dispatch System**: Submit reports on local issues (potholes, uncollected garbage, water leaks, broken streetlights) with real-time status tracking.
- **Dynamic Search & Filtration**: A powerful, keyword-matching status tracker utilizing automatic text highlighting and filtering (by status and filing dates) to easily locate grievances.
- **Unified FAQ & Helper Directory**: Interactive, category-filtered FAQ system with highlightable keywords, quick-pill suggestions, and a dynamic "Need Direct Helpline?" emergency contact dashboard.
- **Administrative Transparency**: Explicit 4-step reporting workflow accompanied by transparent Service Level Agreement (SLA) timers and an interactive complaint lifecycle visual stepper.
- **Democracy & Escalate Escrow**: Allow neighboring citizens to "upvote" urgent grievances to elevate administrative priority automatically.

---

## 🛠️ Technology Stack

- **Framework**: React 18+ with Vite & TypeScript
- **Styling**: Tailwind CSS (with clean utility configurations, custom themes, and full responsive layout support)
- **Icons**: Lucide React
- **Animations**: Motion (framer-motion)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (version 18 or higher) and npm installed.

### Installation

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
   The local preview will be served on port `3000`.

### Production Build

Build the production-ready assets:
```bash
npm run build
```

---

## 📂 Project Structure

- `src/pages/`: Page routing templates, including `TrackStatus.tsx` and `HelpFAQ.tsx`.
- `src/faqs/faqsData.ts`: Centralized directory for FAQ items and dynamic schemas.
- `src/lib/storage.ts`: Secure client-side state engine for grievance records and local persistence parameters.
- `src/components/`: Modular design patterns and navigation wrappers.
