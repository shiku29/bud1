import os
import google.generativeai as genai
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from PIL import Image
import io
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

router = APIRouter()

# --- API Clients ---
# Configure the Gemini API key
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    pass  # Will be handled gracefully in the endpoint

# Configure the Groq API key
try:
    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except KeyError:
    pass # Will be handled gracefully

# --- Pydantic Models ---
class ProductListing(BaseModel):
    title: str = Field(description="A catchy, SEO-friendly title for the product (around 60-70 characters).")
    description: str = Field(description="A detailed, engaging, and SEO-optimized product description (2-3 paragraphs). Highlight key features and benefits.")
    tags: Optional[List[str]] = Field(None, description="A list of 10-15 relevant tags or keywords for the product.")
    seo_keywords: Optional[List[str]] = Field(None, description="A list of 5-7 primary SEO keywords for search engine ranking.")
    category: str = Field(description="The category of the product.")

class ImprovedContent(BaseModel):
    title: str
    description: str

class ImproveListingRequest(BaseModel):
    title: str
    description: str
    original_listing: ProductListing

class TranslateRequest(BaseModel):
    title: str
    description: str
    language: str

class TranslateResponse(BaseModel):
    title: str
    description: str


# --- API ENDPOINTS ---
@router.post("/", response_model=ProductListing)
async def generate_listing_endpoint(
    description: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...)
):
    """
    Receives product information and an image, analyzes them with a multimodal AI,
    and returns a generated product listing.
    """
    if "GOOGLE_API_KEY" not in os.environ or not os.environ["GOOGLE_API_KEY"]:
        raise HTTPException(
            status_code=500,
            detail="Google API key is not configured. Please set the GOOGLE_API_KEY environment variable."
        )

    # Prepare the image for the model
    image_bytes = await image.read()
    pil_image = Image.open(io.BytesIO(image_bytes))

    # Set up the model
    model = genai.GenerativeModel('gemini-1.5-flash')

    # Construct the detailed prompt
    prompt_parts = [
        "You are an expert product marketer and SEO specialist.",
        "Your task is to create a compelling, SEO-optimized product listing based on the provided image and user description.",
        "Analyze the product in the image carefully. Combine its visual features with the user's description to generate the content.",
        f"User's Product Description: \"{description}\"",
        f"Product Category: \"{category}\"",
        "\n---INSTRUCTIONS---\n",
        "1.  **Title**: Create a catchy, SEO-friendly title. Include the main product name and 1-2 key features or benefits. Keep it around 60-70 characters.",
        "2.  **Description**: Write an engaging 2-3 paragraph description. Start with a hook, describe the product's features and benefits, and end with a call to action. Weave in keywords naturally.",
        "3.  **Tags**: Generate a list of 10-15 relevant tags. Include product type, material, color, use cases, style, and target audience.",
        "4.  **SEO Keywords**: Generate a list of 5-7 primary SEO keywords that are most likely to be used in search queries for this product.",
        "5.  **Category**: Use the provided category.",
        "\nReturn the response ONLY as a valid JSON object with the following keys: 'title', 'description', 'tags', 'seo_keywords', 'category'.",
        "\n---PRODUCT IMAGE---\n",
        pil_image
    ]

    try:
        # Call the model
        response = await model.generate_content_async(prompt_parts)
        # The response from gemini-flash with JSON might be in a markdown block
        # ```json ... ```, so we need to clean it.
        json_text = response.text.strip().lstrip("```json").rstrip("```").strip()
        
        # Parse the JSON string into the Pydantic model
        listing = ProductListing.parse_raw(json_text)
        return listing

    except Exception as e:
        print(f"Error calling Gemini API or parsing response: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate listing. An error occurred with the AI model: {e}"
        )

@router.post("/improve", response_model=ProductListing)
async def improve_listing_endpoint(request: ImproveListingRequest):
    """
    Receives a product listing and uses a text-based AI to improve it.
    """
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API key not configured.")

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert e-commerce copywriter and SEO specialist. "
                        "Your task is to improve the given product title and description. "
                        "Make the title more catchy and the description more persuasive and benefit-oriented. "
                        "Incorporate stronger keywords naturally. "
                        "Respond ONLY with a valid JSON object containing the improved 'title' and 'description'."
                    )
                },
                {
                    "role": "user",
                    "content": f"Improve this listing:\n\nTitle: {request.title}\n\nDescription: {request.description}"
                }
            ],
            model="gemma2-9b-it",
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        
        improved_data = ImprovedContent.parse_raw(chat_completion.choices[0].message.content)
        
        # Combine improved data with original tags and category
        original_listing = request.original_listing
        original_listing.title = improved_data.title
        original_listing.description = improved_data.description
        return original_listing

    except Exception as e:
        print(f"Error calling Groq API or parsing response: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to improve listing: {e}")

@router.post("/translate", response_model=TranslateResponse)
async def translate_listing_endpoint(request: TranslateRequest):
    """
    Translates a product title and description to a specified language.
    """
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API key not configured.")

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert translator specializing in e-commerce and marketing content. "
                        f"Translate the user's text into {request.language}. "
                        "Ensure the translation is accurate, natural, and culturally appropriate for marketing. "
                        "Respond ONLY with a valid JSON object containing the translated 'title' and 'description'."
                    )
                },
                {
                    "role": "user",
                    "content": f"Translate this:\n\nTitle: {request.title}\n\nDescription: {request.description}"
                }
            ],
            model="gemma2-9b-it",
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        
        return TranslateResponse.parse_raw(chat_completion.choices[0].message.content)

    except Exception as e:
        print(f"Error calling Groq API or parsing response: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to translate listing: {e}") 