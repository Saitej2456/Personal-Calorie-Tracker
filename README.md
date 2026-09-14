# Personal Calorie Tracker

A full-stack personal calorie tracking application for recording food intake, setting nutritional goals, tracking weight, and analyzing nutrition over time.

This project is being developed as part of a **Software Engineer interview assignment**, with a focus on clean architecture, API-driven development, data integrity, validation, authentication, and extensibility.

The project is being developed incrementally, with each major stage kept in a working state before moving to the next feature.

---

# Project Status

**Current stage: Stage 2 — Complete Food Entry API**

The following are currently implemented:

* PostgreSQL database
* Docker Compose development environment
* Prisma ORM and migrations
* Database constraints and indexes
* Environment configuration and validation
* Centralized error handling
* Request validation using Zod
* User registration and login
* JWT authentication
* Argon2id password hashing
* Protected, user-owned Food Entry API
* Complete Food Entry CRUD
* Food Entry pagination
* Date-range filtering
* Meal-type filtering
* Micronutrient support
* Timezone-aware date filtering
* Response mapping/DTO layer
* Canonical nutrient seed data

The frontend, goals, weight tracking, reports, and AI nutrition extraction will be implemented in later stages.

---

# Assignment Requirements

The application is intended to support:

### Goal Setting

Users should be able to define:

* Daily calorie targets
* Protein targets
* Carbohydrate targets
* Fat targets
* Weight goals

### Meal Tracking

Users should be able to record consumed food with:

* Food name
* Quantity
* Calories
* Protein
* Carbohydrates
* Fat
* Micronutrients
* Meal type
* Time consumed

Food entries should be filterable by date/time range and meal type.

### Reports & Analytics

The application is intended to provide:

* Weekly calorie intake trends
* Daily/weekly macro breakdowns
* Micronutrient summaries
* Goal vs actual nutrition comparisons

### AI Nutrition Extraction

The application is intended to support extracting nutritional information from:

* Nutrition-label images
* Food/plate images

The extracted information can then be used to pre-fill food entries.

### Architecture

The frontend communicates with the backend exclusively through APIs.

All user data is persisted in the database.

### Required Engineering Considerations

The assignment emphasizes:

* Clean code
* Modular architecture
* Validation
* Error handling
* Pagination for list APIs
* Maintainability
* Clear documentation

---

# Technology Stack

## Backend

* Node.js
* Express 5
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

# Architecture

The backend follows a feature-based architecture with a clear separation between HTTP handling, validation, business logic, and persistence.

```text
Client / Frontend
       │
       │ HTTP / REST API
       ↓
   Middleware
       │
       ↓
   Controllers
       │
       ↓
    Services
       │
       ↓
     Prisma
       │
       ↓
   PostgreSQL
```

The frontend does not access the database directly.

## Backend Request Flow

```text
Request
  ↓
Route
  ↓
Authentication / Validation Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

Controllers are responsible for HTTP-level concerns.

Services contain business logic and enforce application-level invariants.

Prisma is used for database access.

The database acts as an additional integrity boundary through constraints, foreign keys, indexes, and other PostgreSQL features.

---

# Project Structure

```text
Personal-Calorie-Tracker/
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma.config.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
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
│       │       ├── food-entry.mapper.js
│       │       ├── food-entry.routes.js
│       │       ├── food-entry.schema.js
│       │       └── food-entry.service.js
│       │
│       └── utils/
│           ├── app-error.js
│           ├── date.js
│           ├── password.js
│           └── prisma-error.js
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

# Database Design

The application uses PostgreSQL with Prisma as the ORM and migration system.

The current database contains the following entities:

```text
User
 ├── RefreshTokens
 ├── Goals
 ├── FoodEntries
 │    └── FoodEntryNutrients
 │           └── Nutrient
 └── WeightLogs
```

Some entities have their database schema implemented before their APIs because the schema is being designed around the complete application requirements.

