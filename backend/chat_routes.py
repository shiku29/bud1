# chat_routes.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import requests # Added for weather data

# --- Custom Utility Import ---
from utils import get_upcoming_festivals_for_chat

# --- LangChain Imports ---
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# --- Configuration ---
from dotenv import load_dotenv
load_dotenv()

# --- Router Initialization ---
router = APIRouter()

# --- AI Model Configuration ---
try:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise KeyError("GROQ_API_KEY not found in .env file")
    model = ChatGroq(model='gemma2-9b-it')
except Exception as e:
    print(f"Error during Groq configuration in chat: {e}")
    model = None

# --- Helper Functions ---
def get_season_and_weather():
    """Determines the current Indian season and fetches weather from OpenWeatherMap."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return "Weather data is unavailable.", "Season data is unavailable."

    # Determine season based on month
    month = datetime.now().month
    if month in [12, 1, 2]:
        season = "Winter"
    elif month in [3, 4, 5]:
        season = "Summer"
    elif month in [6, 7, 8, 9]:
        season = "Monsoon"
    else: # 10, 11
        season = "Post-Monsoon (Autumn)"
    
    # Fetch weather for New Delhi, India
    try:
        # Note: Using lat/lon is more reliable than city name
        lat, lon = 28.6139, 77.2090
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url)
        response.raise_for_status() # Raise an exception for bad status codes
        data = response.json()
        
        description = data['weather'][0]['description']
        temp = data['main']['temp']
        weather_summary = f"Current weather in New Delhi: {description} with a temperature of {temp}°C."
        return season, weather_summary
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return season, "Could not retrieve weather data."
    except KeyError:
        return season, "Could not parse weather data."


# --- Pydantic Models for Chat ---
class ChatPart(BaseModel):
    text: str

class IncomingChatMessage(BaseModel):
    role: str
    parts: List[ChatPart]

class ChatRequest(BaseModel):
    history: List[IncomingChatMessage]
    current_query: str
    language: str = "hinglish" # Add language field with a default

class ChatResponse(BaseModel):
    reply: str

# --- API Endpoint for Chat ---
# Note the path is now just "/" because the prefix is handled in main.py
@router.post("/", response_model=ChatResponse)
async def chat_with_copilot_ai(request: ChatRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Groq API model is not configured.")

    try:
        # Get and format the current date to provide real-time context to the AI
        now = datetime.now()
        current_date_str = now.strftime("%A, %B %d, %Y")
        # print(f"--- current_date ---\n{current_date_str}\n--------------------------") # Debug print
        upcoming_festivals_str = get_upcoming_festivals_for_chat()
        # print(f"--- UPCOMING FESTIVALS ---\n{upcoming_festivals_str}\n--------------------------") # Debug print
        current_season, current_weather = get_season_and_weather()
        # print(f"--- WEATHER ---\n{current_season, current_weather}\n--------------------------") # Debug print


        language_instruction = "You must respond in Hinglish (a mix of Hindi and English)."
        if request.language:
            if request.language.lower() == 'hindi':
                language_instruction = "You must respond only in Hindi."
            elif request.language.lower() == 'english':
                language_instruction = "You must respond only in English."

        system_prompt = f"""
        You are 'Seller Saathi', a friendly and expert AI assistant for Meesho sellers in India.

        **Your Instructions**
        1.  **Current Date**: The current date is **{current_date_str}**.
        2.  **Current Season & Weather**: It is currently **{current_season}** in India. {current_weather}
        3.  **Upcoming Festivals**: Here are the upcoming Indian festivals for the next 90 days:
            {upcoming_festivals_str}
        4.  **Language**: {language_instruction}
        5.  **Persona**: Be friendly, conversational, and encouraging.
        6.  **Goal**: Give simple, actionable advice about local festivals, cultural events, and weather patterns across India to help sellers.
        7.  **Conciseness**: Keep your answers short and easy to understand for a non-technical user.

        **How to Answer**
        1. Use Current Date, Current Season & Weather, Upcoming Festivals as "ONLY CONTEXT" to answer user's query.
        2. Ask clarifying question to better assist.
        3. You never guess, assume, or provide information that isn't directly stated in "ONLY CONTEXT".
        4. If you do not know, state that you are unable to answer the question politely.
        """
        
        langchain_messages = [SystemMessage(content=system_prompt)]

        for message in request.history:
            content = message.parts[0].text
            if message.role.lower() == 'user':
                langchain_messages.append(HumanMessage(content=content))
            elif message.role.lower() == 'model' or message.role.lower() == 'bot':
                langchain_messages.append(AIMessage(content=content))
        
        langchain_messages.append(HumanMessage(content=request.current_query))
        
        ai_response = model.invoke(langchain_messages)
        
        ai_text = "Sorry, I couldn't process that. Please try again."
        if ai_response.content:
            ai_text = ai_response.content

        return ChatResponse(reply=ai_text)

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the AI request.")

