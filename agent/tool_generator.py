# agent/tool_generator.py

import os
import re
from agent.langchain_setup import get_llm
from dotenv import dotenv_values

TOOLS_DIR = "tools"
os.makedirs(TOOLS_DIR, exist_ok=True)

def get_env_keys() -> list[str]:
    env = dotenv_values(".env")
    return list(env.keys())

def clean_code(raw_code: str) -> str:
    code = raw_code.strip()
    if "```" in code:
        code = code.split("```")[1]  
    return code.strip()

env_keys = get_env_keys()
env_summary = ", ".join(env_keys) if env_keys else "None"

def generate_tool_code(task_description: str) -> str:
    llm = get_llm()
#     prompt = f"""
# Write a Python function named `run()` that performs the following task:

# The following environment variables are available in the system (via os.getenv):
# {env_summary}

# Based on the task below, generate a Python function named `run(...)` that solves the task. 
# Use any of the available APIs if relevant.

# \"{task_description}\"

# - If the task requires input, define parameters in the function signature (e.g., run(city_name)).
# - If any API key is needed, fetch it using os.getenv from a .env file.
# - Make the response user-friendly and explain what the result means.
# - If the task accesses personal or system data (like IP address), add a respectful disclaimer in the result.
# - Do not include any markdown formatting like ```python or triple backticks.
# - Only return the pure Python code.

# Example (for reference only):

# def run(param1, param2):
#     # logic here
#     return str(result)
# """
#     prompt = f"""
# You're an expert Python developer embedded in an autonomous AI agent.

# Your task is to write a Python function named `run(...)` that accomplishes the following user-described task:

# Task: "{task_description}"

# ---

# 📌 RULES:

# 1. 🧠 If the task mentions **specific values** (like "Mumbai", "Bitcoin", "USD"), turn them into **function parameters**.
#    - E.g., "weather in Mumbai" → `run(city: str)`
#    - E.g., "price of Bitcoin in USD" → `run(coin: str, currency: str)`

# 2. 🔑 If any API key is needed, fetch it using `os.getenv` from available environment variables:
# {env_summary}

# 3. 🧪 Use real, publicly available APIs when needed.

# 4. 🤝 Make the response user-friendly and explain what the result means. Include disclaimers for personal/system data.

# 5. ❌ DO NOT:
#    - Include any Markdown (e.g., ```python)
#    - Include example calls
#    - Include anything outside the final function

# ---

# ✳️ Output only the Python code for a `run(...)` function.
# """
    prompt = f"""
You're a professional Python developer embedded inside an autonomous AI agent.

Your task is to write a `run(...)` function that performs the following task:

Task: "{task_description}"

---

📌 RULES:

1. 🧠 If the task includes **specific values** (like "Mumbai", "Bitcoin", or "USD"), convert them into parameters of the function:
   - E.g. "Get weather for Mumbai" → `run(city: str)`
   - E.g. "Price of Bitcoin in USD" → `run(coin: str, currency: str)`

2. 🛡️ In the function, validate each required parameter:
   - If any parameter is missing or empty, return a helpful string like:
     `"Missing required parameter: 'city'. Please provide a city name."`

3. 🔐 If any API key is required, load it using `os.getenv()` from this list of available environment variables:
{env_summary}

4. 🔍 Use real public APIs if necessary. If no specific API is mentioned, choose a relevant free API.

5. 🧾 Your result must be a friendly and helpful string that explains what the result means.
   - If using location, system, or personal data (like IP address), add a polite disclaimer.

6. 🚫 DO NOT:
   - Include markdown (no ```python)
   - Include test calls or usage examples
   - Print anything — only return a string
   - Wrap the function in extra explanations or output anything except the final function code

---
7. important:
 - Do not include any markdown formatting like ```python or triple backticks.
 - Only return the pure Python code.
 
✳️ Output ONLY the Python function definition `def run(...)`.
"""


    response = llm.invoke(prompt)
    return clean_code(response.content)

def safe_tool_name(task: str) -> str:
    """
    Uses LLM to generate a short, Pythonic tool name from a task description.
    Returns snake_case, lowercase, <=30 characters.
    """
    llm = get_llm()
    
    prompt = f"""
        You're a smart Python developer. Given the task below, generate a clean, meaningful, snake_case name 
        for a function or tool that would implement it. Keep it under 30 characters.

        Task: "{task}"

        Respond with ONLY the name, no quotes, no comments.
        Example:
        Task: "Fetch current weather for Mumbai"
        → get_weather
        """
    try:
        response = llm.invoke(prompt)
        name = response.content.strip().split()[0]  # just in case LLM adds extras
        name = re.sub(r"[^a-z0-9_]", "", name.lower())  # cleanup
        return name[:30]  # enforce max length
    except Exception as e:
        print(f"⚠️ LLM naming failed: {e}")
        # fallback to original method
        base = task.lower().strip().replace(" ", "_")
        base = re.sub(r"[^a-z0-9_]", "", base) 
        return base[:30]
    # base = task.lower().strip().replace(" ", "_")
    # base = re.sub(r"[^a-z0-9_]", "", base) 
    # return base[:30] 

def save_tool_file(tool_name: str, code: str) -> str:
    path = os.path.join(TOOLS_DIR, f"{tool_name}.py")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    return path
