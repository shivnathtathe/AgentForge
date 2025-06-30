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
    prompt = f"""
Write a Python function named `run()` that performs the following task:

The following environment variables are available in the system (via os.getenv):
{env_summary}

Based on the task below, generate a Python function named `run(...)` that solves the task. 
Use any of the available APIs if relevant.

\"{task_description}\"

- If the task requires input, define parameters in the function signature (e.g., run(city_name)).
- If any API key is needed, fetch it using os.getenv from a .env file.
- Make the response user-friendly and explain what the result means.
- If the task accesses personal or system data (like IP address), add a respectful disclaimer in the result.
- Do not include any markdown formatting like ```python or triple backticks.
- Only return the pure Python code.

Example (for reference only):

def run(param1, param2):
    # logic here
    return str(result)
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
        → get_weather_mumbai
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
