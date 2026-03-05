## 1. Project Architecture

### Tech Stack
- **Build:** Vite 5 + React 18
- **State:** Redux Toolkit (slices) + RTK Query (API)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod + @hookform/resolvers
- **UI:** Tailwind CSS, Radix UI, shadcn/ui-style components
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Rich Text:** TipTap
- **Toast:** Sonner

### Architecture Overview

┌─────────────────────────────────────────────────────────────────┐
│                         main.tsx                                 │
│  Provider(store) → BrowserRouter → App                           │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                          App.tsx                                 │
│  Routes: /auth/* | / (Protected) | * (404)                        │
│  Layouts: AuthLayout | DashboardLayout (ProtectedRoute)           │
│  Access model: super-admin, admin, marketing (ProtectedRoute)     │
└─────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────────┐         ┌──────────────┐
│   Redux       │         │   Pages/Features  │         │  Components  │
│  - store      │         │  - Dashboard      │         │  - ui        │
│  - slices     │         │  - Users, Orders   │         │  - common    │
│  - api (RTK)  │         │  - Booking, etc.  │         │  - layout    │
│  - selectors  │         │                   │         │  - auth       │
└───────────────┘         └───────────────────┘         └──────────────┘

### Data Flow

- **API:** RTK Query (`baseApi` + `injectEndpoints`) → auto caching, invalidation
- **Local State:** Redux slices (createSlice) → `useAppDispatch`, `useAppSelector`
- **Auth:** `authSlice` + localStorage (token, user) → `loadUserFromStorage` on mount
- **Access model:** three roles (`super-admin`, `admin`, `marketing`) with `ProtectedRoute` + `RoleBasedRoute` per feature

## 2. Folder Structure

src/
├── components/
│   ├── auth/           # Auth guards
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleBasedRoute.tsx (legacy; avoid in new code)
│   ├── common/         # Shared UI (DataTable, Pagination, Modals, etc.)
│   │   ├── DataTable.tsx
│   │   ├── FilterDropdown.tsx
│   │   ├── ModalWrapper.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Form/       # FormInput, FormSelect, FormTextarea
│   │   └── svg/        # Feature SVGs
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── UserRoleIndicator.tsx
│   └── ui/             # Base UI primitives (shadcn-style)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├─
│   ├── Auth/               # Login, ForgotPassword, VerifyEmail, ResetPassword
│   ├── Dashboard/
│   ├── Users/
│   ├── Products/
│   ├── Categories/
│   ├── Booking/
│   ├── Orders/             # Order management (PascalCase)
│   ├── ClientManagement/
│   ├── AgencyManagement/   # PascalCase (not agency-management)
│   ├── Calendar/           # Correct spelling (not calender)
│   ├── TransactionsHistory/ # Correct spelling (not transictions-history)
│   ├── FAQ/
│   ├── Settings/           # Profile, Password, Terms, Privacy, FAQ
│   └── NotFound/
├── redux/
│   ├── api/            # RTK Query API slices
│   │   ├── baseApi.ts
│   │   └── authApi.ts
│   ├── slices/         # Redux slices
│   │   ├── authSlice.ts
│   │   ├── userSlice.ts
│   │   ├── productSlice.ts
│   │   ├── categorySlice.ts
│   │   ├── carSlice.ts
│   │   ├── bookingSlice.ts
│   │   ├── clientSlice.ts
│   │   ├── agencySlice.ts
│   │   ├── calendarSlice.ts
│   │   ├── transactionSlice.ts
│   │   ├── faqSlice.ts
│   │   └── uiSlice.ts
│   ├── selectors/      # Derived state
│   │   └── roleBasedSelectors.ts (legacy; avoid in new code)
│   ├── hooks.ts        # useAppDispatch, useAppSelector
│   └── store.ts
├── types/
│   ├── index.ts        # Domain types (User, Product, Car, etc.)
│   └── roles.ts        # Legacy multi-role typing (avoid in new code)
├── utils/
│   ├── constants.ts    # STATUS_COLORS, DEFAULT_PAGINATION, etc.
│   ├── cn.ts           # clsx + tailwind-merge
│   ├── formatters.ts   # formatCurrency, formatDate
│   ├── toast.ts
│   ├── applyBusinessIds.ts
│   └── roleHelpers.ts  # Legacy helpers (avoid in new code)
├── hooks/
│   ├── useUrlState.ts  # URL params sync
│   └── useRoleBasedData.ts # Legacy hook (avoid in new code)
├── App.tsx
├── main.tsx
└── index.css

## 3. Rules & Conventions

### Route Rules

- **Auth:** `/auth/login`, `/auth/forgot-password`, `/auth/verify-email`, `/auth/reset-password`
- **Protected:** All routes under `/` require `ProtectedRoute`
- **Access control:** `super-admin`, `admin`, `marketing` – see `src/types/roles.ts` for `FEATURE_ACCESS`
- **Redirect:** Authenticated user → `/dashboard`

### Role Rules (multi-role)

- **super-admin:** Full dashboard access
- **admin:** Orders, Shop Management (Customise, Category, Products; NOT Shop), Subscribers, Revenue, Push Notification, Profile
- **marketing:** Ad Management, Subscribers, Push Notification

### Modal Rules

- Add/Edit/Delete modals per feature
- Use `ModalWrapper` or Radix Dialog
- State: `showAddModal`, `showEditModal`, `showDeleteModal` (local state)

---

## 4. Naming Conventions

### Files & Folders

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DataTable.tsx`, `AddEditProductModal.tsx` |
| Page folders | PascalCase | `CarList/`, `AgencyManagement/`, `TransactionsHistory/`, `Calendar/` |
| Pages (files) | PascalCase | `ProductList.tsx`, `UserDetails.tsx` |
| Slices | camelCase + Slice | `authSlice.ts`, `productSlice.ts` |
| API files | camelCase + Api | `authApi.ts`, `baseApi.ts` |
| Hooks | camelCase, `use` prefix | `useUrlState.ts`, `useAuthGuard.ts` (recommended) |
| Utils | camelCase | `formatters.ts`, `constants.ts` |
| Types | camelCase | `index.ts`, `auth.ts` (recommended) |

> ⚠️ **Legacy inconsistency:** Some folders use `carlist`, `agency-management`, `calender`, `transictions-history`. For **new code**, use PascalCase: `CarList`, `AgencyManagement`, `Calendar`, `TransactionsHistory`.

### Code

| Type | Convention | Example |
|------|------------|---------|
| React components | PascalCase | `ProductList`, `ProtectedRoute` |
| Functions/variables | camelCase | `formatCurrency`, `selectedProduct` |
| Constants | UPPER_SNAKE | `DEFAULT_PAGINATION`, `USER_ROLES` |
| Types/Interfaces | PascalCase | `User`, `ProductFilters`, `ApiResponse` |
| Redux actions | camelCase | `setFilters`, `loginSuccess` |
| RTK hooks | use + Mutation/Query | `useLoginMutation`, `useGetMyProfileQuery` |

### API Endpoints

- Base: `VITE_API_BASE_URL/api/v1`
- Auth: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/current-user`, `/auth/change-password`, `/auth/forget-password`, `/auth/verify-email`, `/auth/reset-password`, `/auth/resend-otp`
- Profile: `/users/profile` (GET, PATCH)

---

## 5. Coding Standards

### Imports

- Use `@/` alias for `src/`
- Order: React → third-party → internal (components, redux, utils, types)

```ts
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { formatCurrency } from '@/utils/formatters'
import type { Product } from '@/types'
```

### Redux

- Use `useAppDispatch` and `useAppSelector` (typed hooks)
- Slices: `createSlice` with `PayloadAction` for typed actions
- Avoid putting non-serializable values in state (use `serializableCheck: false` only when needed)

### Components

- Functional components with TypeScript
- Props interface above component
- Use `cn()` for conditional Tailwind classes

```tsx
interface DataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKeyExtractor: (row: T) => string
}

export function DataTable<T>({ columns, data, rowKeyExtractor }: DataTableProps<T>) {
  return (/* ... */)
}
```

### Forms

- React Hook Form + Zod schema + `@hookform/resolvers`
- Controlled inputs via `register` or `Controller`

### Styling

- Tailwind utility classes
- `cn()` from `@/utils/cn` for merging classes
- Semantic colors: `bg-background`, `text-muted-foreground`, `text-destructive`, etc.

### ESLint

- `@typescript-eslint/recommended`
- `react-hooks/recommended`
- `@typescript-eslint/no-unused-vars`: warn, `argsIgnorePattern: '^_'`

---

## 6. Performance Rules

- **Avoid unnecessary useEffect** – Prefer event handlers, derived state, or RTK Query hooks
- **Prefer derived state instead of extra state** – Compute from existing state; avoid syncing state with useEffect
- **Avoid anonymous functions in heavy lists** – Extract handlers or use `useCallback` when passing to list items
- **Use React.memo only when measurable benefit exists** – Don’t memo by default; profile first

> Reduces over-engineering and keeps components lean.

---

## 7. Error Handling Rules

- **Show toast for mutation errors** – Use Sonner for user-facing API/mutation errors
- **Show inline message for form errors** – Use React Hook Form `formState.errors` + field-level display
- **Never silently swallow API errors** – Always surface errors (toast, inline, or fallback UI)
- **Use Sonner for user-facing errors** – `toast.error()`, `toast.success()` from Sonner

> RTK Query errors: handle in component via `isError`, `error` from mutation/query hooks and show toast.

---

## 8. AI Behavior Rules (Strict)

- **Never create new folders unless necessary** – Prefer existing structure
- **Follow existing naming exactly** – Match project conventions; don’t invent new patterns
- **Prefer existing components before creating new ones** – Reuse `DataTable`, `ModalWrapper`, `FilterDropdown`, etc.
- **Do not introduce new state libraries** – Use Redux Toolkit + RTK Query only
- **Role-based access** – Use `FEATURE_ACCESS` in `src/types/roles.ts` and `RoleBasedRoute` for route-level guards; Sidebar filters nav items by role
- **Flag architectural violations clearly** – If a change breaks conventions, call it out

> Keeps AI output consistent and avoids random creativity.