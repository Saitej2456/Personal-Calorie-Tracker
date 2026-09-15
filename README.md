# Personal Calorie Tracker

A full-stack personal calorie tracking application for recording food intake, setting nutritional goals, tracking weight, and analyzing nutrition over time.

This project is being developed as part of a **Software Engineer interview assignment**, with a focus on clean architecture, API-driven development, data integrity, validation, authentication, maintainability, and extensibility.

The application is developed incrementally, with each major stage kept in a working state before moving to the next feature.

---

# Project Status

**Current stage: Stage 7 — Advanced Features (Completed)**

All core features, including AI-powered nutrition extraction, a Conversational AI Assistant, and Bulk CSV Import, are fully implemented and working.

## Implemented

### Backend

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
- Secure refresh-token hashing (SHA-256, raw token never stored)
- Argon2id password hashing
- Protected, user-owned APIs
- Complete Food Entry CRUD
- Food Entry pagination
- Food Entry date-range filtering
- Food Entry meal-type filtering
- Micronutrient support (normalized relational model)
- Canonical nutrient seed data
- Canonical nutrient API (`GET /api/v1/nutrients`)
- Timezone-aware date filtering (IANA timezone per user)
- Response mapping/DTO layer
- Goal CRUD
- Effective goal periods with half-open interval semantics
- Goal period overlap protection (PostgreSQL exclusion constraint)
- Goal pagination
- Weight Log CRUD
- Weight Log pagination
- Weight Log date/time filtering
- User ownership enforcement (ownership failure returns 404)
- Calorie reports (`GET /api/v1/reports/calories`)
- Daily macro reports (`GET /api/v1/reports/macros`)
- Daily micronutrient reports (`GET /api/v1/reports/micronutrients`)
- Goal vs actual daily comparisons (`GET /api/v1/reports/goal-comparison`)
- Timezone-aware report date handling
- **AI nutrition extraction (`POST /api/v1/ai/extract-nutrition`)**
- **Conversational LLM Interface (`POST /api/v1/ai/chat`) with Gemini Function Calling (Tools)**
- **Gemini vision model integration (gemini-3.6-flash)**
- **AI confidence score tracking per food entry**
- **MANUAL vs AI_IMAGE source invariant enforcement**
- **Bulk CSV Import endpoint with transactional save (`POST /api/v1/food-entries/bulk`)**

### Frontend

- React + Vite + Tailwind CSS setup
- shadcn/ui components
- React Router with protected and public-only routes
- **User registration page with auto-detected IANA timezone**
- **Smart home route (`/`) — redirects to dashboard if authenticated, register if not**
- **Public-only route guard (prevents logged-in users from accessing login/register)**
- Frontend authentication flow (login, register, logout)
- Automatic access-token refresh with shared refresh promise
- 401 retry with single refresh attempt (no infinite loops)
- Food Entry creation UI
- **AI image scanner on food entry creation (drag-and-drop or click-to-upload)**
- **Image preview with analyze button and confidence badge**
- **Form pre-fill from AI extraction results**
- Food Entry editing UI
- Food Entry history UI
- Food Entry deletion
- Food Entry pagination UI
- Food Entry filtering UI (date range + meal type)
- Goal management UI (create, edit, delete, history)
- Weight tracking UI (create, edit, delete, history)
- Weight history pagination UI
- Weight chart (historical, no projected trends)
- Dashboard with calorie summary, macro summary, recent entries, weight, trend chart
- Reports dashboard
- Calorie trend chart (7/14/30 day)
- Macro breakdown chart
- Micronutrient summary table
- Goal vs actual progress bars
- **Conversational LLM Widget (Floating chat interface to log food and ask questions)**
- **Bulk CSV Import Modal (Client-side PapaParse validation & review before saving)**

## Remaining

- Final UI polish and refinement

---

# Assignment Requirements

## Goal Setting

Users can define:

- Daily calorie targets
- Protein targets
- Carbohydrate targets
- Fat targets
- Weight goals

Goals support effective date ranges with overlap protection. Only one goal can be active for a given date per user.

---

## Meal Tracking

Users can record consumed food with:

- Food name
- Quantity and unit (gram, milliliter, piece, serving)
- Calories
- Protein, carbohydrates, fat
- Micronutrients (vitamins and minerals — optional, normalized model)
- Meal type (breakfast, lunch, dinner, snack)
- Time consumed
- Data source (manual or AI-extracted)

Food entries can be filtered by:

- Date/time range
- Meal type

All list APIs are paginated.

---

## Reports & Analytics

The application provides dynamically computed reports (no persisted report table):

- Daily calorie intake data
- Calorie trends over a date range
- Daily macro breakdowns
- Daily micronutrient summaries
- Goal vs actual nutrition comparisons for a specific date

