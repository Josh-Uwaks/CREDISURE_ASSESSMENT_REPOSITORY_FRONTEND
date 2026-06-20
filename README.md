## Additional Documentation

### Core Documentation

* [Frontend Documentation](./docs/FRONTEND_DOCUMENTATION.md)
* [API Documentation](./docs/API_DOCUMENTATION.md)

### Assessment Documentation

The following documents contain responses to the architecture and engineering sections of the CrediSure Full Stack Software Engineer Assessment.

#### Part 5: AI Engineering

This document covers:

* AI workflow design
* PDF text extraction
* OCR processing
* Transaction extraction and structuring
* Spending categorization
* Risk summary generation
* Prompt Engineering
* Retrieval-Augmented Generation (RAG)
* Fine-Tuning considerations
* AI cost optimization strategies

📄 **Documentation:**
[AI Engineering Response](./docs/AI_ENGINEERING.md)

---

#### Part 6: Cloud Architecture

This document covers:

* AWS deployment architecture
* Frontend hosting strategy
* Backend deployment strategy
* Database architecture
* Document storage design
* Authentication and security
* Scalability planning
* Monitoring and observability
* Backup and disaster recovery

📄 **Documentation:**
[Cloud Architecture Response](./docs/CLOUD_ARCHITECTURE.md)

---

## Demo Access

### Live Application

Frontend URL:  
[CrediSure Assessment Live Demo](http://credisure-assessment-repository-frontend.onrender.com/)

The application can be tested using the following credentials:

```text
Email: test@gmail.com
Password: 4t63pbpDf3YAvwE
```

> **Note:** These credentials are provided for demonstration purposes only.

Alternatively, you may create a new account through the registration page and complete the onboarding flow independently.

---

## Sample Test Data

The following sample values can be used when testing the platform features.

### User Registration

```text
First Name: John
Last Name: Doe
Email: john.doe@example.com
Password: SecurePass123!
Phone Number: +2348012345678
```

---

### KYC Verification

```text
Business Name: Doe Enterprises
Business Type: Retail
CAC Number: RC1234567
BVN: 12345678901
Address: 15 Admiralty Way, Lekki, Lagos
```

---

### Credit Assessment

Use the following values when testing the credit scoring workflow:

```text
Monthly Income: ₦500,000
Monthly Expenses: ₦150,000
Existing Loans: ₦50,000
```

Expected Result:

```text
Credit Score: ~780
Rating: Very Good
Risk Level: Low Risk
```

---

### Loan Application

Use the following values when testing loan requests:

```text
Amount: ₦200,000
Purpose: Business expansion and inventory purchase
Term: 12 months
```

---

### Document Upload

Supported document sample:

```text
Document Type: Bank Statement
Format: PDF
Maximum File Size: 10MB
```

Recommended test document:

```text
Bank Statement
3–6 Months Transaction History
PDF Format
```

---

## Technology Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* React Context API
* React Hook Form
* Zod Validation

### Backend

* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Python

### Database

* MySQL

### Cloud & Infrastructure

* AWS Amplify
* Amazon ECS Fargate
* Amazon RDS
* Amazon S3
* Amazon CloudFront
* Amazon CloudWatch
* AWS Secrets Manager

### AI & Document Processing

* OCR (Amazon Textract / PDF Parsers)
* Transaction Categorization Engine
* Risk Analysis Workflow
* LLM-Based Financial Summarization

---

## Repository Structure

### Frontend

```text
app/
components/
context/
lib/
types/
docs/
```

### Backend

```text
app/
├── api/
├── core/
├── models/
├── schemas/
├── services/
```

---

## Assessment Coverage

This submission includes:

✅ System Design Architecture

✅ Frontend Development (Next.js + TypeScript)

✅ Backend Development (FastAPI)

✅ Database Design

✅ AI Engineering Design

✅ Cloud Architecture Design

✅ Authentication & Authorization

✅ Credit Assessment Workflow

✅ KYC Verification Workflow

✅ Loan Application Workflow

✅ Document Upload & Storage
