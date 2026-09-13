# Personal Calorie Tracker

A full-stack personal calorie tracking application for recording food intake, setting nutritional goals, and analyzing daily and weekly nutrition.

The project is being developed as part of a Software Engineer interview assignment, with a focus on clean architecture, API-driven development, data integrity, validation, and extensibility.

## Project Status

**Current stage: Database & Backend Foundation**

The PostgreSQL database schema, Prisma migrations, backend foundation, authentication foundation, and protected Food Entry API skeleton are currently implemented.

The project is being developed incrementally, with each major stage kept in a working state before moving to the next feature.

---

## Features

### Planned Core Features

* User registration and login
* Daily calorie target
* Protein, carbohydrate, and fat targets
* Weight goal
* Food entry creation and management
* Meal-type categorization:

  * Breakfast
  * Lunch
  * Dinner
  * Snacks
* Food entries with:

  * Food name
  * Quantity
  * Calories
  * Protein
  * Carbohydrates
  * Fat
  * Micronutrients
* Date and time based food-entry filtering
* Weekly calorie intake trends
* Macro breakdown by day/week
* Micronutrient summaries
* Goal vs actual nutrition comparison
* AI-based nutrition extraction from food/nutrition-label images

### Planned Bonus Features

* Conversational LLM interface for app actions
* Multi-user private accounts
* Bulk PDF import of food diaries/nutrition history

> Multi-user authentication is already being implemented as part of the backend foundation so that user data can remain private as additional features are added.

---

# Technology Stack

## Backend

* Node.js
* Express
* JavaScript (ES Modules)
* Zod
* Prisma ORM
* PostgreSQL
* JWT
* Argon2id

## Database

* PostgreSQL 16
* Prisma Migrate

## Infrastructure

* Docker
* Docker Compose

## Frontend

Frontend implementation will be added in a later stage.

---

# Project Structure

```text
Personal-Calorie-Tracker/
│
├── backend/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma.config.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── 20260913203619_init/
│   │       │   └── migration.sql
│   │       ├── 20260913210155_add_database_constraints/
│   │       │   └── migration.sql
│   │       └── migration_lock.toml
│   │
│   └── src/
│       ├── app.js
│       ├── server.js
│       │
│       ├── config/
│       │   └── env.js
│       │
│       ├── lib/
│       │   ├── jwt.js
│       │   └── prisma.js
│       │
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   └── validate.middleware.js
│       │
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.controller.js
│       │   │   ├── auth.routes.js
│       │   │   ├── auth.schema.js
│       │   │   └── auth.service.js
│       │   │
│       │   └── food-entry/
│       │       ├── food-entry.controller.js
│       │       ├── food-entry.routes.js
│       │       ├── food-entry.schema.js
│       │       └── food-entry.service.js
│       │
│       └── utils/
│           ├── app-error.js
│           ├── password.js
│           └── prisma-error.js
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

# Database Design

The application uses PostgreSQL as its primary database with Prisma as the ORM and migration system.

The current database contains the following entities:

```text
User
 ├── Goals
 ├── FoodEntries
 │    └── FoodEntryNutrients
 │           └── Nutrient
 ├── WeightLogs
 └── RefreshTokens
