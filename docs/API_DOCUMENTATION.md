# CrediSure API Documentation

## Base URL

```bash
https://credisure-assessment-repository-backend.onrender.com
```

---

# Authentication

All protected endpoints require a JWT token in the request header:

```http
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### Login

**Endpoint**

```http
POST /auth/login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### Register

**Endpoint**

```http
POST /auth/register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

---

# KYC Endpoints

### Submit KYC

**Endpoint**

```http
POST /kyc
```

### Request Body

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "gender": "Male",
  "dob": "1990-01-01",
  "address": "123 Main Street",
  "mobile_no": "+2348012345678",
  "country": "Nigeria",
  "state": "Lagos",
  "city": "Ikeja",
  "id_type": "National ID",
  "id_number": "1234567890"
}
```

---

### Get KYC Status

**Endpoint**

```http
GET /kyc/status
```

### Response

```json
{
  "exists": true,
  "status": "pending",
  "submitted_at": "2026-01-01T00:00:00Z",
  "full_name": "John Doe"
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `not_submitted` | No KYC submitted |
| `pending` | Under review |
| `verified` | Verified |
| `rejected` | Rejected |

---

# Assessment Endpoints

### Create Assessment

**Endpoint**

```http
POST /assessment/
```

### Request Body

```json
{
  "monthly_income": 500000,
  "monthly_expense": 250000,
  "existing_loans": 50000
}
```

### Response

```json
{
  "user_id": 1,
  "assessment": {
    "credit_score": 720,
    "rating": "Good",
    "risk_level": "Low Risk"
  }
}
```

---

### Get Assessment History

**Endpoint**

```http
GET /assessment/history
```

### Response

```json
[
  {
    "id": 1,
    "credit_score": 720,
    "rating": "Good",
    "risk_level": "Low Risk",
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

---

# Loan Endpoints

### Apply for Loan

**Endpoint**

```http
POST /loans/
```

### Request Body

```json
{
  "amount": 5000000,
  "purpose": "Business expansion",
  "term_months": 12,
  "assessment_id": 1
}
```

### Response

```json
{
  "id": 1,
  "user_id": 1,
  "amount": 5000000,
  "status": "under_review",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

### Get Loans

**Endpoint**

```http
GET /loans/
```

### Response

```json
[
  {
    "id": 1,
    "amount": 5000000,
    "status": "under_review",
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

### Loan Status Values

| Status | Description |
|--------|-------------|
| `draft` | In progress |
| `submitted` | Submitted |
| `under_review` | Under review |
| `approved` | Approved |
| `rejected` | Rejected |
| `disbursed` | Disbursed |
| `active` | Active |
| `completed` | Completed |
| `defaulted` | Defaulted |

---

# Upload Endpoints

### Upload Document

**Endpoint**

```http
POST /upload/
```

### Content Type

```http
multipart/form-data
```

### Form Data

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF file (max 10MB) |
| `document_type` | String | `bank_statement` or `id_document` |

---

### Get Documents

**Endpoint**

```http
GET /upload/
```

### Response

```json
[
  {
    "id": 1,
    "file_name": "statement.pdf",
    "file_type": "application/pdf",
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

---

# Error Handling

## Error Response Format

```json
{
  "detail": "Error message description"
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request |
| `401` | Unauthorized |
| `404` | Not Found |
| `500` | Server Error |

---