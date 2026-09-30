# NagrikLens AI

### Citizen Needs. Public Data. Better Decisions.

NagrikLens AI is a multilingual citizen development intelligence platform that helps organize local infrastructure requests and connect them with verified public data.

Citizens can submit development-related issues in English, Hindi, or Gujarati. The platform uses Google Gemini to structure citizen requests, hybrid retrieval to find relevant public evidence, evidence-grounded RAG to generate transparent analysis, and deterministic prioritization to support infrastructure planning.

> **NagrikLens AI is a decision-support prototype. It is not an official government grievance portal, government service, or government-endorsed platform.**

---

## Overview

Public infrastructure planning often involves information scattered across citizen feedback, administrative records, datasets, and departmental sources.

NagrikLens AI provides an intelligence layer between citizen demand and public evidence.

The platform connects:

**Citizen Request → AI Understanding → Public Data → Hybrid Retrieval → Evidence-Grounded Analysis → Priority Assessment → Demand Insights**

The goal is not to replace government decision-making.

The goal is to make relevant evidence easier to discover, compare, and understand.

---

## Key Capabilities

### Multilingual Citizen Intake

Citizens can submit development requests in:

- English
- Hindi
- Gujarati

The original citizen input is preserved while AI extracts structured information such as:

- Problem summary
- Category
- Severity
- Affected group
- Location hint
- Language

Supported categories include:

- Water
- Roads
- Healthcare
- Sanitation
- Other

---

### AI-Powered Request Understanding

Google Gemini is used to transform unstructured citizen descriptions into structured information.

Example:

```text
Citizen Request
      ↓
Language Detection
      ↓
Problem Understanding
      ↓
Category Classification
      ↓
Severity Assessment
      ↓
Affected Group Extraction
      ↓
Structured Request
