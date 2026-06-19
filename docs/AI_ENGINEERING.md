# Part 5: AI Engineering

## Scenario

CrediSure Parse AI receives a bank statement.

### Task

Design an AI workflow that:

* Reads the document
* Extracts transactions
* Categorizes spending
* Generates a risk summary

---

## AI Workflow Design

The AI workflow is designed to transform uploaded bank statements into structured financial insights that can be used for credit assessment and lending decisions.

### Workflow

```text
User Uploads Bank Statement
            ↓
      Document Storage (S3)
            ↓
      Text Extraction Layer
            ↓
      Transaction Parsing
            ↓
      Spending Categorization
            ↓
      Risk Analysis Engine
            ↓
      Credit Assessment Report
```

The workflow allows CrediSure to automate financial analysis while maintaining scalability and accuracy.

---

## Question 1: How would you extract text from PDFs?

The extraction strategy depends on the type of PDF being processed.

### Digital (Machine-Readable) PDFs

Machine-generated bank statements already contain embedded text.

Recommended tools:

* pdfplumber
* PyMuPDF
* pdfminer.six

**Preferred Choice:** pdfplumber

Benefits:

* Accurate text extraction
* Preserves table structures
* Easy integration with FastAPI
* Suitable for financial documents

---

### Scanned or Image-Based PDFs

Scanned documents do not contain embedded text and require Optical Character Recognition (OCR).

Recommended tools:

* Amazon Textract
* Google Vision API
* Tesseract OCR

**Preferred Choice:** Amazon Textract

Benefits:

* High OCR accuracy
* Table extraction capabilities
* Handles complex banking layouts
* Fully managed AWS service

This hybrid approach ensures reliable extraction regardless of document format.

---

## Question 2: How would you structure extracted data?

After extraction, transaction data should be normalized into a standard structure.

Example:

```json
{
  "account_number": "1234567890",
  "bank_name": "GTBank",
  "transactions": [
    {
      "date": "2026-06-01",
      "description": "UBER TRIP",
      "amount": 3500,
      "type": "debit",
      "category": "Transportation"
    },
    {
      "date": "2026-06-03",
      "description": "SALARY PAYMENT",
      "amount": 500000,
      "type": "credit",
      "category": "Income"
    }
  ]
}
```

### Benefits

* Standardized transaction processing
* Easier analytics
* Consistent categorization
* Supports AI-driven risk analysis

---

## Question 3: How would you categorize transactions?

Transaction categorization helps identify user spending patterns and financial behavior.

### Rule-Based Categorization

Examples:

| Description    | Category       |
| -------------- | -------------- |
| UBER           | Transportation |
| BOLT           | Transportation |
| NETFLIX        | Entertainment  |
| MTN            | Telecom        |
| SHOPRITE       | Groceries      |
| PAYROLL CREDIT | Income         |

Advantages:

* Fast
* Low cost
* Highly predictable

---

### AI-Based Categorization

Unknown merchants can be classified using a Large Language Model (LLM).

Example Prompt:

```text
Categorize the transaction:

Description:
"PAYSTACK*XYZ SERVICES"

Available Categories:
- Income
- Utilities
- Transport
- Entertainment
- Loan Repayment
- Groceries
- Healthcare

Return only the category.
```

This hybrid approach combines accuracy with cost efficiency.

---

## Question 4: Would you use Prompt Engineering, Fine-Tuning, or RAG?

### Prompt Engineering

**Yes**

Prompt engineering is ideal for:

* Risk summary generation
* Financial insights
* Transaction interpretation
* Credit explanation generation

Benefits:

* Fast implementation
* No training required
* Cost-effective
* Flexible

---

### Retrieval-Augmented Generation (RAG)

**Yes**

RAG enables the system to retrieve:

* Lending policies
* Credit rules
* Regulatory requirements
* Internal risk guidelines

Workflow:

```text
Knowledge Base
       ↓
Vector Database
       ↓
Relevant Rules Retrieved
       ↓
LLM Generates Response
```

Benefits:

* More accurate outputs
* Reduced hallucinations
* Easy policy updates
* No retraining required

---

### Fine-Tuning

**Not initially**

Fine-tuning requires:

* Large labeled datasets
* Significant training costs
* Ongoing maintenance

It becomes beneficial only after the platform has accumulated substantial historical transaction and lending data.

---

## Risk Summary Generation

The AI system evaluates:

* Income consistency
* Debt obligations
* Spending behavior
* Loan repayment history
* Financial stability

Example Output:

```json
{
  "credit_score": 780,
  "risk_level": "Low Risk",
  "summary": "Applicant demonstrates stable monthly income with debt obligations below 15% of earnings. Spending patterns are consistent and indicate strong repayment capacity."
}
```

---

## Question 5: How would you reduce AI costs?

Several strategies can be used to minimize AI expenses.

### 1. Use Rules Before LLMs

Simple transaction categories should be handled using predefined rules.

Examples:

```text
UBER → Transportation
MTN → Telecom
NETFLIX → Entertainment
```

No model call is required.

---

### 2. Cache Results

Store previous categorizations.

Example:

```text
NETFLIX → Entertainment
```

Future requests reuse cached results.

---

### 3. Batch Processing

Process multiple transactions in a single request instead of making individual model calls.

Benefits:

* Lower token usage
* Reduced API costs
* Faster processing

---

### 4. Use Smaller Models

Use lightweight models for classification tasks.

Examples:

* GPT-4o Mini
* Claude Haiku
* Llama 3

Reserve larger models for complex reasoning.

---

### 5. Prompt Optimization

Keep prompts concise and structured.

Benefits:

* Lower token consumption
* Reduced costs
* Faster responses

---

### 6. Asynchronous Processing

Use background workers and queues.

Examples:

* Amazon SQS
* Celery
* FastAPI Background Tasks

This prevents expensive AI processing from blocking user requests.

---

## Conclusion

The proposed AI architecture combines traditional data processing, OCR technologies, rule-based systems, and Large Language Models to deliver scalable and cost-effective credit intelligence. The design prioritizes accuracy, maintainability, and operational efficiency while allowing future expansion through RAG and model fine-tuning.
