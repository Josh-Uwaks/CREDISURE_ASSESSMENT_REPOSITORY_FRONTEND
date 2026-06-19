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

---

# Architecture Overview

CrediSure is a modern credit intelligence platform built with **Next.js 15 (App Router)**.

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Form Handling:** React Hook Form + Zod
- **HTTP Client:** Axios
- **UI Icons:** React Icons
- **Notifications:** React Hot Toast

---

# Folder Structure

```bash
credisure-frontend/
├── app/
├── components/
├── context/
├── lib/
├── public/
├── types/
└── docs/
```

---

# Authentication Flow

## Login Flow

1. User submits email and password  
2. API validates credentials  
3. JWT token returned  
4. Token stored in localStorage and cookies  
5. User redirected to dashboard  

## Protected Routes

- `/dashboard`
- `/upload`
- `/history`

## Public Routes

- `/login`
- `/register`

---

# Dashboard Features

## 1. Journey Tracker
Tracks user onboarding progress:

- KYC Verification
- Document Upload
- Credit Assessment
- Loan Application

## 2. KYC Management
- Submit KYC details
- Monitor verification status
- Retry rejected submissions

## 3. Credit Assessment
- Monthly income
- Monthly expenses
- Existing loans
- Credit score generation

## 4. Loan Management
- Loan application
- Loan tracking
- Loan history

---

# File Upload Interface

## Overview

Users can securely upload financial documents for credit assessment.

## Features

- Drag & Drop upload
- PDF validation
- Max size: 10MB
- Upload progress tracking
- Recent uploads
- Cache integration

## Upload Flow

```text
1. Select File
   ↓
2. Validate Type + Size
   ↓
3. Upload Progress
   ↓
4. Success / Error
```

## Upload API Example

```typescript
uploadDocument: async (file: File, documentType: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
}
```

---

# State Management

CrediSure uses **React Context API** with two primary contexts:

- AuthContext
- CacheContext

---

## AuthContext

### State Structure

```typescript
interface AuthContextType {
  token: string | null;
  userInfo: UserInfo;
  isAuthenticated: boolean;
  kycData: KYCResponse | null;
  assessment: AssessmentResponse | null;
  loans: LoanResponse[];
}
```

### Actions

- login()
- logout()
- submitKYC()
- submitAssessment()
- createLoan()

---

## CacheContext

### Cache Structure

```typescript
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}
```

### Cache Methods

```typescript
interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}
```

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

# Form Validation

CrediSure uses:

- React Hook Form
- Zod

---

## Login Schema

```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
```

---

## KYC Schema

```typescript
export const kycSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  address: z.string().min(1),
  mobile_no: z.string().min(1),
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

# Responsive Design

## Breakpoints

| Breakpoint | Width | Device |
|------------|-------|--------|
| sm | 640px | Mobile |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large Desktop |

---

## Responsive Patterns

### Dashboard Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Sidebar
- Desktop: Fixed sidebar  
- Mobile: Slide-in drawer  

### Forms
- Full width on mobile
- Responsive spacing

---

# Caching Strategy

## Multi-Layer Cache Architecture

1. Memory Cache  
2. CacheContext  
3. localStorage  
4. Backend  

---

## Cache Example

```typescript
const DEFAULT_EXPIRY = 5 * 60 * 1000;
```

### Cache Usage

```typescript
const cachedData = get('assessment_history');

if (!cachedData) {
  const data = await assessmentAPI.getHistory();
  set('assessment_history', data);
}
```

---

# Component Library

## Component Structure

```bash
components/
├── Modals/
├── Navigation/
├── Forms/
├── UI/
└── Layout/
```

---

## Core Components

### KYCModal
- Multi-step KYC form
- Validation
- Progress indicator

### AssessmentModal
- Credit assessment form
- Credit score calculation

### LoanApplicationModal
- Loan application form
- Amount validation

### Sidebar
- Main navigation
- Desktop + mobile support

### Field
Reusable form field wrapper.

### Badge
Status indicator component.

### StatCard
Dashboard statistics component.

### ScoreGauge
Credit score visualization.

---

# Development Setup

## Prerequisites

- Node.js 18+
- npm / yarn

---

## Installation

```bash
git clone <repository-url>
npm install
npm run dev
```

---

## Production Build

```bash
npm run build
npm start
```

---

# Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.credisure.com
```

---

# Testing

## Unit Tests

```bash
npm test
```

## Integration Tests

```bash
npm run test:integration
```

## E2E Tests

```bash
npm run test:e2e
```

---

# Deployment

## Vercel

```bash
vercel --prod
```

## Render
- Connect GitHub repository
- Auto deploy on push to main

---