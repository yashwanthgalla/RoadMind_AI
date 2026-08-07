import os

class Settings:
    PROJECT_NAME: str = "RouteMind AI"
    VERSION: str = "1.0.0"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_PATH: str = os.path.join(BASE_DIR, "data", "route_dataset_slice.json")
    
    # Configurable India Constraints Defaults
    COD_CASH_LIMIT_INR: float = 15000.0  # Max cash on hand before forced cash-drop / reroute
    ZONE_TIMING_RESTRICTION: dict = {
        "restricted_zone": "ZONE_NORTH_CORE",
        "prohibited_start": "09:00:00",
        "prohibited_end": "11:30:00",
        "restricted_vehicle_types": ["HEAVY_VAN"]
    }
    ODD_EVEN_RULE: dict = {
        "enabled": True,
        "restricted_zone": "ZONE_SOUTH_COMMERCIAL",
        "current_date_parity": "EVEN", # EVEN or ODD
    }
    
    # LLM Settings
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Pricing defaults ($ per 1K tokens)
    LLM_FAST_INPUT_COST: float = 0.00025   # e.g., Claude 3 Haiku / GPT-4o-mini
    LLM_FAST_OUTPUT_COST: float = 0.00125
    LLM_STRONG_INPUT_COST: float = 0.003
    LLM_STRONG_OUTPUT_COST: float = 0.015

settings = Settings()
