# Holiday Storage Manager - Project Configuration

## Project Overview
A full-stack web application for managing seasonal decoration storage in households. Built as an MVP web app with plans to convert to mobile using Capacitor.

### Core Domain Concepts

#### Storage Hierarchy
- **Locations**: Physical storage spaces (garage, storage unit, shed, etc.)
- **Boxes**: Containers within locations, organized by season
- **Contents**: Individual items stored within each box

#### Box Organization
- **Set**: A single item physically split across multiple boxes
  - Example: Christmas tree split into 3 boxes labeled "Christmas Tree 1/3", "2/3", "3/3"
  - Each box in a set gets a sequential number (1/3, 2/3, 3/3)
- **Group**: Logically related boxes that belong together
  - Example: Christmas tree boxes (the set) + Christmas decoration boxes = "Christmas tree" group
  - Groups help organize multiple sets and standalone boxes

#### Seasons (Fixed Set)
- Christmas
- Halloween
- Easter
- Summer
- Generic

#### QR Code Labels
Each box generates a label containing:
1. QR code (with box data)
2. Box description/name
3. Seasonal icon
4. Set number (if part of a set, e.g., "1/3")
5. Group name (if part of a group)

**Label Output**: PNG download (implementation details TBD)

### Future Roadmap
- Post-MVP: Capacitor integration for mobile app
- Post-MVP: SQLite database for mobile
- Post-MVP: Testing suite implementation
- Post-MVP: Comprehensive authentication patterns

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui component library
- **Forms**: react-hook-form with Zod validation
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (local), Prisma 7.3 ORM
- **HTTP Client**: Axios
- **Package Manager**: pnpm
- **Auth**: JWT (implementation in progress)

## Development Commands
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
prisma generate       # Generate Prisma client after schema changes
prisma db push        # Push schema changes to database
prisma db pull        # Pull schema from database
```

## Code Style

### General Conventions
- **Indentation**: Tabs (increment by 1 per nested level)
- **No semicolons**
- **Single quotes** for strings
- **No trailing commas**
- **Linter**: ESLint

### Naming Conventions
- `camelCase` for functions, variables, and file/folder names in `/utils`, `/hooks`, `/lib`
- `PascalCase` for React components, TypeScript types, and interfaces
- `kebab-case` for component file names (e.g., `user-profile.tsx`)

### File Organization
- One component per file
- Co-locate component-specific types in the same file when they're not reused
- Shared types go in `/types` directory

## Documentation

### Quick Reference Guides
For detailed documentation on specific parts of the codebase, see:
- `.claude/docs/components.md` - Complete guide to `src/_components/`
- `.claude/docs/utils.md` - Business logic patterns and utilities
- `.claude/docs/app.md` - Next.js App Router and page structure
- `.claude/docs/api.md` - API routes and endpoint patterns
- `.claude/docs/hooks.md` - Custom React hooks and context
- `.claude/docs/types.md` - TypeScript types and interfaces

### Project Documentation (Future)
- `/docs/configs`: Installation instructions, setup guides, environment configuration
- `/docs/devdocs`: Technical documentation - patterns, components, routes, how-tos
- `/docs/changelogs`: Version-specific change logs

## Project Structure

### `/app` - Application Code (Next.js App Router)
- `/api`: Backend API routes
  - **CRITICAL**: `route.ts` files contain ONLY HTTP handling (request/response)
  - NO business logic in API routes - all logic goes in `/utils`
  - API routes call utils functions and return formatted responses
- `/(auth)`: Main application routes (requires authentication)
- `/_components`: Custom app-specific components
  - Built on top of shadcn components
  - Organized by type: `/forms`, `/modals`, `/cards`, `/pages`
  - Follows atomic design principles

### `/components`
- **Root level**: Universal/shared components used across the app
- `/ui`: Base shadcn component library (do not modify these directly)

### `/hooks` - Custom React Hooks
- `/auth`
  - `auth-context.tsx`: Authentication state management
- `/log`
  - `use-console-logger.ts`: Console logging for debugging and user feedback
  - `use-console-recall.ts`: Log recall and download functionality
- `/ui`
  - `error-modal-context.tsx`: **PRIMARY ERROR HANDLING** - always use this for user-facing errors
  - `use-loading-manager.ts`: Loading state management (global or component-specific)
  - `use-toast.ts`: Toast notification system

### `/lib`
- Configuration files for Prisma client and Axios instance
- Database connection setup
- API client configuration

### `/utils` - Business Logic Hub
- **ALL business logic lives here** - never in API routes or components
- Organized by domain model: `/auth`, `/user`, `/location`, `/box`, etc.
- Each domain folder contains small, focused, reusable functions
- All API-facing functions must return `BasicResponse` format
- `/forms/schemas` - Zod validation schemas for forms (cross-cutting concern)

### `/types`
- Type definitions organized by domain and purpose
- `/models` - Database model types organized by domain (`/user`, `/location`, `/box`)
- `/requests` - API request payload types (future)
- `/responses` - API response types (includes `BasicResponse` interface)
- Each model domain has its own subfolder matching database structure

## Standard Response Format

**All API routes and utils functions must return:**
```typescript
export interface BasicResponse {
	success: boolean
	message?: string
	data: any
	error?: any
	code?: number
}
```

### Usage Guidelines
- `success: true` for successful operations, `success: false` for failures
- `message`: User-friendly message describing the result
- `data`: The payload (null/undefined on failure)
- `error`: Error details (null/undefined on success)
- `code`: HTTP status code (for API routes)

### Example Response Patterns
```typescript
// Success
return {
	success: true,
	message: 'Box created successfully',
	data: newBox,
	code: 201
}

