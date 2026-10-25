"""Application-wide constants for CareForge.

Centralizes route paths, database table names, validation bounds,
and LLM resilience settings according to industry best practices.
"""

import re

# ==============================================================================
# API Routing & Documentation Constants
# ==============================================================================
API_PREFIX = "/api"

ROUTE_GENERATE = "/generate"
ROUTE_BRANDS = "/brands"
ROUTE_BLOGS = "/blogs"
ROUTE_HEALTH = "/health"

TAG_GENERATION = "generation"
TAG_BRANDS = "brands"
TAG_BLOGS = "blogs"

# ==============================================================================
# Database Table Names
# ==============================================================================
TABLE_BRAND = "tbl_brand"
TABLE_BLOG = "tbl_blog"

# ==============================================================================
# Input Validation & Bounds
# ==============================================================================
MIN_TOPICS_COUNT = 1
MAX_TOPICS_COUNT = 10

MIN_COMPANY_NAME_LENGTH = 1
MAX_COMPANY_NAME_LENGTH = 150

MIN_LOGO_URL_LENGTH = 5

HEX_COLOR_REGEX_STRING = r"^#(?:[0-9a-fA-F]{3}){1,2}$"
HEX_COLOR_REGEX = re.compile(HEX_COLOR_REGEX_STRING)

DEFAULT_BRAND_COLOR = "#0066CC"
DEFAULT_FALLBACK_SLUG = "healthcare-article"

# ==============================================================================
# LLM Generation & Resilience Constants
# ==============================================================================
PRIMARY_GEMINI_MODEL = "gemini-flash-lite-latest"
FALLBACK_GEMINI_MODELS: tuple[str, ...] = (
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
)

LLM_TIMEOUT_SECONDS: float = 35.0
LLM_MAX_RETRIES: int = 3
LLM_RETRY_MIN_WAIT: float = 2.0
LLM_RETRY_MAX_WAIT: float = 10.0
LLM_RETRY_MULTIPLIER: float = 1.5

TARGET_WORD_COUNT = 1000
