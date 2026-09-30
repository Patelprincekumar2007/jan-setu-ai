# NagrikLens AI - Security & Production Hardening (Stage 3J)

## 1. Security Architecture Summary

NagrikLens AI implements multi-layered security controls designed for production deployment:

### 1.1 HTTP Security Headers
- `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing)
- `X-Frame-Options: DENY` (prevents clickjacking attacks)
- `X-XSS-Protection: 1; mode=block` (browser-level XSS filtering)
- `Referrer-Policy: strict-origin-when-cross-origin` (protects referral headers)

### 1.2 Rate Limiting Middleware
- In-memory sliding window limiter protecting computationally intensive endpoints:
  - `POST /api/requests`
  - `POST /api/requests/{ref}/analysis`
  - `POST /api/requests/{ref}/priority`
  - `POST /api/voice/transcribe`
- Standard threshold: 60 requests per client IP per minute.

### 1.3 CORS Policy
- Explicit allowlisted origins (`FRONTEND_ORIGIN`).
- Wildcard CORS is disabled for production environments.

### 1.4 Sanitized Error Handling
- Global exception handlers prevent leakages of internal Python stack traces, file paths, SQL statements, or credential details to clients.
- Clients receive clean, actionable JSON error structures.

### 1.5 Prompt Injection & Data Integrity
- Strict separation between system instructions, untrusted citizen text, and retrieved public evidence.
- Citizen submissions are treated strictly as untrusted inputs and cannot override algorithmic or retrieval constraints.

### 1.6 Voice and Audio Security
- File format verification (WAV, WebM, OGG, MP3 only).
- Hard limit of 10MB per audio file.
- Temporary buffers are processed and discarded immediately; audio contents are never permanently logged or retained.
- When Google Cloud Speech credentials are absent, the service responds with an honest 503 error rather than synthetic transcripts.
