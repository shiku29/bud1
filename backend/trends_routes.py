import os
import json
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional

# --- LangChain Imports ---
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser


# --- Pydantic Models for Structured JSON Response ---
# These models define the exact structure for the Trends & Insights page data.
# Added descriptions (Field) to help the AI understand the data better.
class PersonalizedInsight(BaseModel):
    location: str = Field(description="The geographical area for the insight, e.g., 'Jaipur'")
    trend: str = Field(description="The specific product or trend being analyzed")
    change: str = Field(description="The percentage change, e.g., '+32%' or '-15%'")
    type: str = Field(description="The type of insight, e.g., 'opportunity', 'warning', 'trending', or 'seasonal'")
    message: str = Field(description="A concise, actionable message for the seller")
    action: str = Field(description="A short call to action, e.g., 'Promote Now'")

class CategoryDataPoint(BaseModel):
    period: str = Field(description="The time period for the data point, e.g., 'Week 1'")
    searches: int = Field(description="The number of searches for the category in this period")
    purchases: int = Field(description="The number of purchases for the category in this period")
    events: Optional[str] = Field(description="Any notable event during this period, e.g., 'Diwali Prep'", default=None)

class Hotspot(BaseModel):
    area: str = Field(description="The specific neighborhood or area of the hotspot")
    pincode: str = Field(description="The postal PIN code for the area, formatted as a JSON string (e.g., \"110001\")")
    city: str = Field(description="The city of the hotspot")
    product: str = Field(description="The product category that is in high demand")
    trend: str = Field(description="The direction of the trend as a single word: 'up', 'down', or 'stable'")
    activity: int = Field(description="A numeric score from 1 to 100 representing the demand intensity or sales volume.")

class TrendingProduct(BaseModel):
    product: str = Field(description="The name of the trending product")
    trend: str = Field(description="The trend percentage, e.g., '+32%'")
    avgPrice: str = Field(description="The average selling price, e.g., '₹799'")
    action: str = Field(description="A suggested action, e.g., 'Promote Now'")
    similarity: int = Field(description="A percentage similarity score to the seller's inventory")

class ReturnedProduct(BaseModel):
    product: str = Field(description="The name of the product with a high return rate")
    returnRate: str = Field(description="The return rate percentage, e.g., '18%'")
    mainReason: str = Field(description="The primary reason for returns")
    suggestion: str = Field(description="An actionable suggestion to reduce returns")

class TrendsResponse(BaseModel):
    personalizedInsights: List[PersonalizedInsight] = Field(description="A list of personalized insights for the seller")
    categoryData: List[CategoryDataPoint] = Field(description="A list of data points for the category performance chart")
    hotspots: List[Hotspot] = Field(description="A list of demand hotspots")
    trendingProducts: List[TrendingProduct] = Field(description="A list of trending products relevant to the seller")
    returnedProducts: List[ReturnedProduct] = Field(description="A list of products with high return rates")

# --- Router Initialization ---
router = APIRouter()

# --- AI Model Configuration ---
try:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise KeyError("GROQ_API_KEY not found in .env file")
    
    model = ChatGroq(model='gemma2-9b-it', model_kwargs={"response_format": {"type": "json_object"}})
except Exception as e:
    print(f"Error during Groq configuration in trends: {e}")
    model = None

# --- API Endpoint for Trends & Insights ---
@router.get("/full-trends-report", response_model=TrendsResponse)
async def get_full_trends_report(location: str = "Delhi", category: str = "Kurtis"):
    if not model:
        raise HTTPException(status_code=500, detail="Groq API model is not configured.")

    try:
        # 1. Set up the Pydantic Output Parser
        parser = PydanticOutputParser(pydantic_object=TrendsResponse)

        # 2. Create a prompt template that includes the format instructions
        prompt_template = PromptTemplate(
            template="""
            You are an expert Indian e-commerce trend analyst for Meesho sellers.
            The seller's primary location is {location} and they are analyzing the {category} category.

            Your task is to generate a complete trends and insights report.
            Generate realistic data for a seller in {location} analyzing {category}.
            Create 3 personalized insights, 5 weeks of category data, 4 hotspots, 4 trending products, and 3 returned products.

            {format_instructions}
            """,
            input_variables=["location", "category"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        # 3. Create the processing chain
        chain = prompt_template | model | parser
        
        # 4. Invoke the chain with the query
        response = await chain.ainvoke({"location": location, "category": category})
        
        return response

    except Exception as e:
        print(f"An error occurred in trends endpoint: {e}")
        # This will now catch errors from the parser if the AI fails to generate a valid object
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the trends report: {e}")

