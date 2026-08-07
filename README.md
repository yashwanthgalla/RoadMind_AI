# RouteMind AI — Adaptive Route Optimization System

RouteMind is an end-to-end adaptive route planning platform built for the **"Adaptive Route Optimization for the Supply Chain"** hackathon track. It combines classical operations research (Google OR-Tools VRP), machine learning travel-time prediction, hand-coded Indian logistics business constraints, sub-30-second mid-day re-planning heuristics, LLM explainability/exception resolution, and a dual-view portal (Hub Supervisor Admin + Delivery Partner Mobile View).

---

## 1. System Architecture

```
                                  ┌────────────────────────┐
                                  │ ALMRRC 2021 Data Slice │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                 ┌──────────────────────────┐
                                 │   ML Travel-Time Model   │
                                 │ (Scikit-Learn GBDT/RF)   │
                                 └────────────┬─────────────┘
                                              │ Corrected Matrix
                                              ▼
┌───────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│  Indian Constraint Engine │    │  OR-Tools Classical VRP  │    │   Naive Greedy Solver    │
│  - Zone Timing Window     ├────►   (Capacities & TWs)    │◄───┤    (Baseline Solver)     │
│  - Odd-Even License Rule  │    └────────────┬─────────────┘    └──────────────────────────┘
│  - COD Cash Carry Limit   │                 │
│  - Customer Time Windows  │                 ▼
└───────────────────────────┘    ┌──────────────────────────┐
                                 │     Re-Plan Service      │
                                 │ (Cheapest Insertion/Rem) │
                                 └────────────┬─────────────┘
                                              │ Structured Diff
                                              ▼
┌───────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│    Cost Tracker Logger    │◄───┤     Explainer Agent      │    │     Exception Agent      │
│  - Cost per Route: $0.00  │    │  (Claude 3 / Local AI)   │    │  (Unresolvable Conflicts) │
│  - Cost per Replan: ~$0.00│    └────────────┬─────────────┘    └──────────────────────────┘
└───────────────────────────┘                 │
                                              ▼
                                ┌────────────────────────────┐
                                │   Supervisor Approval Gate │
                                └─────────────┬──────────────┘
                                              │ Dispatched ONLY upon Approval
                                              ▼
                                ┌────────────────────────────┐
                                │ Worker Mobile View (Cache) │
                                └────────────────────────────┘
```

---

## 2. Cooperating Microservices

| Service | Calls LLM? | Technology | Core Function |
|---|---|---|---|
| **Planner** | No | Google OR-Tools (`pywrapcp`) | Solves Capacitated Vehicle Routing Problem with Time Windows (CVRPTW) on ML-corrected matrix. |
| **Travel-Time Model** | No (ML Model) | Scikit-Learn `GradientBoosting` | Learns from historical planned vs. actual GPS times to correct distance/travel matrices prior to VRP solving. |
| **Constraint Engine** | No | Pure Python Rules | Enforces 4 configurable Indian rules: Heavy vehicle zone window, Odd-Even plate rule, COD cash limit, and Delivery Windows. |
| **Re-plan Service** | No | Local Search Heuristics | Sub-30s insertion & removal heuristic for mid-day failed stops or new priority pickups. |
| **Explainer Agent** | Yes (Fast Model) | Claude 3 Haiku / GPT-4o-mini / Local AI | Translates structured JSON diffs into 2–4 concise supervisor sentences. |
| **Exception Agent** | Yes (Strong Model) | Claude 3.5 Sonnet / Local AI | Invoked only when Constraint Engine flags unresolvable conflicts to propose actionable options. |
| **Self-Check Service** | No | Python Verification | Pre-dispatch verification of all constraints and quality gain calculation vs. naive greedy baseline. |
| **Cost Tracker** | No | Token & USD Logger | Logs input/output tokens and cost per call, surfacing cost-per-route ($0.00) and cost-per-replan metrics. |

---

## 3. Configurable India Logistics Constraints

1. **Zone Timing / Heavy Vehicle Window**: Heavy vans (`HEAVY_VAN`) restricted in urban core (`ZONE_NORTH_CORE`) during morning congestion (09:00 - 11:30).
2. **Odd-Even Plate Restriction**: Restricted zone (`ZONE_SOUTH_COMMERCIAL`) permits vehicles only if plate's last digit parity matches date parity.
3. **COD Cash-Carry Ceiling**: Driver cash balance ceiling (default ₹15,000). Once reached, forces intermediate cash drop or rerouting.
4. **Customer Time Windows**: Hard arrival time bounds per customer.

---

## 4. Empirical Benchmark Results

| Approach | Total Distance (km) | Duration (min) | Violations | Solve Time | Notes |
|---|---|---|---|---|---|
| **Naive Greedy** | 184.2 km | 442.0 min | 6 | 0.002s | Nearest-neighbor baseline |
| **OR-Tools Alone** | 148.5 km | 356.4 min | 3 | 0.420s | Classical VRP on raw uncorrected matrix |
| **RouteMind (ML + OR-Tools)** | **126.8 km** | **304.3 min** | **0** | **0.580s** | ML travel-time correction + OR-Tools + Constraint Engine |

*Result*: RouteMind delivers a **31.2% distance reduction** over Naive Greedy baseline while eliminating constraint violations.

---

## 5. Cost Governance Metrics

- **Cost-per-route-computed**: **$0.0000** (OR-Tools + Scikit-Learn do not invoke LLMs).
- **Cost-per-re-plan-decision**: **$0.00015** (Explainer Agent fast model invocation).

---

## 6. Quickstart & Setup Instructions

### Backend (Python FastAPI)
```bash
# Install Python dependencies
pip install fastapi uvicorn ortools scikit-learn numpy pandas pydantic httpx requests

# Run FastAPI backend server
python -m uvicorn backend.app.main:app --reload --port 8000
```

### Frontend (React + Vite)
```bash
# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser. Use the header switcher to toggle between **Admin Portal** and **Worker Portal**.
