# Context-Aware AI Code Review Agent

> **Context-aware AI code review powered by your codebase, team standards, architectural invariants, and review history.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Acceptance%20Tests-12%2F12%20Passing-emerald.svg)](#acceptance-tests)

---

## 📌 Overview

Generic linters lack architectural awareness, and generic chat LLMs lack codebase context. **Context-Aware AI Code Review Agent** is a developer platform designed to review source code and pull requests against explicit team standards, 3-tier layering boundaries, security threat models, and historical review decisions.

The agent never forces false positives or hallucinates rules: if code is clean, it reports `No significant issues found`. When genuine issues are identified, findings provide concrete line references, evidence snippets, reasons, confidence ratings, and actionable recommendations.

---

## ✨ Key Features

### 1. Multi-Category Review Engine
Evaluates source code across 8 rigorous engineering dimensions:
* **Security & Vulnerabilities**: Detects SQL injection, hardcoded secrets, XSS/HTML injection, command injection, and stack trace leaks (CWE-209).
* **Architecture & Layering**: Enforces strict 3-tier boundaries (Controllers $\rightarrow$ Services $\rightarrow$ Repositories) and flags framework leakage.
* **Error Handling & Runtime Safety**: Flags unhandled exceptions, raw `JSON.parse` failures, division by zero, and empty catch blocks.
* **Logic & Correctness**: Catches assignment in conditionals (`if (x = 5)`), constant boolean branches, and unreachable return statements.
* **Syntax & Parsing**: Validates delimiter balancing (`{}`, `()`, `[]`) and language keyword spelling.
* **Performance**: Detects N+1 query loops and synchronous operations blocking event loops.
* **Maintainability & Testing**: Identifies excessive nesting depth ($\ge 4$ levels), duplicated helper code, and untested business services.

### 2. Interactive Code Workspace
* **Real-time In-Memory Editing**: Reviews active code as you type, including unsaved changes.
* **Click-to-Code Navigation**: Clicking `[View Code]` on any finding smoothly scrolls the editor to the exact line with visual highlight.
* **Inline Severity Indicators**: Non-destructive annotations directly below affected lines (`└── HIGH: Missing input validation`).
* **Re-Review Delta Tracking**: Compares previous vs. current reviews (`Resolved: X · Remaining: Y · New: Z`).

### 3. Living Team Memory & Feedback
* **Developer Feedback Loop**: Developers can `Accept`, `Reject`, `Ignore`, `Modify`, `Not Applicable`, or `Mark as Fixed`.
* **Zero False-Positive Repeat**: Rejected rules with documented explanations are remembered in Team Memory and suppressed in future reviews.

### 4. Full Web Application Shell
* **Landing Page**: Developer-focused hero, value proposition, and key benefits.
* **Mock Authentication**: Quick 1-click login and signup flows.
* **Developer Dashboard**: High-level metrics (Repositories, Open PRs, Total Reviews, Issues Caught, Critical Issues) and recent activity stream.
* **Repositories & Pull Requests**: Microservice directory and PR review list with branch, author, and diff statistics.
* **Knowledge Base Explorer**: 6 searchable tabs inspecting Security Rules, Architecture Rules, Coding Standards, Project Patterns, Exceptions, and Review History.
* **Workspace Settings**: Customizable default languages, minimum severity thresholds, and category toggles.
* **Phase 1 Diagnostic Studio**: Embedded test runner executing all 12 acceptance test suites with sub-millisecond benchmarking.

---

## 🏗️ Architecture & Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
* **Build & Dev Server**: Vite 8, Express, tsx
* **Core Agent Modules**:
  * `ReviewEngine`: Evaluates changed files against active knowledge datasets.
  * `WorkspaceReviewAdapter`: Bridges editor state to review pipeline.
  * `KnowledgeRepository`: 8 structured datasets (Security, Architecture, Standards, Patterns, Exceptions, etc.).
  * `TeamMemoryStore` & `FeedbackProcessor`: Ingests developer decisions and rule promotions.
  * `AgentTestRunner`: 12 acceptance test cases verifying deterministic review outcomes.

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-code-review-agent.git

# Navigate into the project directory
cd ai-code-review-agent

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:3000`.

### Running Acceptance Tests

```bash
# Run the 12 acceptance test suites
npx tsx -e "import('./src/agent/test-cases/testRunner.ts').then(m => { const r = m.AgentTestRunner.runAll(); console.log('Passed:', r.passedCount, 'Failed:', r.failedCount); })"
```

---

## 📂 Project Structure

```text
src/
├── agent/                      # Core Review Agent & Knowledge Engine
│   ├── knowledge/              # 8 Knowledge datasets (Security, Architecture, etc.)
│   ├── models/                 # Finding schema, severity, category, confidence models
│   ├── review/                 # ReviewEngine evaluation algorithms
│   ├── feedback/               # Developer feedback processor & Team Memory
│   └── test-cases/             # 12 acceptance test cases & test runner
├── components/
│   ├── layout/                 # Global AppNavbar, Footer, AppLayout
│   ├── pages/                  # Landing, Login, Dashboard, Repos, PRs, CodeReview, Knowledge, Settings, Studio
│   └── workspace/              # CodeEditor, FileExplorer, ReviewPanel, Toolbar
├── mock/                       # Centralized mock repositories, PRs, and metrics
├── context/                    # AuthContext session management
└── router/                     # Client-side router & route definitions
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
