# Use GET http://127.0.0.1:8000/api/trends/full-trends-report?category=sarees in frontend 
import os
import json
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

# --- LangChain Imports ---
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

# --- Pydantic Models for Structured JSON Response ---
# These models define the exact structure for the Trends & Insights page data.
class PersonalizedInsight(BaseModel):
    location: str
    trend: str
    change: str
    type: str
    message: str
    action: str

class CategoryDataPoint(BaseModel):
    period: str
    searches: int
    purchases: int
    events: Optional[str] = None

class Hotspot(BaseModel):
    area: str
    pincode: str
    city: str
    product: str
    trend: str

class TrendingProduct(BaseModel):
    product: str
    trend: str
    avgPrice: str
    action: str
    similarity: int

class ReturnedProduct(BaseModel):
    product: str
    returnRate: str
    mainReason: str
    suggestion: str

class TrendsResponse(BaseModel):
    personalizedInsights: List[PersonalizedInsight]
    categoryData: List[CategoryDataPoint]
    hotspots: List[Hotspot]
    trendingProducts: List[TrendingProduct]
    returnedProducts: List[ReturnedProduct]

# --- Router Initialization ---
router = APIRouter()

# --- AI Model Configuration ---
try:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise KeyError("GROQ_API_KEY not found in .env file")
    
    # --- FIX: Enable JSON Mode ---
    # This forces the model to output a valid JSON object, which is more reliable.
    model = ChatGroq(
        model='gemma2-9b-it',
        model_kwargs={"response_format": {"type": "json_object"}}
    )
except Exception as e:
    print(f"Error during Groq configuration in trends: {e}")
    model = None

# --- API Endpoint for Trends & Insights ---
@router.get("/full-trends-report", response_model=TrendsResponse)
async def get_full_trends_report(location: str = "Delhi", category: str = "Kurtis"):
    """
    Generates a full, comprehensive report for the Trends & Insights page.
    This single endpoint provides all the data needed for the UI based on location and category.
    """
    if not model:
        raise HTTPException(status_code=500, detail="Groq API model is not configured.")

    # --- The Master AI Prompt for Trends ---
    master_prompt = f"""
    You are an expert Indian e-commerce trend analyst for Meesho sellers.
    The seller's primary location is {location} and they are currently analyzing the {category} category.

    Your task is to generate a complete trends and insights report. Respond with ONLY a single, valid JSON object. Do not add any text before or after the JSON.
    The JSON object must conform to this exact structure:
    {{
      "personalizedInsights": [
        {{ "location": "string", "trend": "string", "change": "string", "type": "string", "message": "string", "action": "string" }}
      ],
      "categoryData": [
        {{ "period": "string", "searches": "integer", "purchases": "integer", "events": "string or null" }}
      ],
      "hotspots": [
        {{ "area": "string", "pincode": "string", "city": "string", "product": "string", "trend": "string" }}
      ],
      "trendingProducts": [
        {{ "product": "string", "trend": "string", "avgPrice": "string", "action": "string", "similarity": "integer" }}
      ],
      "returnedProducts": [
        {{ "product": "string", "returnRate": "string", "mainReason": "string", "suggestion": "string" }}
      ]
    }}

    Generate realistic data for a seller in {location} analyzing {category}. Create 3 personalized insights, 5 weeks of category data, 4 hotspots, 4 trending products, and 3 returned products.
    """

    try:
        messages = [
            # We no longer need the "You are an AI that only responds with valid JSON" message
            # because we are using the model's JSON mode.
            HumanMessage(content=master_prompt)
        ]
        
        ai_response = model.invoke(messages)
        
        response_json = json.loads(ai_response.content)

        return TrendsResponse(**response_json)

    except json.JSONDecodeError as e:
        print(f"AI did not return valid JSON, even in JSON mode. Error: {e}")
        print(f"Raw AI response: {ai_response.content}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON.")
    except Exception as e:
        print(f"An error occurred in trends endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the trends report.")