---

## Users

The `User` entity stores application users and authentication information.

Important fields include:

* `id`
* `email`
* `passwordHash`
* `timezone`
* `createdAt`
* `updatedAt`

User IDs use UUIDs.

Email addresses are unique.

The user's timezone is stored as an **IANA timezone identifier**, for example:

```text
Asia/Kolkata
```

---

## Food Entries

A `FoodEntry` represents **one individual food item consumed by a user**.

For example, a breakfast containing:

```text
3 eggs
2 slices of bread
250 ml milk
```

is represented as three separate Food Entry records.

There is intentionally no separate `Meal` table for the current MVP.

Each Food Entry contains:

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
* Creation timestamp
* Update timestamp

Supported meal types:

```text
BREAKFAST
LUNCH
DINNER
SNACK
```

Supported quantity units:

```text
GRAM
MILLILITER
PIECE
SERVING
```

Nutrition values stored on a Food Entry represent the nutrition for the **consumed quantity**, rather than a reusable per-100g food definition.

---

# Micronutrients

Micronutrients use a normalized relational design.

A canonical `Nutrient` table stores nutrient definitions:

```text
Nutrient
---------
id
code
name
unit
category
```

Food entries reference these definitions through:

```text
FoodEntry
    │
    └── FoodEntryNutrient
              │
              └── Nutrient
```

The API accepts nutrient **codes** rather than database IDs.

For example:

```json
{
  "micronutrients": [
    {
      "code": "IRON",
      "amount": 5
    },
    {
      "code": "CALCIUM",
      "amount": 100
    }
  ]
}
```

The backend resolves the nutrient codes against the canonical `Nutrient` table.

The current seed data includes commonly required vitamins and minerals such as:

* Vitamin A
* Vitamin C
* Vitamin D
* Vitamin E
* Vitamin K
* Calcium
* Iron
* Magnesium
* Phosphorus
* Potassium
* Zinc

A missing micronutrient record means the nutrient value is **unknown/not recorded**, rather than automatically assuming zero.

---

# Goals

The database supports goals containing:

* Daily calorie target
* Protein target
* Carbohydrate target
* Fat target
* Optional weight goal
* Effective start time
* Optional effective end time

The database prevents overlapping goal periods for the same user.

The Goals API will be implemented in a later stage.

---

# Weight Logs

Weight logs store a user's weight measurements over time.

Each record contains:

* User
* Weight in kilograms
* Logged timestamp
* Creation timestamp

The database enforces positive weight values.

The Weight Log API will be implemented in a later stage.

---

# Refresh Tokens

The database contains a refresh-token model for persistent authentication sessions.

Refresh tokens are stored as **hashes rather than plaintext tokens**.

Each record contains:

* Token ID
* User ID
* Token hash
* Expiration time
* Creation time
* Revocation time

The current authentication API implements registration, login, and access-token authentication. Refresh-token rotation and logout will be implemented in a later authentication stage.

---

# Authentication & Authorization

Authentication is implemented using JWT access tokens.

The access token contains the authenticated user's ID as its subject:

```text
sub = user UUID
```

Access tokens are intentionally short-lived.

Passwords are hashed using **Argon2id** before being stored.

Protected endpoints require:

```http
Authorization: Bearer <access-token>
```

## Authentication vs Authorization

Authentication establishes **who the user is**.

Authorization establishes **which resources that user is allowed to access**.

Food Entry queries are always scoped by both:

```text
foodEntry.id
AND
authenticated user ID
```

This prevents users from accessing another user's Food Entries.

A resource belonging to another user is treated the same as a nonexistent resource and returns:

```text
404 RESOURCE_NOT_FOUND
```

This avoids exposing information about other users' resources.

---

# Timezone Handling

Food consumption timestamps represent actual instants and are stored using PostgreSQL `TIMESTAMPTZ`.

For example, a timestamp such as:

