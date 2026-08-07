"""
Cost Tracker Service for RouteMind.
Wraps all LLM requests, logs tokens and dollar costs, and computes cost metrics per route & per replan decision.
"""
from typing import List, Dict, Any
from datetime import datetime
from backend.app.models.schemas import CostRecord
from backend.app.config import settings

class CostTracker:
    def __init__(self):
        self.records: List[CostRecord] = []
        self.total_routes_computed: int = 0
        self.total_replan_decisions: int = 0

    def log_llm_call(self, agent_name: str, model_used: str, input_tokens: int, output_tokens: int) -> CostRecord:
        """
        Logs an LLM call and calculates USD cost based on token pricing models.
        """
        if "fast" in model_used.lower() or "haiku" in model_used.lower() or "mini" in model_used.lower():
            in_cost = (input_tokens / 1000.0) * settings.LLM_FAST_INPUT_COST
            out_cost = (output_tokens / 1000.0) * settings.LLM_FAST_OUTPUT_COST
        else:
            in_cost = (input_tokens / 1000.0) * settings.LLM_STRONG_INPUT_COST
            out_cost = (output_tokens / 1000.0) * settings.LLM_STRONG_OUTPUT_COST

        cost_usd = round(in_cost + out_cost, 6)

        record = CostRecord(
            agent_name=agent_name,
            model_used=model_used,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
            timestamp=datetime.now().isoformat()
        )
        self.records.append(record)
        return record

    def record_route_computation(self):
        self.total_routes_computed += 1

    def record_replan_decision(self):
        self.total_replan_decisions += 1

    def get_summary(self) -> Dict[str, Any]:
        total_cost = sum(r.cost_usd for r in self.records)
        total_in_tokens = sum(r.input_tokens for r in self.records)
        total_out_tokens = sum(r.output_tokens for r in self.records)

        cost_per_route = 0.0  # Classical solver = $0 LLM cost
        cost_per_replan = (total_cost / self.total_replan_decisions) if self.total_replan_decisions > 0 else 0.0

        return {
            "total_llm_calls": len(self.records),
            "total_input_tokens": total_in_tokens,
            "total_output_tokens": total_out_tokens,
            "total_cost_usd": round(total_cost, 5),
            "cost_per_route_computed_usd": 0.0000,
            "cost_per_re_plan_decision_usd": round(cost_per_replan, 5),
            "total_routes_computed": self.total_routes_computed,
            "total_replan_decisions": self.total_replan_decisions,
            "recent_records": [r.dict() for r in self.records[-10:]]
        }

# Global singleton cost tracker instance
cost_tracker = CostTracker()
