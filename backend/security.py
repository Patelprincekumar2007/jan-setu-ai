import time
import logging
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("nagriklens.security")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Applies production HTTP security headers to all responses.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    In-memory token bucket / sliding window rate limiter for expensive AI & analysis endpoints.
    Protects against computational exhaustion.
    """
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.rpm = requests_per_minute
        self.request_records = defaultdict(list)
        self.rate_limited_paths = {
            "/api/requests",
            "/api/voice/transcribe",
        }

    async def dispatch(self, request: Request, call_next):
        # Rate limit only POST mutations on heavy routes
        if request.method == "POST":
            path = request.url.path
            is_limited_path = any(path.startswith(p) for p in self.rate_limited_paths) or "/analysis" in path or "/priority" in path
            if is_limited_path:
                client_ip = request.client.host if request.client else "unknown"
                now = time.time()
                window_start = now - 60.0

                # Prune old records
                self.request_records[client_ip] = [
                    t for t in self.request_records[client_ip] if t > window_start
                ]

                if len(self.request_records[client_ip]) >= self.rpm:
                    logger.warning(f"Rate limit exceeded for client IP: {client_ip} on path: {path}")
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={"detail": "Rate limit exceeded. Please wait a moment before retrying."},
                    )

                self.request_records[client_ip].append(now)

        return await call_next(request)