```

## Users

Stores application users and authentication-related information.

Important fields include:

* `id`
* `email`
* `password_hash`
* `timezone`
* `created_at`
* `updated_at`

User IDs use UUIDs.

---

## Food Entries

A `FoodEntry` represents **one individual food item consumed by a user**.

For example, a breakfast containing:

* 3 eggs
* 2 slices of bread
* 250 ml milk

is represented by three Food Entry records.

Each entry contains:

* Food name
* Meal type
* Time consumed
* Quantity
* Quantity unit
* Calories
* Protein
* Carbohydrates
* Fat
* Source
* Optional AI confidence
* Creation/update timestamps

Meal types currently supported:

```text
BREAKFAST
LUNCH
DINNER
SNACK
```

There is intentionally no separate `Meal` table at the current stage. Meal type and consumption time are sufficient for the required MVP functionality.

---

## Micronutrients

Micronutrients use a normalized relational design.

The `nutrients` table stores canonical nutrient definitions:

```text
id | code       | name       | unit | category
---|------------|------------|------|---------
1  | iron       | Iron       | mg   | MINERAL
2  | calcium    | Calcium    | mg   | MINERAL
3  | vitamin_c  | Vitamin C  | mg   | VITAMIN
```

Food entries reference nutrients through `food_entry_nutrients`.

This allows the database to maintain a consistent definition of each nutrient and its unit.

The API accepts nutrient codes rather than database IDs.

Example:

```json
{
  "micronutrients": [
    {
      "code": "iron",
      "amount": 2.1
    },
    {
      "code": "vitamin_b12",
      "amount": 1.5
    }
  ]
}
```

The backend resolves the nutrient definition and stores the corresponding relationship.

A missing micronutrient record means that the nutrient value is unknown/not recorded rather than automatically assuming zero.

---

## Goals

Goals support:

* Daily calorie targets
* Protein targets
* Carbohydrate targets
* Fat targets
* Optional weight goals
* Effective time periods

Database constraints prevent overlapping goal periods for the same user.

The Goals API is planned for a later implementation stage.

---

## Weight Logs

Weight logs store a user's weight measurements over time.

Each record contains:

* User
* Weight in kilograms
* Logged timestamp

The database enforces positive weight values.

The Weight Log API is planned for a later implementation stage.

---

## Refresh Tokens

Authentication uses refresh tokens to support persistent user sessions.

Refresh tokens are stored as hashes rather than plaintext tokens.

Each record contains:

* Token ID
* User ID
* Token hash
* Expiration time
* Creation time
* Revocation time

---

# Database Integrity

The database contains constraints and indexes to enforce data integrity and improve common query patterns.

Examples include:

* Positive food quantities
* Non-negative calorie values
* Non-negative macro values
* Valid AI confidence range
* Positive weight values
* Valid goal targets
* Non-overlapping goal periods per user
* Foreign-key relationships
* Cascading deletion of user-owned data where appropriate
* Restricted deletion of canonical nutrients
* Unique nutrient codes
* Unique refresh-token hashes

Important Food Entry indexes include:

```text
(user_id, eaten_at DESC)

(user_id, meal_type, eaten_at DESC)
```

These support the application's primary food-history query patterns.

---

# Timezone Handling

User timezone is stored as an IANA timezone identifier, for example:

```text
Asia/Kolkata
```

Food consumption timestamps are stored as actual instants using PostgreSQL `TIMESTAMPTZ`.

Date-based queries are interpreted using the user's timezone.

Date ranges use a half-open interval:

```text
[from, to)
```

For example:

```text
from=2026-09-13
to=2026-09-14
```

represents the complete local calendar day of September 13 in the user's timezone.

---

# API

The backend exposes versioned REST APIs under:

```text
/api/v1
```

The frontend will communicate with the backend exclusively through these APIs.

## Authentication

Current authentication endpoints:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

Authentication uses:

* JWT access tokens
* Short-lived access tokens
* Argon2id password hashing

Protected APIs require:

```http
Authorization: Bearer <access-token>
```

---

## Food Entries

Current Food Entry endpoint:

```http
POST /api/v1/food-entries
```

The complete CRUD API is planned as:

```http
POST   /api/v1/food-entries
GET    /api/v1/food-entries
GET    /api/v1/food-entries/:id
PATCH  /api/v1/food-entries/:id
DELETE /api/v1/food-entries/:id
```

Food Entry endpoints are authenticated and user-owned resources are isolated by the authenticated user's ID.

---

# API Validation

Request bodies are validated using Zod.

Validation includes:

* Required fields
* Data types
* Enum values
* Numeric ranges
* Timestamp formats
* Strict request-field validation
* Micronutrient validation

Invalid requests return a consistent error structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {}
  }
}
```

---

# Error Handling

The backend uses a centralized error-handling middleware.

Standard error codes include:

```text
VALIDATION_ERROR
UNAUTHENTICATED
RESOURCE_NOT_FOUND
CONFLICT
INTERNAL_SERVER_ERROR
```

