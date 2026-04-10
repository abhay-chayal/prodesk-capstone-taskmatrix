# 🚀 TaskMatrix – Capstone Project Blueprint

![TaskMatrix Banner](https://via.placeholder.com/1200x300?text=TaskMatrix+-+Enterprise+Project+Management)

TaskMatrix is a commercial-grade, scalable Project Management System patterned after industry leaders like Jira and Asana. This document outlines the architectural blueprint, product requirements, and system design for developing the application.

---

## ✅ PART 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1. Project Overview

**Problem Statement:**  
Modern software teams and agile startups frequently struggle with fragmented workflows. Existing enterprise tools are often excessively complex, slow, or prohibitively expensive, while simpler tools lack the robust reporting, role-based access, and real-time synchronization required for scaling teams.

**Target Users:**  
- Software Development Teams (Engineers, PMs, QA)
- Startup Founders & Operations teams
- Freelance Agencies managing multiple clients

**Real-world Use Case:**  
A remote software agency needs to track the development lifecycle of multiple client applications. They require a centralized platform where Product Managers can create deep project hierarchies, developers can seamlessly drag-and-drop tasks across custom kanban columns in real-time, and stakeholders are instantly notified of blocker resolutions automatically via WebSockets.

---

### 2. Features (Detailed)

#### 🔐 Authentication & Security
- **JWT-based Authentication:** Secure access token via HTTP-only cookies, with refresh token cycling.
- **Role-Based Access Control (RBAC):** Hierarchical permissions (Admin, Project Manager, Contributor, Viewer).
- **OAuth Integration:** Single Sign-On (SSO) via Google and GitHub.

#### 📊 Project Management
- **Project Workspaces:** Dedicated environments for specific products or clients.
- **Milestones & Epics:** Grouping tasks into larger sprint goals or feature epics.
- **Analytics Dashboards:** Overviews of project health, sprint burndown, and team velocity.

#### 📝 Task Management
- **Granular Task Control:** Rich-text descriptions, markdown support, due dates, priority labels (Low, Medium, High, Blocker).
- **Subtasks & Dependencies:** Breaking down complex tasks and setting functional blockers (e.g., "Task B cannot start until Task A is resolved").
- **Attachments:** Secure file and image uploads associated with tasks.

#### 📋 Kanban Board (Core Interaction)
- **Fluid Drag-and-Drop:** Built using `dnd-kit` for 60fps native feel.
- **State Logic & Optimistic UI Udpates:** When a user drags a task from "To Do" to "In Progress", the frontend instantly updates the UI optimistically, fires an API call to update the status in the DB, and emits a WebSocket event. If the API fails, the UI rolls back to the previous state.
- **Custom Workflows:** Allowing Project Managers to define custom board columns.

#### 🔔 Notifications & Activity Feed
- **Real-Time Push Alerts:** In-app toast notifications for @mentions or assigned tasks.
- **Immutable Audit Trail:** An activity log for every task (e.g., *"Alex moved task from Review to Done at 4:30 PM"*).

#### 💬 Team Collaboration
- **Inline Comments:** Threaded discussions embedded within individual task cards.
- **Live Presence Indicators:** Showing which team members are currently viewing a project or typing a comment.

---

### 3. Tech Stack Justification

| Technology | Justification |
| :--- | :--- |
| **Next.js (App Router)** | Provides Server-Side Rendering (SSR) for initial rapid page loads, top-tier SEO for public-facing boards, and built-in edge API routing capability. It is the enterprise standard for high-performance React. |
| **Tailwind CSS** | Facilitates highly maintainable, utility-first styling. Enables rapid creation of a cohesive, modern SaaS aesthetic (glassmorphism, skeleton loaders, customized dark modes) without bundle bloat. |
| **Node.js + Express.js** | Delivers an asynchronous, non-blocking backend capable of handling high concurrency (crucial for real-time collab and WebSocket handshakes). |
| **SQL (PostgreSQL)** | (For Core Relational Data) Enforces rigid schema architecture and ACID compliance. Perfect for managing complex join relationships inherent in Role-Based Access Control, Users, Projects, and nested Tasks. |
| **Zustand** | Lean, hook-based global state management. Chosen over Redux for its radically simpler mental model, minimal boilerplate, and excellent performance in managing complex localized states like drag-and-drop caching without massive re-renders. |
| **Socket.io** | Industry standard for fallback-resilient, bi-directional event-based communication. Essential for making the Kanban board instantly sync across multiple remote clients and managing live user presence. |

*(Note: While SQL represents our core relational data engine, modern applications often use polyglot persistence. We design the schema primarily focusing on a NoSQL document model (MongoDB) below to satisfy hyper-flexible, rapid-iteration document architectures commonly found in modern MERN-like stacks.)*

---

### 4. Folder Structure (Clean Architecture)

#### Frontend (Next.js Application)
```text
taskmatrix-client/
├── public/                 # Static assets (fonts, icons, un-hashed images)
├── src/
│   ├── app/                # Next.js 14 App Router (Pages, Layouts, API routes)
│   │   ├── (auth)/         # Auth group (login, register)
│   │   ├── dashboard/      # Protected dashboard routes
│   │   └── layout.tsx      # Root global layout & providers
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base level components (Button, Input, Modal)
│   │   └── features/       # Complex components (KanbanBoard, TaskCard)
│   ├── hooks/              # Custom React hooks (useAuth, useDragDrop)
│   ├── store/              # Zustand global state (taskStore.ts, userStore.ts)
│   ├── services/           # Axios interceptors, API service wrappers
│   ├── lib/                # Utility functions, Socket instance, constants
│   └── types/              # Global TypeScript interfaces
└── tailwind.config.ts      # Design tokens and theme settings
```

#### Backend (Node.js/Express MVC)
```text
taskmatrix-server/
├── src/
│   ├── config/             # DB initialization, environment vars
│   ├── controllers/        # Request handlers (authController, taskController)
│   ├── middlewares/        # JWT verification, Role checks, Error handlers
│   ├── models/             # Database Schemas (Mongoose/Prisma)
│   ├── routes/             # Express API path definitions
│   ├── sockets/            # Socket.io event listeners & emitters
│   ├── services/           # Heavy lifting business logic
│   └── utils/              # Loggers, payload formatters
├── server.ts               # Entry point, Express app mounting
└── package.json            
```

---

### 5. API Design

Below is an overview of the core RESTful APIs driving TaskMatrix.

#### Auth APIs
| Endpoint | Method | Request Body | Response Format |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | `{ email, password }` | `{ status: "success", token, user: { id, role, name } }` |
| `/api/v1/auth/refresh` | `GET` | *(Uses HTTP Only Cookie)* | `{ status: "success", token }` |

#### Project APIs
| Endpoint | Method | Request Body | Response Format |
| :--- | :--- | :--- | :--- |
| `/api/v1/projects` | `GET` | *None* | `{ projects: [ { id, name, memberCount } ] }` |
| `/api/v1/projects/:id` | `GET` | *None* | `{ id, name, description, columns: [] }` |
| `/api/v1/projects` | `POST` | `{ name, description }` | `{ status: "created", project: { ... } }` |

#### Task APIs
| Endpoint | Method | Request Body | Response Format |
| :--- | :--- | :--- | :--- |
| `/api/v1/tasks?projectId=XYZ`| `GET` | *None* | `{ tasks: [ { id, title, status, priority, assignee } ] }` |
| `/api/v1/tasks` | `POST` | `{ title, projectId, columnId, priority }` | `{ status: "created", task: { id, ... } }` |
| `/api/v1/tasks/:id/status` | `PATCH` | `{ newColumnId, orderIndex }` | `{ status: "success", updatedTask: { ... } }` |

---

## ✅ PART 2: UI/UX DESIGN PLAN (FIGMA GUIDE)

This section details the layout blueprints for UI/UX designers to translate directly into Figma wireframes and high-fidelity mockups.

**Global Design Tokens:**
- **Primary Color:** Electric Indigo (`#4F46E5`)
- **Background (Dark Mode):** Deep Slate (`#0F172A`)
- **Background (Light Mode):** Soft Whisper (`#F8FAFC`)
- **Typography:** *Inter* for body, *Outfit* for headings.

### Screen 1: Login Page
* **Layout Structure:** Split layout. Left 50% is a smooth gradient/abstract 3D illustration representing collaboration. Right 50% is the crisp, white authentication card vertically centered.
* **Components:** 
  - OAuth Social Login Buttons (Google, GitHub) with standard icons.
  - Floating label input fields for Email and Password.
  - Subtly glowing primary Submit Button.
* **UX Behavior:** Input fields highlighted with an Indigo border on focus. Button shows a spinning SVG loader upon click, disabling input temporarily.
<img width="1440" height="901" alt="TaskMatrix — Login" src="https://github.com/user-attachments/assets/3201fead-c2ab-400a-914c-99d18727b35f" />


### Screen 2: Dashboard Overview
* **Layout Structure:**
  - **Top Bar:** Search input, Context switcher (Workspaces), Notification Bell with red dot, User Avatar dropdown.
  - **Sidebar (Collapsible):** Navigation links (Home, My Tasks, Inbox, Reporting, Settings), list of active projects.
  - **Main Content:** Masonry grid layout of widgets.
* **Components:**
  - **Greeting Card:** "Good morning, Jane" with quick stats (3 tasks due today).
  - **Project Overview Cards:** Glassmorphic cards highlighting progress bars, active team member avatars overlapping (facepile).
* **UX Behavior:** Sidebar links have a smooth hover background transition (`transition-colors duration-200`). Hovering over the facepile expands avatars slightly.
<img width="1440" height="901" alt="TaskMatrix Dashboard" src="https://github.com/user-attachments/assets/d865d536-1909-467e-bff3-62e633a53895" />


### Screen 3: Kanban Board
* **Layout Structure:** Header with Project Title and "Filter/Sort" buttons. Horizontal scrollable container for Columns.
* **Components:**
  - **Columns:** Slightly darker semi-transparent background mapping to the board status (To Do, Doing, Review, Done).
  - **Task Cards:** White (or dark grey) elevated cards displaying a priority ribbon (red/orange/blue), task title, assignee avatar, and a subtask checklist progress indicator (e.g., *2/4*).
  - **"Add Task" Ghost Button:** Sticks to the bottom or top of each column.
* **UX Behavior:** 
  - **Hover:** Elevating the task card slightly (`hover:-translate-y-1 shadow-lg`).
  - **Drag-Drop:** Card tilts 3 degrees when picked up. Empty slot indicator outlines where the card will land. Column background highlights when hovered over with a card.
  <img width="1440" height="900" alt="Project Overview - Kanban Board" src="https://github.com/user-attachments/assets/776fd3b5-c305-483d-9af3-6350e130c9f6" />


---

## ✅ PART 3: DATABASE & SYSTEM ARCHITECTURE

While the original stack justification mentioned SQL, standardizing a deeply nested PM tool often heavily benefits from Document Stores. Below is an optimal MongoDB Document Architecture matching modern MERN-stack implementations.

### 1. MongoDB Schema Design

#### Collection: `Users`
*Stores identity and platform-wide configurations.*
* `_id` (ObjectId)
* `name` (String)
* `email` (String, Unique)
* `passwordHash` (String)
* `avatarUrl` (String)
* `role` (Enum: `SYSTEM_ADMIN`, `USER`)
* `createdAt` (Date)

#### Collection: `Projects`
*The core workspace container.*
* `_id` (ObjectId)
* `name` (String)
* `description` (String)
* `ownerId` (ObjectId → ref `Users`)
* `members` (Array of objects: `[{ userId: ObjectId, accessLevel: Enum }]`)
* `columns` (Array of objects: `[{ id: String, title: String, order: Number }]`) - *Enables custom board layouts*

#### Collection: `Tasks`
*Highly volatile data entity moved organically through the board.*
* `_id` (ObjectId)
* `projectId` (ObjectId → ref `Projects`)
* `columnId` (String) - *Matches the columns defined in the Project*
* `title` (String)
* `description` (String)
* `priority` (Enum: `LOW`, `MEDIUM`, `HIGH`, `URGENT`)
* `assigneeId` (ObjectId → ref `Users`, nullable)
* `order` (Number) - *Calculated floating point index for precise vertical drag-and-drop positioning*
* `subtasks` (Array of objects: `[{ title: String, isCompleted: Boolean }]`)

#### Collection: `ActivityLogs`
*Immutable ledger for analytics and auditing.*
* `_id` (ObjectId)
* `taskId` (ObjectId → ref `Tasks`)
* `projectId` (ObjectId → ref `Projects`)
* `actorId` (ObjectId → ref `Users`)
* `action` (String) - e.g., `STATUS_CHANGED`, `COMMENT_ADDED`
* `previousValue` (Mixed)
* `newValue` (Mixed)
* `timestamp` (Date, Indexed for sorting)

---

### 2. ERD Explanation (Entity Relationships)

* **Users <-> Projects (Many-to-Many):** A User can be a member of multiple Projects. A Project contains multiple Users in its `members` array. Mapped via embedding the `userId` in the `Projects.members` array.
* **Projects <-> Tasks (One-to-Many):** A single Project "owns" thousands of Tasks. Each Task directly references its parent via `projectId`.
* **Tasks <-> ActivityLogs (One-to-Many):** One Task generates dozens of log entries. The `ActivityLog` holds the `taskId` reference, ensuring the Tasks collection remains light and fast to query.
* **Users <-> Tasks (One-to-Many):** A User is referenced as the `assigneeId` on the Task.

---

### 3. System Architecture

**The Data Flow & Execution Model:**

1. **Client Request (Frontend):** The Next.js application initiates through either a Server Component for initial payload delivery (SEO friendly shell) or Client Components (React) for highly interactive zones like the Kanban Board.
2. **Authentication Flow:** User logs in. Express validates creds against MongoDB, signs a JWT, and sets an `HttpOnly`, `Secure` cookie. Subsequent requests carry this cookie to bypass XSS vectors. Edge middlewares in Next.js verify this token before routing a user to protected dashboard pages.
3. **Core API Interactions (REST):** The client makes standard REST calls to the Express application (e.g., fetching projects). Express controllers execute Mongoose queries, format the data via DTOs (Data Transfer Objects), and respond with JSON.
4. **Real-time Engine (Socket.io):**
   - When User A moves a task in the Board, a REST `PATCH` request updates the database `Tasks.columnId`.
   - On DB success, the Express controller triggers `socket.to(projectRoom).emit('task-moved', updateData)`.
   - User B, currently viewing the same project, receives the Socket event. The global `Zustand` store intercepts the payload and seamlessly shifts the task on User B's screen without a browser refresh.
5. **Database Interaction:** MongoDB scales horizontally to match heavy read-writes (common in task dragging), optimized with indexes on `projectId` and `columnId` for near-instant retrieval of columns.

---
*Blueprint Generated by the Architecture Design Team - Ready for Sprint Planning.*
