import os
import json
import calendar
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional

# --- LangChain Imports ---
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# --- Custom Utility Import ---
from backend.utils import get_upcoming_festivals_for_chat

# --- Pydantic Models for Structured JSON Response ---
# These models are now enhanced with detailed descriptions to match the frontend component's needs.

class Festival(BaseModel):
    id: int = Field(description="Unique identifier for the festival.")
    name: str = Field(description="Name of the festival, e.g., 'Diwali'.")
    date: str = Field(description="Date of the festival in 'YYYY-MM-DD' format, e.g., '2024-11-01'.")
    daysLeft: int = Field(description="Number of days remaining until the festival from today.")
    urgency: str = Field(description="Urgency level: 'high', 'medium', or 'low'.")
    items: List[str] = Field(description="List of recommended product categories to stock.")
    expectedSales: str = Field(description="The expected sales volume, e.g., '₹50,000'.")
    preparation: str = Field(description="Current preparation status, e.g., 'Planning Phase'.")
    color: str = Field(description="A hex color code associated with the festival for UI theming.")

class RecommendedProduct(BaseModel):
    id: int = Field(description="Unique identifier for the product.")
    name: str = Field(description="Product name, e.g., 'Silk Saree #B17'.")
    demand: str = Field(description="Demand level: 'Very High', 'High', or 'Medium'.")
    profit: str = Field(description="Profit per unit, e.g., '₹450'.")
    units: str = Field(description="Recommended number of units to stock, e.g., '25-30'.")
    trend: str = Field(description="Sales trend percentage, e.g., '+15%'.")
    yourPrice: str = Field(description="The seller's current price for the item, e.g., '₹1200'.")
    stockLevel: str = Field(description="Current stock level: 'Critical', 'Low', or 'Good'.")
    urgency: str = Field(description="Urgency for action: 'high', 'medium', 'low'.")

class LocalDemand(BaseModel):
    id: int = Field(description="Unique identifier for the location.")
    area: str = Field(description="Name of the area, e.g., 'Koramangala'.")
    product: str = Field(description="Product category in demand, e.g., 'Ethnic Wear'.")
    demand: str = Field(description="Demand level: 'Very High' or 'High'.")
    distance: str = Field(description="Distance from the seller, e.g., '5 km'.")
    avgSpend: str = Field(description="Average customer spend in this area, formatted as a string with the Rupee symbol, e.g., '₹1,500'.")
    shoppers: int = Field(description="Estimated number of shoppers as a raw integer without commas (e.g., 5000).")
    peakHours: str = Field(description="Peak shopping hours, e.g., '6-8 PM'.")

class AvoidProduct(BaseModel):
    id: int = Field(description="Unique identifier for the product to avoid.")
    name: str = Field(description="Name of the product.")
    reason: str = Field(description="Reason to avoid, e.g., 'Seasonal Mismatch'.")
    suggestion: str = Field(description="Suggestion for the seller, e.g., 'Wait until October'.")
    returnRate: str = Field(description="The product's return rate, e.g., '25%'.")
    impact: str = Field(description="The impact of this product, e.g., 'High Inventory Cost'.")
    lossAmount: str = Field(description="Potential loss amount, e.g., '₹5,000'.")

class AIRecommendation(BaseModel):
    id: int = Field(description="Unique identifier for the recommendation.")
    product: str = Field(description="The specific product the recommendation is for, e.g., 'Kurti Set #A32'.")
    action: str = Field(description="The suggested action, e.g., 'Restock 50 units'.")
    priority: str = Field(description="Priority level: 'High', 'Medium', or 'Low'.")
    reason: str = Field(description="The reason for the recommendation, e.g., 'Festival demand spike expected'.")
    confidence: str = Field(description="The AI's confidence level in this recommendation, e.g., '92%'.")
    potentialRevenue: str = Field(description="The potential revenue from this action, e.g., '₹3,500'.")

class PlannerResponse(BaseModel):
    upcomingFestivals: List[Festival]
    topProductsToStock: List[RecommendedProduct]
    nearbyDemand: List[LocalDemand]
    avoidProducts: List[AvoidProduct]
    aiRecommendations: List[AIRecommendation] = Field(description="A list of specific, actionable AI recommendations.")

# --- Router Initialization ---
router = APIRouter()

# --- AI Model Configuration ---
try:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise KeyError("GROQ_API_KEY not found in .env file")
    model = ChatGroq(model='gemma2-9b-it', model_kwargs={"response_format": {"type": "json_object"}})
except Exception as e:
    print(f"Error during Groq configuration in planner: {e}")
    model = None


# --- API Endpoint for Inventory Planner ---
@router.get("/full-report", response_model=PlannerResponse)
async def get_full_planner_report(location: str = "Delhi"):
    if not model:
        raise HTTPException(status_code=500, detail="Groq API model is not configured.")

    try:
        # 1. Fetch real-time festival data using the new centralized utility function
        real_festivals = get_upcoming_festivals_for_prompt()
        if not real_festivals or "No major festivals" in real_festivals:
            print("Warning: Could not fetch real-time festival data. The AI will generate festivals from its own knowledge.")

        # 2. Set up the Pydantic Output Parser
        parser = PydanticOutputParser(pydantic_object=PlannerResponse)

        # 3. Create a prompt template that now includes the real festival data
        prompt_template = PromptTemplate(
            template="""
            You are an expert Indian retail and inventory planning AI for Meesho sellers.
            The seller is located in: {location}.

            Your task is to generate a complete inventory plan as a single, valid JSON object.
            The data should be realistic and relevant for a seller in {location}.
            
            Here is a list of real, upcoming festivals in India: {real_festivals}
            Please use this list as the primary source for the 'upcomingFestivals' section of your response.
            Base the festival 'name' and 'date' fields directly on this list. The date format MUST be 'YYYY-MM-DD'.
            If the list is empty, you can generate festivals based on your own knowledge.

            Generate 4 upcoming festivals, 5 top products, 3 nearby demand areas, 3 products to avoid, and 5 AI-driven recommendations.

            {format_instructions}
            """,
            input_variables=["location", "real_festivals"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        # 4. Create the processing chain
        chain = prompt_template | model | parser
        
        # 5. Invoke the chain with the query
        response = await chain.ainvoke({"location": location, "real_festivals": real_festivals})
        
        # 6. Post-process the response to fix dates and calculate daysLeft accurately
        today = datetime.now().date()
        for festival in response.upcomingFestivals:
            try:
                # The AI provides the date as 'YYYY-MM-DD'. Parse it.
                festival_date_obj = datetime.strptime(festival.date, '%Y-%m-%d').date()
                
                # Recalculate daysLeft for 100% accuracy
                festival.daysLeft = (festival_date_obj - today).days
                
                # Reformat the date string to be more readable for the frontend
                festival.date = festival_date_obj.strftime('%B %d, %Y')
            except (ValueError, TypeError):
                # If date parsing fails, leave the AI's original values to avoid a crash.
                print(f"Could not parse date '{festival.date}' for festival '{festival.name}'. Using original AI values.")
                continue

        return response

    except Exception as e:
        print(f"An error occurred in planner endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the planner report: {e}")