```text
2026-09-14T02:30:00.000Z
```

represents a specific instant in time.

Date-based queries are interpreted using the user's stored IANA timezone.

Date filters use a half-open interval:

```text
[from, to)
```

For example:

```text
from=2026-09-14
to=2026-09-15
```

means:

> Include the complete local calendar day of September 14 in the user's timezone.

The lower boundary is inclusive and the upper boundary is exclusive.

This avoids ambiguous end-of-day timestamps and handles timezone conversions cleanly.

Historical timestamps are not rewritten if the user later changes their timezone. The stored timestamp remains the same instant; future date-based queries are interpreted using the user's current timezone.

---

# API

The backend exposes versioned REST APIs under:

```text
/api/v1
```

The frontend will communicate with the backend exclusively through these APIs.

---

## Authentication API

### Register

```http
POST /api/v1/auth/register
```

Creates a user account and returns an access token.

Required fields:

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "timezone": "Asia/Kolkata"
}
```

The timezone must be a valid IANA timezone.

---

### Login

```http
POST /api/v1/auth/login
```

Authenticates a user and returns an access token.

---

# Food Entry API

All Food Entry endpoints are protected by authentication.

## Create

```http
POST /api/v1/food-entries
```

Creates a Food Entry.

Example:

```json
{
  "foodName": "Boiled Eggs",
  "mealType": "BREAKFAST",
  "eatenAt": "2026-09-14T08:00:00+05:30",
  "quantity": 4,
  "quantityUnit": "PIECE",
  "calories": 250,
  "proteinG": 18.9,
  "carbsG": 1.8,
  "fatG": 15.9,
  "source": "MANUAL",
  "micronutrients": [
    {
      "code": "IRON",
      "amount": 5
    }
  ]
}
```

Food Entry request bodies are validated using Zod before reaching the service layer.

---

## List

```http
GET /api/v1/food-entries
```

Supports:

* Pagination
* Date filtering
* Meal-type filtering

Example:

```http
GET /api/v1/food-entries?page=1&limit=20&from=2026-09-14&to=2026-09-15&mealType=BREAKFAST
```

The date range uses:

```text
[from, to)
```

The default pagination values are:

```text
page  = 1
limit = 20
```

Maximum page size:

```text
100
```

Example response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

---

## Get Food Entry

```http
GET /api/v1/food-entries/:id
```

Returns a single Food Entry belonging to the authenticated user.

---

## Update Food Entry

```http
PATCH /api/v1/food-entries/:id
```

Supports partial updates.

Fields that are omitted remain unchanged.

Micronutrients have a deliberate replacement semantic:

* If `micronutrients` is omitted, the existing micronutrients remain unchanged.
* If `micronutrients` is provided, it replaces the entire existing micronutrient set.

The service validates the final state of related fields such as:

```text
source
aiConfidence
```

This prevents invalid states during partial updates.

For example:

```text
source = MANUAL
aiConfidence = 0.8
```

is invalid.

An AI-generated entry can instead contain:

```text
source = AI_IMAGE
aiConfidence = 0.8
```

---

## Delete Food Entry

```http
DELETE /api/v1/food-entries/:id
```

Deletes a Food Entry belonging to the authenticated user.

Successful deletion returns:

```text
204 No Content
```

Associated `FoodEntryNutrient` records are removed through the database's cascading foreign-key relationship.

---

# Validation

Request validation is implemented using **Zod**.

Validation covers:

* Required fields
* Data types
* Enum values
* Numeric ranges
* UUIDs
* Timestamp formats
* IANA timezones
* Strict request-field validation
* Pagination parameters
* Date ranges
* Meal types
* Micronutrient codes
* Duplicate micronutrient codes
* Source/AI confidence invariants

Invalid requests return a consistent error structure.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {}
  }
}
```

Validation is performed at the API boundary, while important business invariants are also enforced in the service layer and database where appropriate.

---

