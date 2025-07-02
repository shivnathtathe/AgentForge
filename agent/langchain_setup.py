import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("❌ GEMINI_API_KEY not found in .env")
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash-preview-04-17", google_api_key=api_key)
    