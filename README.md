<div align="center">

  
  # OpenKB
  
  **Next-Gen AI Agent Platform**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.0-61dafb)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)

  [View Repo](https://github.com/stephenkyaw/OpenKB)
</div>

---

## 📖 Introduction

**OpenKB** is a modern, premium interface for designing, configuring, and deploying intelligent AI Agents. Built with a focus on aesthetics and usability, it features a "Glassmorphic" design system and a powerful node-based workflow editor.

## ✨ Key Features

### � Intelligent Agent Orchestration
- **Visual Workflow Editor**: Drag-and-drop interface to design agent logic (Triggers -> Brain -> Actions).
- **Custom Personas**: detailed configuration for Agent Role, Description, and System Instructions.
- **Multi-Model Support**: Switch between advanced LLMs (Gemini, GPT-4o) per agent.
- **Tool Integration**: Seamlessly connect to Google Drive, Email, and Document Writers.

### 💎 Premium UX/UI Design
- **Unified Glass System**: A consistent, high-end "Glassmorphism" aesthetic across the entire app.
- **Fluid Interactions**: Micro-interactions, hover states, and smooth transitions.
- **Adaptive Layouts**: Responsive Grid and List views for managing large libraries of agents.
- **Direct Chat**: Integrated chat interface with rich message bubbling and streaming responses.

### 📚 Knowledge Management (RAG)
- **Asset Library**: Centralized table view for uploaded documents and text assets.
- **Smart Indexing**: (Planned) Automatic vectorization of knowledge assets for Agent context.

---

## 🏗️ Architecture Guide

OpenKB is built as a Single Page Application (SPA) using modern web technologies.

### Technology Stack
- **Frontend Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: 
  - [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
  - Custom `Glass` utility classes for backdrop-blur and transparency.
  - [Lucide React](https://lucide.dev/) for consistent iconography.
- **Routing**: React Router DOM
- **State Management**: React Context API (Provider Pattern)

### Project Structure
```
� openkb
├── 📂 src
│   ├── 📂 components    # Shared UI atomic components (Button, Card, Modal)
│   ├── 📂 features      # Feature-specific logic (Agents, Chat, Knowledge)
│   │   └── 📂 agents    # Agent Workflow Editor & Graph Logic
│   ├── 📂 pages         # Route-level Page views (AgentsPage, SettingsPage)
│   ├── � hooks         # Custom React hooks (useTheme, useAgent)
│   ├── 📂 types         # Shared TypeScript interfaces
│   └── 📂 utils         # Helper functions
```

### Core Concepts
1.  **Nodes & Edges**: The workflow editor uses a custom graph implementation where `Nodes` (Triggers, Brains, Tools) are connected by `Edges`. State is managed via the `AgentWorkflowEditor` component.
2.  **Glass Theme**: The application uses a global background wrapper with localized `backdrop-blur` overlays to create depth hierarchy (Background -> Card -> Floating Panel).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/stephenkyaw/OpenKB.git
   cd OpenKB
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run Locally**
   Start the development server:
   ```bash
   npm run dev
   ```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
