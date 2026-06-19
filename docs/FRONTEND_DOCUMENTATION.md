# CrediSure Frontend Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Authentication Flow](#authentication-flow)
4. [Dashboard Features](#dashboard-features)
5. [File Upload Interface](#file-upload-interface)
6. [State Management](#state-management)
7. [Form Validation](#form-validation)
8. [Responsive Design](#responsive-design)
9. [Caching Strategy](#caching-strategy)
10. [Component Library](#component-library)
11. [Development Setup](#development-setup)
12. [Deployment](#deployment)

---

# Architecture Overview

CrediSure is a modern credit intelligence platform built with **Next.js 15 (App Router)** following a modular architecture with clear separation of concerns.

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 15 | App Router, SSR, Routing |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| State Management | React Context API | Global state |
| Form Handling | React Hook Form | Form state management |
| Validation | Zod | Schema validation |
| HTTP Client | Axios | API calls |
| UI Icons | React Icons | Icon library |
| Notifications | React Hot Toast | Toast messages |
| File Upload | React Dropzone | Drag & drop uploads |

---

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth Pages │  │  Dashboard   │  │   Upload     │      │
│  │  (Login/Reg) │  │    Pages     │  │    Pages     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │ AuthContext │                          │
│                    │   (State)   │                          │
│                    └──────┬──────┘                          │
│                           │                                  │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │                API Layer (lib/api.ts)                │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │   Backend   │                          │
│                    │     API     │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```text
User Action → Component → Context/API → Backend → Response → UI Update
```

---

# Folder Structure

```bash
credisure-frontend/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   └── upload/
│   │       └── page.tsx
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── AssessmentModal.tsx
│   ├── KYCModal.tsx
│   ├── LoanApplicationModal.tsx
│   ├── Sidebar.tsx
│   ├── Field.tsx
│   ├── Badge.tsx
│   ├── StatCard.tsx
│   ├── ScoreGauge.tsx
│   └── JourneyStrip.tsx
│
├── context/
│   ├── AuthContext.tsx
│   └── CacheContext.tsx
│
├── lib/
│   ├── api.ts
│   └── validation.ts
│
├── types/
│   └── index.ts
│
├── docs/
│   ├── FRONTEND_DOCUMENTATION.md
│   └── API_DOCUMENTATION.md
│
├── public/
├── middleware.ts
└── next.config.ts
```

---

# Authentication Flow

## Login Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                        Login Flow                           │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits email and password                         │
│                         ↓                                   │
│ 2. API validates credentials (POST /auth/login)            │
│                         ↓                                   │
│ 3. JWT token generated and returned                        │
│                         ↓                                   │
│ 4. Token stored in:                                        │
│    • localStorage                                          │
│    • HttpOnly Cookie                                       │
│                         ↓                                   │
│ 5. User data loaded:                                       │
│    • KYC status                                            │
│    • Assessment history                                    │
│    • Loan data                                             │
│    • Documents                                             │
│                         ↓                                   │
│ 6. Redirect to dashboard                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Route Protection (Middleware)

```typescript
// middleware.ts
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

---

## Route Protection Matrix

| Route | Access | Behavior |
|-------|--------|----------|
| `/login` | Public | Redirect to dashboard if authenticated |
| `/register` | Public | Redirect to dashboard if authenticated |
| `/dashboard` | Protected | Redirect to login if unauthenticated |
| `/upload` | Protected | Redirect to login if unauthenticated |
| `/history` | Protected | Redirect to login if unauthenticated |

---

# Dashboard Features

The dashboard serves as the central hub for user onboarding and credit management.

---

## 1. Journey Tracker

Visual step tracker showing onboarding progress.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Your Journey                             │
│                    2 / 4 complete                           │
│                                                             │
│ [✓] KYC   [ ] Upload   [ ] Assessment   [ ] Loan            │
│                                                             │
│ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○     │
└─────────────────────────────────────────────────────────────┘
```

### Status Types

| Status | Meaning |
|--------|---------|
| completed | Step completed |
| active | Current step |
| pending | Future step |
| blocked | Cannot proceed yet |

---

## 2. KYC Management

### Features

- Multi-step KYC form
- Real-time validation
- Status tracking
- Retry rejected verification

### Status States

| Status | Badge Color | Action |
|--------|-------------|--------|
| not_submitted | Amber | Show KYC form |
| pending | Amber | Show pending badge |
| verified | Green | Show verified badge |
| rejected | Red | Show retry option |

---

## 3. Credit Assessment

### Input Fields

- Monthly Income (₦)
- Monthly Expenses (₦)
- Existing Loans (₦)

### Output

- Credit Score (0–850)
- Rating
- Risk Level

### Assessment History Features

- View all assessments
- Filter by risk level
- Sort by date
- Export CSV

---

## 4. Loan Management

### Application Fields

- Loan Amount (₦1,000 – ₦10,000,000)
- Purpose (minimum 10 characters)
- Repayment Term (1–24 months)

### Loan Status

| Status | Description |
|--------|-------------|
| draft | Application in progress |
| submitted | Submitted |
| under_review | Under review |
| approved | Approved |
| rejected | Rejected |
| disbursed | Funds disbursed |
| active | Active loan |
| completed | Fully repaid |
| defaulted | Defaulted |

---

## 5. Credit Score Display

### Components

- Large score display
- Rating badge
- Risk level indicator
- Last assessment date

### Score Color Coding

| Score Range | Rating |
|-------------|--------|
| 700–850 | Excellent / Very Good |
| 600–699 | Good / Fair |
| 300–599 | Poor |

---

# File Upload Interface

## Overview

The upload interface allows users to securely upload financial documents for credit assessment.

---

## Features

| Feature | Description |
|---------|-------------|
| Drag & Drop | Drag PDF files directly |
| File Validation | Validate file type & size |
| Progress Tracking | Upload percentage indicator |
| Recent Uploads | Displays last 3 uploads |
| Cache Integration | Documents cached |
| Security | SSL encrypted uploads |
| Status Feedback | Success/error/loading states |

---

## Upload Flow

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. User selects/drops file                                 │
│    • Validate PDF format                                   │
│    • Check file size (<10MB)                               │
├─────────────────────────────────────────────────────────────┤
│ 2. Upload Progress                                         │
│    • Show percentage                                       │
│    • Update progress bar                                   │
├─────────────────────────────────────────────────────────────┤
│ 3. Success / Error                                         │
│    • Success → Refresh list                                │
│    • Error → Show retry option                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Upload API Integration

```typescript
// lib/api.ts
uploadDocument: async (file: File, documentType: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);

  const response = await api.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
```

---

## File Requirements

| Requirement | Value |
|-------------|-------|
| Format | PDF |
| Max Size | 10MB |
| Document Types | bank_statement, id_document, proof_of_address |

---

## User Experience

- Animated progress bar
- File preview
- Remove uploaded files
- Success/Error toast messages
- Secure upload badge

---

# State Management

CrediSure uses **React Context API** for centralized state management.

The application uses two major contexts:

- `AuthContext`
- `CacheContext`

---

## State Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Global Providers                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AuthProvider                                               │
│     ├── User State                                          │
│     ├── Auth State                                          │
│     ├── KYC State                                           │
│     ├── Assessment State                                    │
│     └── Loan State                                          │
│                                                             │
│  CacheProvider                                              │
│     ├── API Cache                                           │
│     ├── Expiry Logic                                        │
│     └── Cache Invalidation                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## AuthContext

Responsible for managing authentication and user-related application state.

### State Structure

```typescript
interface AuthContextType {
  token: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  kycData: KYCResponse | null;
  assessment: AssessmentResponse | null;
  loans: LoanResponse[];
  loading: boolean;
}
```

---

### Responsibilities

- Authentication
- Token management
- Login / Logout
- User session
- KYC state
- Assessment state
- Loan state

---

### Core Actions

```typescript
login()
logout()
submitKYC()
submitAssessment()
createLoan()
fetchLoans()
fetchDocuments()
```

---

## CacheContext

Handles client-side caching to reduce unnecessary API requests.

---

### Cache Structure

```typescript
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}
```

---

### Cache Context Type

```typescript
interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}
```

---

### Cache Keys

```typescript
const CACHE_KEYS = {
  KYC_STATUS: 'kyc_status',
  ASSESSMENT_HISTORY: 'assessment_history',
  LOANS: 'loans',
  ASSESSMENT: 'credit_assessment',
  DOCUMENTS: 'uploaded_documents',
};
```

---

### Cache Benefits

- Faster page loads
- Reduced API calls
- Better user experience
- Less server load

---

# Form Validation

CrediSure uses:

- React Hook Form
- Zod

This ensures strong validation with full TypeScript support.

---

## Validation Architecture

```text
User Input → React Hook Form → Zod Schema → Validation Result → UI Feedback
```

---

## Login Schema

```typescript
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
```

---

## Register Schema

```typescript
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
```

---

## KYC Schema

```typescript
export const kycSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string(),
  dob: z.string(),
  address: z.string().min(1),
  mobile_no: z.string().min(1),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  id_type: z.string(),
  id_number: z.string()
});
```

---

## Assessment Schema

```typescript
export const assessmentSchema = z.object({
  monthly_income: z.number().min(0),
  monthly_expense: z.number().min(0),
  existing_loans: z.number().min(0),
});
```

---

## Loan Schema

```typescript
export const loanSchema = z.object({
  amount: z.number().min(1000).max(10000000),
  purpose: z.string().min(10),
  term_months: z.number().min(1).max(24),
});
```

---

## Validation Features

| Feature | Description |
|---------|-------------|
| Real-time Validation | Validate during input |
| Error Messages | Human-friendly feedback |
| Type Safety | Full TS integration |
| Reusability | Shared schemas |
| Security | Input sanitization |

---

# Responsive Design

CrediSure is fully responsive across devices.

---

## Breakpoints

| Breakpoint | Width | Device |
|------------|-------|--------|
| sm | 640px | Mobile |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large Desktop |

---

## Layout Strategy

### Desktop
- Sidebar always visible
- Full dashboard layout
- Multi-column grid

### Tablet
- Reduced spacing
- Partial sidebar collapse

### Mobile
- Drawer navigation
- Single-column layout
- Optimized touch targets

---

## Responsive Grid Example

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## Responsive Patterns

### Sidebar
- Desktop → Fixed sidebar
- Mobile → Slide-in drawer

### Tables
- Desktop → Full table
- Mobile → Horizontal scroll

### Forms
- Desktop → Two-column layouts
- Mobile → Full-width inputs

---

# Caching Strategy

CrediSure implements a multi-layer caching strategy.

---

## Cache Layers

```text
┌────────────────────────────┐
│        Memory Cache        │
├────────────────────────────┤
│       CacheContext         │
├────────────────────────────┤
│       localStorage         │
├────────────────────────────┤
│        Backend API         │
└────────────────────────────┘
```

---

## Cache Flow

```text
Request Data
    ↓
Check CacheContext
    ↓
Exists?
 ┌───────┴────────┐
Yes               No
 ↓                 ↓
Return Cache     Fetch API
                   ↓
               Save Cache
```

---

## Cache Configuration

```typescript
const DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes
```

---

## Cache Example

```typescript
const cachedData = get('assessment_history');

if (!cachedData) {
  const data = await assessmentAPI.getHistory();
  set('assessment_history', data);
}
```

---

## Cache Expiry Strategy

| Data Type | Expiry |
|-----------|--------|
| KYC Status | 5 mins |
| Assessment History | 5 mins |
| Loans | 3 mins |
| Documents | 2 mins |

---

---

# Component Library

CrediSure follows a reusable component-driven architecture to ensure consistency, maintainability, and scalability across the application.

---

## Component Hierarchy

```text
components/
├── Modals/
│   ├── KYCModal.tsx
│   ├── AssessmentModal.tsx
│   └── LoanApplicationModal.tsx
│
├── Navigation/
│   ├── Sidebar.tsx
│   └── MobileHeader.tsx
│
├── Forms/
│   └── Field.tsx
│
├── UI/
│   ├── Badge.tsx
│   ├── StatCard.tsx
│   └── ScoreGauge.tsx
│
└── Layout/
    └── JourneyStrip.tsx
```

---

## Core Components

### KYCModal

Multi-step KYC verification modal.

#### Steps

1. Personal Information
2. Address Details
3. Identity Verification

#### Props

```typescript
interface KYCModalProps {
  isOpen: boolean;
  onSubmit: (data: KYCFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}
```

---

### AssessmentModal

Allows users to perform a credit assessment.

#### Props

```typescript
interface AssessmentModalProps {
  isOpen: boolean;
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}
```

#### Fields

- Monthly Income
- Monthly Expenses
- Existing Loans

---

### LoanApplicationModal

Loan application interface with eligibility validation.

#### Props

```typescript
interface LoanApplicationModalProps {
  isOpen: boolean;
  onSubmit: (data: LoanFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  maxAmount?: number;
  creditScore?: number | null;
}
```

---

### Sidebar

Primary navigation component.

#### Navigation Items

- Dashboard
- Upload Documents
- Assessment History
- Profile (Future)
- Settings (Future)

#### Props

```typescript
interface SidebarProps {
  userName: string;
  onLogout: () => void;
}
```

---

### JourneyStrip

Visual onboarding tracker.

#### Props

```typescript
interface JourneyStripProps {
  steps: JourneyStep[];
}

interface JourneyStep {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending' | 'blocked';
}
```

#### Status Indicators

| Status | Indicator |
|----------|----------|
| completed | ✅ |
| active | 🔄 |
| pending | ○ |
| blocked | ❌ |

---

### Badge

Reusable status badge component.

```typescript
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}
```

#### Variants

- success
- warning
- error
- info

---

### StatCard

Displays dashboard metrics.

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}
```

---

### ScoreGauge

Credit score visualization component.

```typescript
interface ScoreGaugeProps {
  score: number;
  rating: string;
  riskLevel: string;
}
```

#### Score Ratings

| Score | Rating |
|---------|---------|
| 800–850 | Excellent |
| 740–799 | Very Good |
| 670–739 | Good |
| 580–669 | Fair |
| 300–579 | Poor |

---

## Component Development Guidelines

### Props-First Design

```typescript
interface ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}
```

---

### Error Handling

```typescript
try {
  await submit();
  toast.success('Success');
} catch (error) {
  toast.error('Something went wrong');
}
```

---

### Performance Optimization

#### Memoization

```typescript
const computedValue = useMemo(
  () => expensiveCalculation(data),
  [data]
);
```

#### Callback Optimization

```typescript
const handleSubmit = useCallback(() => {
  // logic
}, []);
```

#### Dynamic Imports

```typescript
const KYCModal = dynamic(
  () => import('@/components/KYCModal')
);
```

---

# Design System

---

## Colors

| Token | Value |
|---------|---------|
| Primary | #1EA537 |
| Dark | #0B3B2E |
| Muted | #8A8470 |
| Background | #F7F5F0 |
| Card | #FFFFFF |
| Border | #E7E2D6 |

---

## Typography

| Element | Style |
|----------|----------|
| Headings | text-2xl to text-3xl |
| Body | text-base |
| Helper Text | text-xs |
| Font Family | Inter |

---

## Spacing

| Token | Value |
|---------|---------|
| Card Padding | p-6 |
| Gap | gap-6 |
| Section Margin | mb-8 |

---

# Development Setup

## Prerequisites

- Node.js 18+
- npm or Yarn
- Git

---

## Installation

```bash
git clone https://github.com/your-repository/credisure-frontend.git

cd credisure-frontend

npm install
```

---

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://credisure-assessment-repository-backend.onrender.com
```

---

## Start Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
```

---

# Testing

## Unit Tests

```bash
npm test
```

---

## Integration Tests

```bash
npm run test:integration
```

---

## End-to-End Tests

```bash
npm run test:e2e
```

---

# Deployment

## Vercel Deployment

### Install CLI

```bash
npm install -g vercel
```

### Deploy

```bash
vercel --prod
```

---

## Render Deployment

### Build Settings

```text
Build Command:
npm run build

Start Command:
npm start
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://credisure-assessment-repository-backend.onrender.com
```

---

# Security Considerations

## Authentication

- JWT-based authentication
- Protected dashboard routes
- Automatic session validation
- Secure logout functionality

---

## File Upload Security

- PDF-only uploads
- File size validation
- Backend file verification
- HTTPS encrypted transmission

---

## Input Validation

- Client-side validation using Zod
- Server-side validation
- Type-safe request handling
- Sanitized form submissions

---

# Performance Optimizations

The frontend includes several optimizations:

### Client Caching

- CacheContext memory cache
- localStorage persistence
- Automatic cache invalidation

### Rendering Optimization

- Dynamic imports
- Component memoization
- Lazy-loaded modals

### API Optimization

- Request caching
- Reduced duplicate requests
- Efficient state updates

---

# Conclusion

CrediSure Frontend is designed as a scalable, maintainable, and performant credit intelligence platform built with Next.js 15 and TypeScript.

Key highlights include:

- Secure authentication flow
- Multi-step KYC verification
- Credit assessment workflows
- Loan management system
- Document upload capabilities
- Multi-layer caching architecture
- Responsive dashboard experience
- Strong TypeScript and Zod validation
- Modular component architecture
- Production-ready deployment pipeline

The architecture provides a solid foundation for future enhancements while maintaining excellent developer experience and user experience standards.

---

**Version:** 1.0.0  
**Frontend Framework:** Next.js 15  
**Language:** TypeScript  
**Last Updated:** June 2026