# Error Handling

The backend uses a centralized error-handling middleware and a shared `AppError` abstraction.

Standard error codes include:

```text
VALIDATION_ERROR
UNAUTHENTICATED
RESOURCE_NOT_FOUND
CONFLICT
INTERNAL_SERVER_ERROR
```

Example:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Food entry not found"
  }
}
```

Database-specific errors are mapped into appropriate API errors instead of exposing raw database errors to clients.

---

# Pagination

The assignment requires pagination in all list APIs.

The current implementation uses page-based pagination.

Default:

```text
page  = 1
limit = 20
```

Maximum:

```text
limit = 100
```

Food Entry listing returns:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Food Entry queries use deterministic ordering:

```text
eatenAt DESC
id DESC
```

The `id` ordering acts as a tie-breaker when multiple entries have the same consumption timestamp.

---

# Database Integrity

The database is treated as an integrity boundary rather than relying exclusively on application validation.

Current constraints include:

* Food quantity must be positive
* Calories must be non-negative
* Protein must be non-negative
* Carbohydrates must be non-negative
* Fat must be non-negative
* AI confidence must be between 0 and 1 when present
* Weight must be positive
* Goal calorie target must be positive
* Goal macro targets must be non-negative
* Weight goal must be positive when present
* Goal periods cannot overlap for the same user
* Nutrient codes are unique
* Refresh-token hashes are unique
* Foreign-key relationships are enforced

Relevant Food Entry indexes include:

```text
(user_id, eaten_at DESC)

(user_id, meal_type, eaten_at DESC)
```

These support the application's primary Food Entry history queries.

---

# Transactions

Operations that modify multiple related database records are performed atomically.

For example, when updating a Food Entry's micronutrients:

```text
Food Entry update
       +
Delete existing nutrient relationships
       +
Create new nutrient relationships
       ↓
Single transaction
```

If any operation fails, the transaction is rolled back.

This prevents partially updated Food Entry data.

---

# Environment Configuration

Environment variables are loaded and validated at application startup.

Create:

```text
backend/.env
```

using `.env.example` as the template.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calorie_tracker?schema=public"

JWT_ACCESS_SECRET="replace-with-a-secret-at-least-32-characters-long"
JWT_ACCESS_EXPIRES_IN="30m"

FRONTEND_URL="http://localhost:3000"

NODE_ENV="development"
PORT=5000
```

The real `.env` file should **never be committed to Git**.

The repository contains `.env.example` with placeholder values.

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

This starts PostgreSQL 16 using:

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

Copy the values from:

```text
backend/.env.example
```

and provide a real JWT secret.

---

## 4. Install backend dependencies

```bash
cd backend
npm install
```

---

## 5. Generate Prisma Client

```bash
npm run prisma:generate
```

---

## 6. Apply database migrations

```bash
npm run prisma:migrate
```

To check migration status:

```bash
npx prisma migrate status
```

---

## 7. Seed canonical nutrients

```bash
npm run prisma:seed
```

This populates the canonical `Nutrient` table with the nutrient definitions required by Food Entry micronutrient operations.

---

## 8. Start the backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

---

# Available Backend Scripts

From the `backend` directory:

```bash
npm run dev
```

Starts the development server with Nodemon.

```bash
npm start
```

Starts the backend normally.

```bash
npm run prisma:generate
```

Generates the Prisma Client.

```bash
npm run prisma:migrate
```

Creates/applies development migrations.

```bash
npm run prisma:studio
```

Opens Prisma Studio.

```bash
npm run prisma:seed
```

Seeds canonical nutrient definitions.

---

# Development Principles

## API-first architecture

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

---

## Feature-based organization

Backend functionality is organized by feature.

Current modules include:

```text
modules/
├── auth/
└── food-entry/
```

Future modules are expected to include areas such as:

```text
goals/
weight-log/
reports/
```

Each feature can contain its own:

