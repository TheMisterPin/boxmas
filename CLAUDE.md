# Boxmas — AI Assistant Reference

A full-stack Next.js web app for managing seasonal decoration storage. Users create **Locations** (physical spaces), place **Boxes** inside them, photograph box contents, and generate QR-code labels to retrieve items later.

> **Detailed docs** live in `.claude/docs/`. This file is the authoritative quick-reference for the current codebase state.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture Principles](#architecture-principles)
4. [Domain Model](#domain-model)
5. [Authentication](#authentication)
6. [API Routes](#api-routes)
7. [Standard Response Format](#standard-response-format)
8. [Code Conventions](#code-conventions)
9. [Development Workflow](#development-workflow)
10. [Environment Variables](#environment-variables)
11. [Implementation Status](#implementation-status)
12. [Quick Reference](#quick-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui (new-york), lucide-react |
| Forms | react-hook-form + Zod |
| HTTP Client | Axios |
| ORM | Prisma 7.3 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcrypt |
| QR Scanning | BarcodeDetector API → @zxing/browser fallback |
| PDF / Labels | pdf-lib |
| Image Hosting | imgbb.com |
| Package Manager | pnpm |

---

## Project Structure

```
boxmas/
├── prisma/
│   ├── schema.prisma          # Database schema (source of truth)
│   └── migrations/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # ← HTTP handling ONLY (no business logic)
│   │   │   ├── auth/login/route.ts
│   │   │   ├── auth/logout/route.ts
│   │   │   ├── user/route.ts
│   │   │   ├── location/route.ts
│   │   │   ├── location/[id]/route.ts
│   │   │   ├── box/route.ts
│   │   │   ├── box/[id]/route.ts
│   │   │   └── logs/route.ts
│   │   ├── (auth)/            # Protected pages (auth guard in layout)
│   │   │   ├── layout.tsx     # Redirects unauthenticated → /
│   │   │   ├── locations/page.tsx
│   │   │   ├── location/[id]/page.tsx
│   │   │   ├── box/page.tsx
│   │   │   └── box/[id]/page.tsx
│   │   ├── page.tsx           # Home: login form OR QR scanner + nav
│   │   ├── layout.tsx         # Root layout — wraps all providers
│   │   └── globals.css
│   │
│   ├── _components/           # App-specific components
│   │   ├── pages/             # Full-page components
│   │   ├── forms/             # react-hook-form forms
│   │   ├── cards/             # Display cards
│   │   └── modals/            # Dialog modals
│   │
│   ├── components/            # Shared / generic components
│   │   ├── ui/                # shadcn/ui — DO NOT EDIT
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── layout-wrapper.tsx
│   │   ├── error-modal.tsx
│   │   ├── universal-button.tsx
│   │   ├── universal-loader.tsx
│   │   └── universal-modal.tsx
│   │
│   ├── hooks/
│   │   ├── auth/auth-context.tsx          # Auth state (useAuth)
│   │   ├── ui/error-modal-context.tsx     # Global error display
│   │   ├── ui/use-loading-manager.tsx     # Loading state
│   │   ├── ui/use-toast.ts
│   │   ├── log/use-console-logger.tsx
│   │   ├── log/use-console-recall.tsx
│   │   └── use-mobile.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts           # Prisma singleton
│   │   ├── axios.ts            # Axios instance + interceptors
│   │   └── utils.ts            # Tailwind cn() helper
│   │
│   ├── types/
│   │   ├── models/             # DB model types by domain
│   │   └── responses/basic-response.ts
│   │
│   └── utils/                 # ← ALL business logic lives here
│       ├── auth/              # JWT verification, auth helpers
│       ├── user/              # User creation, password check
│       ├── location/          # Location CRUD
│       ├── box/               # Box CRUD
│       ├── label/qr.ts        # QR code + PDF label generation
│       ├── media/             # Image encode/upload (imgbb)
│       ├── camera/            # QR scanning utilities
│       ├── logger/            # Client-side logging
│       ├── forms/schemas/     # Zod validation schemas
│       └── index.ts           # Barrel export
│
├── middleware.ts               # JWT auth guard for protected routes
├── next.config.ts
├── prisma.config.ts
├── components.json             # shadcn config
├── eslint.config.mjs
├── tsconfig.json               # Path alias: @/* → ./src/*
└── LOGGING.md
```

---

## Architecture Principles

### The Golden Rule: Strict Separation of Concerns

```
User Action → Component → Axios → API Route → Utils → Prisma → DB
                 ↑                    ↓           ↓
            Update UI ←── Response ←─────── BasicResponse
```

| Layer | Responsibility | Must NOT |
|---|---|---|
| `app/api/*/route.ts` | Parse request, call utils, return HTTP response | Contain business logic |
| `utils/` | All validation, transformation, DB operations | Handle HTTP directly |
| `_components/`, `components/` | Render UI, call API via Axios | Contain business logic |

### Error Handling Chain

1. **Utils** — catch all errors, return `BasicResponse` with `success: false`
2. **API routes** — check `success`, map to HTTP status codes
3. **Components** — check response, call `useErrorModal()` for user-facing messages
4. **Logging** — use `useConsoleLogger` hook throughout

### Never modify `/components/ui/`

These are shadcn/ui auto-generated components. Extend them by creating wrapper components in `/_components/` or `/components/`.

---

## Domain Model

### Storage Hierarchy
- **Location** — a physical space (garage, shed, attic…)
- **Box** — a container inside a location; has a photo of contents and a closed photo
- *(Future)* **Set** — a single item split across multiple boxes (e.g. "Christmas Tree 1/3")
- *(Future)* **Group** — logically related boxes regardless of set membership

### Seasons (fixed enum)
`Christmas` | `Halloween` | `Easter` | `Summer` | `Generic`

### QR Code Labels (implemented)
Each box label contains: QR code → box ID, box description, seasonal icon, set number (if in a set), group name (if in a group). Output: PDF download via `pdf-lib`.

### Prisma Schema — Current Models

```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String     // bcrypt hashed
  name      String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  locations Location[]
  sessions  Session[]
}

model Location {
  id        String   @id @default(uuid())
  name      String
  icon      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  boxes     Box[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Box {
  id            String   @id @default(uuid())
  name          String
  description   String
  closedImage   String?  // imgbb URL
  contentsImage String?  // imgbb URL
  locationId    String
  location      Location @relation(fields: [locationId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Session {
  id         String   @id @default(uuid())
  userId     String
  token      String   @unique
  deviceInfo String?
  ipAddress  String?
  createdAt  DateTime @default(now())
  lastUsedAt DateTime @updatedAt
  expiresAt  DateTime
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Authentication

### Flow
1. `POST /api/auth/login` → validates credentials → generates 7-day JWT → stores `Session` in DB → returns `{ user, token }`
2. Client stores token in `localStorage`
3. `lib/axios.ts` request interceptor attaches `Authorization: Bearer <token>` on every request
4. `middleware.ts` verifies token for protected routes and injects `x-user-id` / `x-user-email` headers
5. `POST /api/auth/logout` deletes the current session; `DELETE /api/auth/logout` purges all user sessions

### Protected Routes (middleware)
- `/users` — pages
- `/api/user` — API
- `/api/location` — API

### Token Verification (`utils/auth/verify-token.ts`)
1. Verifies JWT signature against `JWT_SECRET`
2. Looks up token in `Session` table (revocation check)
3. Validates `expiresAt`
4. Updates `lastUsedAt`

### Client Auth State (`hooks/auth/auth-context.tsx`)
```typescript
const { user, isAuthenticated, loading, login, logout, logoutAllDevices } = useAuth()
```

### Password Security
Passwords are hashed with **bcrypt (10 salt rounds)** before storage. Never store or log plaintext passwords.

---

## API Routes

All routes return JSON following `BasicResponse`. Auth-protected routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ✗ | Login, get JWT token |
| POST | `/api/auth/logout` | ✓ | Logout current device |
| DELETE | `/api/auth/logout` | ✓ | Logout all devices |
| POST | `/api/user` | ✗ | Register new user |
| GET | `/api/user` | ✓ | List all users (no passwords) |
| POST | `/api/location` | ✓ | Create location |
| GET | `/api/location` | ✓ | Get current user's locations |
| PATCH | `/api/location/[id]` | ✓ | Update location |
| POST | `/api/box` | ✓ | Create box |
| GET | `/api/box` | ✓ | List boxes (filter by locationId query param) |
| GET | `/api/box/[id]` | ✓ | Get single box |
| PATCH | `/api/box/[id]` | ✓ | Update box |
| DELETE | `/api/box/[id]` | ✓ | Delete box |
| POST | `/api/logs` | ✗ | Write client logs to server |

---

## Standard Response Format

**Every utils function and API route must return this shape:**

```typescript
export interface BasicResponse {
  success: boolean
  message?: string
  data: any
  error?: any
  code?: number
}
```

```typescript
// Success
return { success: true, message: 'Box created', data: newBox, code: 201 }

// Failure
return { success: false, message: 'Box not found', error: 'Not found', data: null, code: 404 }
```

---

## Code Conventions

### Formatting (enforced by ESLint)
- **No semicolons**
- **Single quotes** for strings
- **No trailing commas**
- **2-space indentation** (tabs in `.claude/Cluade.md` is incorrect — ESLint enforces 2 spaces)
- Windows line endings allowed (`CRLF`)
- Imports ordered: React/Next → external → `@/*` internal

### Naming
| Pattern | Used for |
|---|---|
| `camelCase` | functions, variables, hooks, utils, lib files |
| `PascalCase` | React components, TypeScript types, interfaces |
| `kebab-case` | component filenames (`create-box-form.tsx`) |
| `camelCase` | utils/hooks/lib filenames (`verify-token.ts`) |

### TypeScript
- Path alias `@/*` maps to `src/*`
- Always define props interfaces for components
- Co-locate component-specific types in the same file if not reused elsewhere
- Shared types go in `src/types/`

### Components
- One component per file
- Build on shadcn — never modify `components/ui/` directly
- Use `useLoadingManager` for loading states
- Use `useErrorModal` for user-facing errors
- Use `useToast` for non-blocking notifications

### Forms
- Use `react-hook-form` with `zodResolver`
- Define Zod schemas in `src/utils/forms/schemas/`
- Form components live in `src/_components/forms/`

---

## Development Workflow

### Setup
```bash
pnpm install
# Copy .env.example → .env and fill in values (see Environment Variables)
npx prisma generate      # Generate Prisma client
npx prisma db push       # Apply schema to database
pnpm dev                 # Start dev server on :3000
```

### Daily Commands
```bash
pnpm dev          # Development server (hot reload)
pnpm build        # Production build
pnpm start        # Run production build
pnpm lint         # Check ESLint issues
pnpm lint:fix     # Auto-fix ESLint issues
npx prisma studio # GUI to inspect/edit database
```

### After Prisma Schema Changes
```bash
npx prisma generate   # Regenerate client types
npx prisma db push    # Sync schema (dev) — OR —
npx prisma migrate dev --name <name>  # Create tracked migration
```

### Git Conventions
Branch naming: `feature/description` | `fix/description` | `refactor/description` | `docs/description`

Commit messages follow Conventional Commits:
```
feat(box): add QR code PDF generation
fix(auth): handle expired token edge case
refactor(utils): extract shared validation logic
docs(claude): update implementation status
```
Types: `feat` `fix` `refactor` `docs` `test` `chore`

### No Tests Yet
Testing is post-MVP. No jest/vitest config exists. Do not add test files without confirming with the user.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | Secret key for JWT signing (defaults to `'your-secret-key'` — **change in production**) |
| `IMGBB_API_KEY` | ✓ for images | API key for imgbb image hosting |

---

## Implementation Status

### Fully Implemented
- User registration with bcrypt password hashing
- JWT authentication with session management (multi-device, revocation)
- Route protection via Next.js middleware
- Location CRUD (create, list, update)
- Box CRUD (create, list, single, update, delete)
- Box image upload via imgbb
- QR code scanning (BarcodeDetector + zxing fallback)
- PDF label generation with QR codes (pdf-lib)
- Client-side persistent logging (daily rotation, download)
- Error modal system, loading state management, toast notifications
- shadcn/ui component system

### In Progress / Partial
- Set and Group assignment for boxes (data model not in schema yet)
- Sidebar with full navigation

### Post-MVP / Planned
- Box content item tracking
- Soft deletes (`deletedAt` field)
- Testing suite
- Mobile app via Capacitor + SQLite
- Offline support
- Comprehensive token refresh strategy

---

## Quick Reference

### Adding a New Feature
1. Define types in `src/types/[domain]/`
2. Write business logic in `src/utils/[domain]/`
3. Create API route in `src/app/api/[route]/route.ts` (HTTP only)
4. Build component in `src/_components/[type]/[name].tsx`
5. Wire up with existing hooks (`useAuth`, `useErrorModal`, `useLoadingManager`)

### Adding a New DB Model
1. Edit `prisma/schema.prisma`
2. `npx prisma generate && npx prisma db push`
3. Create types in `src/types/models/[model]/`
4. Create utils in `src/utils/[model]/`
5. Add API routes as needed

### Debugging
1. Use `useConsoleLogger` hook to log events
2. Check browser console and Network tab
3. Use `useConsoleRecall` to download persisted logs
4. `npx prisma studio` to inspect database state
5. Server logs from `POST /api/logs` appear in the Next.js process stdout

### Common Pitfalls
- **Never put business logic in API routes** — it belongs in `utils/`
- **Never modify `components/ui/`** — extend via wrapper components
- **Always return `BasicResponse`** from utils functions
- **Always exclude password fields** when returning user data
- **Run `prisma generate`** after any schema change before using new types