// Failure
return {
	success: false,
	message: 'Failed to create box',
	error: 'Location not found',
	data: null,
	code: 404
}
```

## Architecture Principles

### Separation of Concerns
1. **API Routes** (`/app/api/*/route.ts`)
   - Handle HTTP request/response only
   - Validate request data (basic validation)
   - Call utils functions
   - Format and return responses
   - NO business logic

2. **Business Logic** (`/utils`)
   - All validations, transformations, calculations
   - Database operations via Prisma
   - Return `BasicResponse` format
   - Pure functions when possible
   - Well-tested, reusable code

3. **Components** (`/_components`, `/components`)
   - UI rendering and user interactions
   - Call API routes via Axios
   - Handle loading/error states using hooks
   - NO business logic

### Data Flow Pattern
```
User Action → Component → API Route → Utils Function → Database
                ↓            ↓            ↓              ↓
           Update UI ← Response ← BasicResponse ← Prisma Result
```

### Error Handling Strategy
1. **Utils functions**: Catch errors, return `BasicResponse` with `success: false`
2. **API routes**: Check utils response, set appropriate HTTP status code
3. **Components**: Check API response, use `error-modal-context` to show user-facing errors
4. **Logging**: Use `use-console-logger` for debugging information

### Form Handling Pattern
1. Use `react-hook-form` for form state
2. Use `Zod` schemas for validation (define in `/types/requests`)
3. Form components in `/_components/forms`
4. Form submission calls API route
5. API route calls utils function
6. Utils function performs business logic

## Database Patterns (Prisma)

### Current Schema State
**Implemented**:
- User model (id, email, password, name, createdAt, updatedAt)
- Location model (id, name, icon, userId, createdAt, updatedAt)
- User → Locations relationship (one-to-many)

**Future Implementation**:
- Box model with set/group management
- Content model for items in boxes
- Soft deletes (`deletedAt` field)

### Schema Conventions (Future)
- All models include `createdAt: DateTime @default(now())`
- Soft deletes: `deletedAt: DateTime?` (nullable)
- Use `@map("table_name")` for table names in snake_case if needed
- Use cascading deletes for parent-child relationships

### Planned Relationships
- Location → Boxes (one-to-many)
- Box → Contents (one-to-many)
- Box → Set (optional, many-to-one for set membership)
- Box → Group (optional, many-to-one for group membership)

### Query Patterns
- Always exclude soft-deleted records: `where: { deletedAt: null }`
- Use Prisma transactions for operations affecting multiple models
- Use `include` sparingly - only fetch related data when needed

## Authentication (In Development)

### Current State
- Basic login endpoint exists (`/api/auth/login`)
- Auth context hook created (`auth-context.tsx`)
- **NOT YET IMPLEMENTED**:
  - JWT token generation
  - Password hashing (currently storing plaintext - SECURITY RISK)
  - Token validation
  - Route protection

### URGENT TODO - Auth Patterns to Implement
- **CRITICAL**: Implement password hashing (bcrypt or argon2)
- Implement JWT token generation and validation
- Add route protection middleware
- Token refresh strategy
- Session management
- Logout cleanup
- Secure token storage (httpOnly cookies)

## Component Development Guidelines

### Building on shadcn
- Never modify `/components/ui` directly
- Create wrapper components in `/_components` or `/components`
- Extend shadcn components with additional props/functionality
- Keep shadcn components pure for easier updates

### Atomic Design Principles
- **Atoms**: Basic shadcn components (`/components/ui`)
- **Molecules**: Simple combinations (`/components` root)
- **Organisms**: Complex combinations (`/_components`)
- **Pages**: Full page components (`/_components/pages`)

### Component Best Practices
- Extract reusable logic into custom hooks
- Keep components focused on one responsibility
- Use TypeScript props interfaces
- Handle loading states with `use-loading-manager`
- Show errors with `error-modal-context`

## Git Workflow (Recommendations)

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code improvements
- `docs/description` - Documentation updates

### Commit Messages (Conventional Commits)
```
type(scope): description

feat(box): add QR code generation
fix(auth): resolve token expiration issue
refactor(utils): extract common validation logic
docs(readme): update setup instructions
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
**Scope**: Feature area (box, location, auth, ui, etc.)

## Important Reminders

### DO
- ✅ Put ALL business logic in `/utils`
- ✅ Return `BasicResponse` from all utils functions
- ✅ Use `error-modal-context` for user-facing errors
- ✅ Use tabs for indentation, single quotes, no semicolons
- ✅ Run `prisma generate` after schema changes
- ✅ Keep API routes thin (HTTP handling only)
- ✅ Follow atomic design for components

### DON'T
- ❌ Put business logic in API routes or components
- ❌ Modify shadcn components in `/components/ui` directly
- ❌ Use semicolons, double quotes, or trailing commas
- ❌ Forget to exclude soft-deleted records in queries
- ❌ Create components without TypeScript types
- ❌ Skip error handling in utils functions

## Quick Reference

### Creating a New Feature
1. Define types in `/types/[domain]`
2. Create utils functions in `/utils/[domain]`
3. Create API route in `/app/api/[route]/route.ts`
4. Create component in `/_components/[type]/[name].tsx`
5. Use existing hooks for state management

### Adding a New Model
1. Update Prisma schema
2. Run `prisma generate` and `prisma db push`
3. Create types in `/types/[model]`
4. Create utils in `/utils/[model]`
5. Create API routes as needed

### Debugging
1. Use `use-console-logger` hook
2. Check logs in browser console
3. Use `use-console-recall` to download logs
4. Check API responses in Network tab
5. Verify database state with Prisma Studio (`npx prisma studio`)

## Implementation Status

### ✅ Completed
- Basic project structure and configuration
- User model and CRUD operations
- Location model (in progress)
- Form validation with Zod and react-hook-form
- Error handling infrastructure (error modal context)
- Loading state management
- Base UI components (shadcn)
- Custom form components

### 🚧 In Progress
- Authentication system (basic structure exists, needs JWT and password hashing)
- Location management
- User management UI

### 📋 Planned (Post-MVP)
- Box model and management
- Content tracking
- QR code generation
- Label printing (PNG output)
- Set and Group management
- Soft delete implementation
- Comprehensive testing
- Mobile app (Capacitor)
- SQLite for mobile

## Current Codebase State

**Working Features**:
- User registration (without password hashing - needs fixing)
- Basic user listing
- Form validation and error handling
- UI component system

**Known Issues**:
- ⚠️ **SECURITY**: Passwords stored in plaintext (needs immediate fix)
- ⚠️ Authentication not fully implemented
- Auth context exists but token generation/validation missing

**Next Steps**:
1. Implement password hashing (bcrypt/argon2)
2. Implement JWT token generation
3. Complete authentication flow
4. Add route protection
5. Complete location management
6. Begin box model implementation

---

## Need More Details?

Refer to the comprehensive documentation in `.claude/docs/`:
- **[components.md](.claude/docs/components.md)** - Form patterns, component development, best practices
- **[utils.md](.claude/docs/utils.md)** - Business logic organization, function patterns, response formats
- **[app.md](.claude/docs/app.md)** - Next.js routing, server vs client components, navigation
- **[api.md](.claude/docs/api.md)** - API endpoint patterns, authentication, validation
- **[hooks.md](.claude/docs/hooks.md)** - Custom hooks, context providers, state management
- **[types.md](.claude/docs/types.md)** - TypeScript patterns, type organization, best practices