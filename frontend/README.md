# ResumeLetterAI - Frontend

![Vercel Deployment](https://therealsujitk-vercel-badge.vercel.app/?app=resumeletterai-frontend)

<!-- Replace with your actual Vercel deployment badge URL -->

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This directory contains the frontend application for **ResumeLetterAI**, an
intelligent, AI-powered resume and cover letter builder. It is a modern,
enterprise-grade web application built with Next.js 15 and React.

---

## 🚀 Overview

The frontend is engineered following a **Feature-Sliced Design (FSD)**
architecture, complemented by an **Atomic Design** system for UI components.
This approach ensures a highly modular, scalable, and maintainable codebase.

- **Live URL:** `[Production URL]`
- **Staging URL:** `[Staging URL]`
- **Storybook:** `[Link to deployed Storybook instance]`

## ✨ Core Technologies

- **Framework:** [Next.js](https://nextjs.org/) 15 (with App Router)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) built on
  [Radix UI](https://www.radix-ui.com/) for accessibility
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:**
  - **Global State:** [Zustand](https://zustand-demo.pmnd.rs/)
  - **Form State:** [React Hook Form](https://react-hook-form.com/) +
    [Zod](https://zod.dev/)
  - **Server Cache State:**
    [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Testing:**
  - **E2E:** [Cypress](https://www.cypress.io/)
  - **Unit/Integration:** [Jest](https://jestjs.io/) +
    [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Linting & Formatting:** ESLint & Prettier
- **Component Development:** [Storybook](https://storybook.js.org/) for isolated
  UI component development.

## 📦 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation & Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Copy the example environment file:

    ```bash
    cp .env.example .env.local
    ```

    - Fill in the required variables in `.env.local`.

### Running the Development Server

To start the local development server, run:

```bash
npm run dev
```