Errors are returned using a consistent structure:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required"
  }
}
```

Database-specific errors are mapped to appropriate API errors instead of exposing raw database errors to clients.

---

# Pagination

List APIs will use page-based pagination.

Default values:

```text
page  = 1
limit = 20
```

Maximum page size:

```text
100
```

Pagination will be applied to all list APIs as required by the assignment.

---

# Local Development Setup

## Prerequisites

Install:

* Node.js
* Docker
* Docker Compose
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/Saitej2456/Personal-Calorie-Tracker
cd Personal-Calorie-Tracker
```

---

## 2. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL 16 using the configuration in:

```text
docker-compose.yml
```

The development database is:

```text
calorie_tracker
```

---

## 3. Configure environment variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calorie_tracker?schema=public"

JWT_ACCESS_SECRET="replace-with-a-secret-long-one_preferably"
JWT_ACCESS_EXPIRES_IN="30m"

FRONTEND_URL="http://localhost:3000"

NODE_ENV="development"
PORT=5000
```

Do not commit `.env` to Git.

---

## 4. Install backend dependencies

```bash
cd backend
npm install
```

---

## 5. Apply database migrations

```bash
npx prisma migrate dev
```

To check migration status:

```bash
npx prisma migrate status
```

---

## 6. Start the backend

```bash
npm run dev
```

The backend currently runs on:

```text
http://localhost:5000
```

---

# Development Principles

The project follows several principles during development:

### API-first architecture

The frontend does not access the database directly.

```text
Frontend
   │
   │ HTTP / REST API
   ↓
Backend
   │
   │ Prisma
   ↓
PostgreSQL
```

### Feature-based backend organization

Backend code is organized by feature:

```text
modules/
├── auth/
├── food-entry/
├── goals/
├── weight-log/
├── nutrients/
└── reports/
```

Each feature can contain its own:

* Routes
* Controllers
* Services
* Validation schemas

### Data ownership

Authenticated users can only access resources belonging to themselves.

Resource ownership is checked using the authenticated user's ID rather than trusting IDs supplied by the client.

### Database as an integrity boundary

Important business invariants are enforced at the database level where appropriate rather than relying exclusively on application-level validation.

---

# Current Development Roadmap

## Stage 1 — Database & Backend Foundation

**Status: Completed**

* PostgreSQL setup
* Docker Compose setup
* Prisma configuration
* Database schema
* Database migrations
* Database constraints
* Database indexes
* Prisma PostgreSQL adapter
* Environment configuration
* Centralized error handling
* Request validation foundation
* Authentication foundation
* Protected Food Entry route

## Stage 2 — Complete Food Entry API

**Status: Next**

* Create Food Entry
* List Food Entries
* Get Food Entry
* Update Food Entry
* Delete Food Entry
* Date filtering
* Meal-type filtering
* Pagination
* Response DTO/mapping
* Complete validation

## Stage 3 — Goals & Weight Tracking

**Planned**

* Goal APIs
* Goal management
* Weight Log APIs

## Stage 4 — Reports & Analytics

**Planned**

* Weekly calorie trends
* Daily/weekly macro breakdown
* Micronutrient summaries
* Goal vs actual reports

## Stage 5 — Frontend

**Planned**

* Authentication UI
* Food entry interface
* Dashboard
* Reports/graphs
* Goal management
* Weight tracking

## Stage 6 — AI Nutrition Extraction

**Planned**

* Food/nutrition-label image upload
* AI image analysis
* Nutrition extraction
* Pre-filled Food Entry data
* Confidence handling

## Stage 7 — Bonus Features

**Planned**

* Conversational LLM interface
* Bulk PDF import

---

# Project Assumptions

Some design decisions have intentionally been kept simple for the MVP:

* A Food Entry represents one consumed food item.
* There is no separate Food catalog in the current MVP.
* There is no separate Meal table; meal type is stored directly on Food Entry.
* Nutrition values stored on a Food Entry represent the nutrition for the consumed quantity.
* Micronutrients are stored relationally.
* Food consumption timestamps represent actual instants.
* Date filtering is interpreted using the user's timezone.
* Historical Food Entry nutrition is stored as a snapshot and is not dependent on a mutable food catalog.
* Additional database entities for future AI/PDF import workflows will be introduced when those features are actually implemented rather than prematurely adding unused schema.

---

# License

See the [LICENSE](LICENSE) file for license information.
