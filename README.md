# Personal Calorie Tracker

A full-stack personal calorie tracking application for recording food intake, setting nutritional goals, tracking weight, and analyzing nutrition over time.

This project is being developed as part of a **Software Engineer interview assignment**, with a focus on clean architecture, API-driven development, data integrity, validation, authentication, maintainability, and extensibility.

The application is developed incrementally, with each major stage kept in a working state before moving to the next feature.

---

# Project Status

**Current stage: Stage 6 — AI Nutrition Extraction**

The core backend and frontend application are currently implemented.

The following are currently implemented:

- PostgreSQL database
- Docker Compose development environment
- Prisma ORM and migrations
- Database constraints and indexes
- Environment configuration and validation
- Centralized error handling
- Request validation using Zod
- User registration and login
- JWT access-token authentication
- Refresh-token authentication
- Refresh-token rotation
- Refresh-token revocation
- Secure refresh-token hashing
- Argon2id password hashing
- Protected, user-owned APIs
- Complete Food Entry CRUD
- Food Entry pagination
- Food Entry date-range filtering
- Food Entry meal-type filtering
- Micronutrient support
- Canonical nutrient seed data
- Canonical nutrient API
- Timezone-aware date filtering
- Response mapping/DTO layer
- Goal CRUD
- Effective goal periods
- Goal period overlap protection
- Goal pagination
- Weight Log CRUD
- Weight Log pagination
- Weight Log date/time filtering
- User ownership enforcement
- Calorie reports
- Daily macro reports
- Daily micronutrient reports
- Goal vs actual daily comparisons
- Timezone-aware report date handling
- React frontend
- Vite frontend setup
- Tailwind CSS
- shadcn/ui components
- React Router
- Frontend authentication flow
- Protected frontend routes
- Automatic access-token refresh
- Food Entry creation UI
- Food Entry editing UI
- Food Entry history UI
- Food Entry deletion
- Food Entry pagination UI
- Food Entry filtering UI
- Goal management UI
- Weight tracking UI
- Weight history pagination UI
- Weight chart
- Dashboard
- Calorie summary
- Macro summary
- Recent food entries
- Latest weight summary
- Calorie trend chart
- Reports dashboard
- Calorie trend chart
- Macro breakdown chart
- Micronutrient report
- Goal vs actual report

The following major features remain:

- AI-powered nutrition extraction
- Optional bonus features
- Final UI polish and refinement

---

# Assignment Requirements

The application is intended to support:

## Goal Setting

Users should be able to define:

- Daily calorie targets
- Protein targets
- Carbohydrate targets
- Fat targets
- Weight goals

---

## Meal Tracking

Users can record consumed food with:

- Food name
- Quantity
- Quantity unit
- Calories
- Protein
- Carbohydrates
- Fat
- Micronutrients
- Meal type
- Time consumed

Food entries can be filtered by:

- Date/time range
- Meal type

List APIs support pagination.

---

## Reports & Analytics

The application provides:

- Daily calorie intake data
- Calorie trends
- Daily macro breakdowns
- Daily micronutrient summaries
- Goal vs actual nutrition comparisons

The frontend visualizes these reports using charts and summary components.

---

## AI Nutrition Extraction

The application is intended to support extracting nutritional information from:

- Nutrition-label images
- Food/plate images

The extracted information can then be used to pre-fill Food Entry data.

The current Food Entry model already supports distinguishing manually entered data from AI-generated data.

---

## Architecture

The frontend communicates with the backend exclusively through APIs.

The frontend does not access the database directly.

All user data is persisted in PostgreSQL.

---

## Required Engineering Considerations

The assignment emphasizes:

- Clean code
- Modular architecture
- Validation
- Error handling
- Pagination for list APIs
- Maintainability
- Clear documentation
- Data ownership and isolation
- Database integrity
- Extensibility

---

# Technology Stack

## Backend

- Node.js
- Express 5
- JavaScript
- ES Modules
- Zod
- Prisma ORM
- PostgreSQL
- JWT
- Argon2id

## Frontend

- React
- Vite
- JavaScript
- React Router
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Recharts
- date-fns
- lucide-react
- sonner

## Database

- PostgreSQL 16
- Prisma Migrate

## Infrastructure

- Docker
- Docker Compose

---

# Architecture

The application follows an API-first architecture.

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ HTTP / REST API
                               ↓
                    ┌──────────────────────┐
                    │       Express        │
                    │       Routes         │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │     Middleware       │
                    │ Auth / Validation    │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │     Controllers      │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │      Services        │
                    │   Business Logic     │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │       Prisma         │
                    └──────────┬───────────┘
                               │
                               ↓
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    └──────────────────────┘