Reports are timezone-aware. Missing days are filled with zero values for calorie and macro reports. Micronutrient reports omit days with no data (unknown ≠ zero).

The frontend visualizes reports using Recharts with 7/14/30-day range selectors.

---

## AI Nutrition Extraction

The application supports extracting nutritional information from:

- Nutrition-label images
- Food/plate photographs

### How it works

1. User uploads an image on the food entry creation page (drag-and-drop or file picker, up to 4 MB)
2. The image is base64-encoded in the browser and sent to `POST /api/v1/ai/extract-nutrition`
3. The backend passes the image to **Google Gemini** (gemini-3.6-flash vision model) with a structured JSON prompt
4. Gemini returns extracted nutrition data with a confidence score
5. The backend validates and normalises the response
6. The frontend pre-fills the food entry form with the extracted values
7. The user reviews and edits the data before saving
8. The saved food entry records `source = AI_IMAGE` and `aiConfidence` (0–1)

The existing FoodEntry model supports the `source` and `aiConfidence` fields natively. Entries with `source = MANUAL` must have `aiConfidence = null`. This invariant is enforced at both the API validation layer and the service layer.

---

## Architecture

The frontend communicates with the backend exclusively through REST APIs. The frontend does not access the database directly. All user data is persisted in PostgreSQL.

### Backend request lifecycle

```text
Route → Middleware (Auth / Validation) → Controller → Service → Prisma → PostgreSQL
```

There is intentionally no repository layer. Abstractions are introduced only when justified by actual requirements.

### Data design decisions

- No separate Meal table — a FoodEntry represents one individual food item
- No Food catalog — nutrition values are stored per entry for the actual consumed quantity
- No persisted Report table — reports are dynamically aggregated from FoodEntries
- No speculative AI entity — AI extraction reuses the existing FoodEntry model via source/aiConfidence fields
- Goal periods use half-open intervals `[effectiveFrom, effectiveTo)` enforced at the database level
- Timestamps are stored as `TIMESTAMPTZ` (instants); date filters are interpreted in the user's IANA timezone
- Micronutrient absence means unknown/not-recorded, not zero

---

# Technology Stack

## Backend

- Node.js
- Express 5
- JavaScript (ES Modules)
- Zod (request validation)
- Prisma 7 ORM (PostgreSQL adapter)
- PostgreSQL 16
- JWT (access + refresh tokens)
- Argon2id (password hashing)
- @google/genai (Gemini vision AI)

## Frontend

- React 19
- Vite
- JavaScript
- React Router v7
- Tailwind CSS v4
- shadcn/ui
- React Hook Form + Zod
- Recharts
- date-fns / date-fns-tz
- lucide-react
- sonner

## Database

- PostgreSQL 16
- Prisma Migrate

## Infrastructure

- Docker
- Docker Compose

---

# API Endpoints

## Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive tokens |
| POST | `/api/v1/auth/refresh` | Rotate refresh token, get new access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |

## Food Entries

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/food-entries` | Create a food entry |
| POST | `/api/v1/food-entries/bulk` | Create multiple food entries via CSV upload |
| GET | `/api/v1/food-entries` | List food entries (pagination, date, meal-type filters) |
| GET | `/api/v1/food-entries/:id` | Get a single food entry |
| PATCH | `/api/v1/food-entries/:id` | Update a food entry |
| DELETE | `/api/v1/food-entries/:id` | Delete a food entry |

## Goals

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/goals` | Create a goal |
| GET | `/api/v1/goals` | List goals (paginated) |
| GET | `/api/v1/goals/:id` | Get a single goal |
| PATCH | `/api/v1/goals/:id` | Update a goal |
| DELETE | `/api/v1/goals/:id` | Delete a goal |

## Weight Logs

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/weight-logs` | Log a weight entry |
| GET | `/api/v1/weight-logs` | List weight logs (paginated, date filters) |
| GET | `/api/v1/weight-logs/:id` | Get a single weight log |
| PATCH | `/api/v1/weight-logs/:id` | Update a weight log |
| DELETE | `/api/v1/weight-logs/:id` | Delete a weight log |

## Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reports/calories` | Daily calorie totals for a date range |
| GET | `/api/v1/reports/macros` | Daily macro totals for a date range |
| GET | `/api/v1/reports/micronutrients` | Daily micronutrient totals for a date range |
| GET | `/api/v1/reports/goal-comparison` | Actual vs goal for a specific date |

## Nutrients

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/nutrients` | List all canonical micronutrients |

## AI

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/ai/extract-nutrition` | Extract nutrition from a food/label image |
| POST | `/api/v1/ai/chat` | Conversational interface with Function Calling |

---

# Architecture Diagram

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
```