* Routes
* Controllers
* Services
* Validation schemas
* Mappers

---

## Data ownership

Authenticated users can only access resources belonging to themselves.

Resource ownership is enforced using the authenticated user's ID rather than trusting a user ID supplied by the client.

---

## Database as an integrity boundary

Important invariants are enforced at the database level where appropriate.

Application-level validation provides friendly API errors, while database constraints provide a second layer of protection against invalid states.

---

## Avoid premature abstractions

The current implementation intentionally avoids introducing entities or abstractions that are not yet required.

For example:

* No separate Food catalog
* No separate Meal table
* No speculative AI extraction entity
* No speculative PDF import entity
* No repository layer until the application actually benefits from one

Additional abstractions can be introduced when the corresponding features are implemented.

---

# Current Development Roadmap

## Stage 1 — Database & Backend Foundation

**Status: Completed**

Implemented:

* PostgreSQL setup
* Docker Compose setup
* Prisma configuration
* Prisma PostgreSQL adapter
* Database schema
* Initial migrations
* Database constraints
* Database indexes
* Environment configuration
* Centralized error handling
* Request validation foundation
* Authentication foundation
* JWT access-token authentication
* Argon2id password hashing
* Protected API routes

---

## Stage 2 — Complete Food Entry API

**Status: Completed**

Implemented:

* Create Food Entry
* List Food Entries
* Get Food Entry
* Update Food Entry
* Delete Food Entry
* Date filtering
* Meal-type filtering
* Pagination
* Timezone-aware date filtering
* Micronutrient relationships
* Canonical nutrient seed data
* Response mapping
* Complete request validation
* Ownership enforcement
* Transactional micronutrient updates
* Source/AI confidence validation
* Consistent application errors

---

## Stage 3 — Goals & Weight Tracking

**Status: Planned**

Planned:

* Goal APIs
* Create/update/delete goals
* Effective goal periods
* Weight Log APIs
* Weight history

---

## Stage 4 — Reports & Analytics

**Status: Planned**

Planned:

* Weekly calorie trends
* Daily/weekly macro breakdown
* Micronutrient summaries
* Goal vs actual comparisons

---

## Stage 5 — Frontend

**Status: Planned**

Planned:

* Authentication UI
* Food entry interface
* Dashboard
* Reports and graphs
* Goal management
* Weight tracking

The frontend will communicate exclusively with the backend APIs.

---

## Stage 6 — AI Nutrition Extraction

**Status: Planned**

Planned:

* Food/plate image upload
* Nutrition-label image upload
* AI image analysis
* Nutrition extraction
* Pre-filled Food Entry data
* AI confidence handling

The current `FoodEntrySource` model already supports:

```text
MANUAL
AI_IMAGE
```

so AI-generated entries can be distinguished from manually entered entries without changing the fundamental Food Entry model.

---

## Stage 7 — Bonus Features

**Status: Planned**

Potential bonus features:

* Conversational LLM interface
* Bulk PDF import of food diaries/nutrition history

---

# Project Assumptions

The following decisions are intentional MVP design choices:

* A Food Entry represents one consumed food item.
* There is no separate Food catalog.
* There is no separate Meal table.
* Meal type is stored directly on Food Entry.
* Nutrition values represent the nutrition for the consumed quantity.
* Micronutrients are stored relationally.
* The API uses canonical nutrient codes rather than database IDs.
* Missing micronutrient records represent unknown/not-recorded values rather than zero.
* Food timestamps represent actual instants.
* Date filtering is interpreted using the user's timezone.
* Historical Food Entry nutrition is stored as a snapshot and is not dependent on a mutable food catalog.
* User-owned resources are always scoped by the authenticated user's ID.
* Additional database entities for AI or PDF import workflows will be introduced when those features are actually implemented.
* The backend is designed to remain usable independently of the future frontend.

---

# License

See the [LICENSE](LICENSE) file for license information.
