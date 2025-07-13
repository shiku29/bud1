import os
import json
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List

# --- LangChain Imports ---
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

# --- Pydantic Models for Structured JSON Response ---
# These models define the exact structure of the data our API will return.
class Festival(BaseModel):
    id: int
    name: str
    date: str
    daysLeft: int
    urgency: str
    items: List[str]

class RecommendedProduct(BaseModel):
    id: int
    name: str
    demand: str
    profit: str
    units: str
    trend: str

class LocalDemand(BaseModel):
    id: int
    area: str
    product: str
    demand: str

class AvoidProduct(BaseModel):
    id: int
    name: str
    reason: str
    suggestion: str

class PlannerResponse(BaseModel):
    upcomingFestivals: List[Festival]
    topProductsToStock: List[RecommendedProduct]
    nearbyDemand: List[LocalDemand]
    avoidProducts: List[AvoidProduct]

# --- Router Initialization ---
# We use an APIRouter to keep these planner-specific routes separate.
router = APIRouter()

# --- AI Model Configuration ---
try:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise KeyError("GROQ_API_KEY not found in .env file")
    model = ChatGroq(model='gemma2-9b-it')
except Exception as e:
    print(f"Error during Groq configuration in planner: {e}")
    model = None

# --- API Endpoint for Inventory Planner ---
@router.get("/full-report", response_model=PlannerResponse)
async def get_full_planner_report(location: str = "Delhi"):
    """
    Generates a full, comprehensive report for the Inventory Planner page.
    This single endpoint provides all the data needed for the UI.
    """
    if not model:
        raise HTTPException(status_code=500, detail="Groq API model is not configured.")

    # --- The Master AI Prompt ---
    # We ask the AI to generate everything in one go for efficiency.
    master_prompt = f"""
    You are an expert Indian retail and inventory planning AI for Meesho sellers.
    The seller is located in: {location}.

    Your task is to generate a complete inventory plan. Respond with ONLY a single, valid JSON object. Do not add any text before or after the JSON.
    The JSON object must conform to this exact structure:
    {{
      "upcomingFestivals": [
        {{ "id": 1, "name": "Festival Name", "date": "Month Day", "daysLeft": integer, "urgency": "high/medium/low", "items": ["Item1", "Item2"] }}
      ],
      "topProductsToStock": [
        {{ "id": 1, "name": "Product Name", "demand": "Very High/High/Medium", "profit": "₹XXX", "units": "XX-XX", "trend": "+XX%" }}
      ],
      "nearbyDemand": [
        {{ "id": 1, "area": "Neighborhood Name", "product": "Product Category", "demand": "High/Medium" }}
      ],
      "avoidProducts": [
        {{ "id": 1, "name": "Product to Avoid", "reason": "Reason like 'Seasonal Mismatch'", "suggestion": "Suggestion like 'Wait until October'" }}
      ]
    }}

    Generate 4 upcoming festivals, 5 top products, 3 nearby demand areas, and 3 products to avoid. Ensure the data is realistic and relevant for a seller in {location}.
    """

    try:
        messages = [
            SystemMessage(content="You are an AI that only responds with valid JSON."),
            HumanMessage(content=master_prompt)
        ]
        
        ai_response = model.invoke(messages)
        
        # The AI's response is a JSON string. We need to parse it.
        response_json = json.loads(ai_response.content)

        # Validate the JSON with our Pydantic models and return it.
        return PlannerResponse(**response_json)

    except json.JSONDecodeError:
        print("AI did not return valid JSON.")
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON.")
    except Exception as e:
        print(f"An error occurred in planner endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the planner report.")

