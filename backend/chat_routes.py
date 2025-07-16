# chat_routes.py
import os
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests # Added for weather data
import google.generativeai as genai
from PIL import Image
import io

# --- Custom Utility Import ---
from backend.utils import get_upcoming_festivals_for_chat

# --- LangChain Imports ---
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# --- Configuration ---
from dotenv import load_dotenv
load_dotenv()

# --- Router Initialization ---
router = APIRouter()

# --- AI Model Configuration ---
# Groq for fast text-only chat
try:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise KeyError("GROQ_API_KEY not found in .env file")
    groq_model = ChatGroq(model='gemma2-9b-it')
except Exception as e:
    print(f"Error during Groq configuration in chat: {e}")
    groq_model = None

# Gemini for multimodal chat (image support)
try:
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        raise KeyError("GOOGLE_API_KEY not found in .env file")
    genai.configure(api_key=google_api_key)
    gemini_vision_model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error during Gemini configuration in chat: {e}")
    gemini_vision_model = None


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

class ChatResponse(BaseModel):
    reply: str

# --- API Endpoint for Chat ---
@router.post("/", response_model=ChatResponse)
async def chat_with_copilot_ai(
    current_query: str = Form(...),
    language: str = Form("english"),
    history_str: str = Form("[]"), # History as a JSON string
    image: Optional[UploadFile] = File(None)
):
    
    # --- System Prompt and Context Setup ---
    now = datetime.now()
    current_date_str = now.strftime("%A, %B %d, %Y")
    upcoming_festivals_str = get_upcoming_festivals_for_chat()
    current_season, current_weather = get_season_and_weather()
    
    if language.lower() == 'hindi':
        language_instruction = "You must respond only in Hindi."
    elif language.lower() == 'hinglish':
        language_instruction = "You must respond in Hinglish (a mix of Hindi and English)."
    else: # Default to English
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
    8.  If the user provides an image, analyze it in the context of their query. For example, if they ask to create a product listing, use the image.
    **How to Answer**
    1. Use Current Date, Current Season & Weather, Upcoming Festivals as "ONLY CONTEXT" to answer user's query.
    2. Ask clarifying question to better assist.
    3. You never guess, assume, or provide information that isn't directly stated in "ONLY CONTEXT".
    4. If you do not know, state that you are unable to answer the question politely.
    """

    # --- Model Invocation ---
    try:
        # --- Handle Image Input with Gemini ---
        if image and gemini_vision_model:
            if not image.content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
            
            image_content = await image.read()
            img = Image.open(io.BytesIO(image_content))
            
            # Gemini works with a list of content parts [text, image]
            prompt_parts = [current_query, img]
            
            response = gemini_vision_model.generate_content(prompt_parts)
            ai_text = response.text

        # --- Handle Text-Only Input with Groq ---
        elif not image and groq_model:
            # History needs to be parsed from the JSON string
            import json
            history_list = json.loads(history_str)
            
            langchain_messages = [SystemMessage(content=system_prompt)]
            for message_data in history_list:
                # Assuming history_list is a list of dicts like {'role': 'user', 'parts': [{'text': '...'}]}
                message = IncomingChatMessage(**message_data)
                content = message.parts[0].text
                if message.role.lower() == 'user':
                    langchain_messages.append(HumanMessage(content=content))
                elif message.role.lower() in ['model', 'bot']:
                    langchain_messages.append(AIMessage(content=content))
            
            langchain_messages.append(HumanMessage(content=current_query))
            
            ai_response = groq_model.invoke(langchain_messages)
            ai_text = ai_response.content if ai_response.content else "Sorry, I couldn't process that. Please try again."

        else:
            # Handle case where no model is available
            raise HTTPException(status_code=500, detail="No AI model is configured or available.")

        return ChatResponse(reply=ai_text)

    except Exception as e:
        print(f"An error occurred in chat_with_copilot_ai: {e}")
        # Consider more specific error handling here
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the AI request: {str(e)}")

