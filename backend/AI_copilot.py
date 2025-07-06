# To run this backend:
# 1. Make sure you are in your backend folder.
# 2. Install necessary libraries: pip install langchain-openai fastapi uvicorn python-dotenv pydantic
# 3. Run the server: uvicorn AI_copilot:app --reload
# AI_copilot.py

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# --- LangChain Imports ---
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# --- Local Imports ---
# This is the new, modular way to handle CORS
from cors_config import setup_cors

# --- Configuration ---
from dotenv import load_dotenv
load_dotenv()

try:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise KeyError("OPENAI_API_KEY not found in .env file")
    model = ChatOpenAI(model='gpt-3.5-turbo')
except Exception as e:
    print(f"Error during OpenAI configuration: {e}")
    model = None

# --- FastAPI App Initialization ---
app = FastAPI()

# --- Setup CORS using the modular function ---
setup_cors(app)

# --- Pydantic Models ---
class ChatPart(BaseModel):
    text: str

class IncomingChatMessage(BaseModel):
    role: str
    parts: List[ChatPart]

class ChatRequest(BaseModel):
    history: List[IncomingChatMessage]
    current_query: str

class ChatResponse(BaseModel):
    reply: str

# --- API Endpoint ---
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_copilot_ai(request: ChatRequest):

    if not model:
        raise HTTPException(status_code=500, detail="OpenAI API model is not configured. Check API key.")

    try:
        system_prompt = """
        You are 'Seller Saathi', a friendly and expert AI assistant for Meesho sellers in India. 
        You speak Hinglish by default. You are an expert on local festivals, cultural events, 
        and weather patterns across India. Your goal is to give simple, actionable advice. 
        When asked a question, respond in a conversational, encouraging tone. 
        Keep your answers concise and easy to understand for a non-technical user.
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

@app.get("/")
def read_root():
    return {"message": "Meesho AI Co-pilot Backend is running!"}
