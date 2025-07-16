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
    """
    Cleans LLM-generated code by removing triple backticks and optional 'python' markers.
    """
    code = raw_code.strip()

    if "```" in code:
        code = re.sub(r"```python\s*", "", code, flags=re.IGNORECASE)
        code = re.sub(r"```", "", code)

    cleaned = code.strip()
    return cleaned

env_keys = get_env_keys()
env_summary = ", ".join(env_keys) if env_keys else "None"

def generate_tool_code(task_description: str) -> str:
    llm = get_llm()
    prompt = f"""
        You're a professional Python developer embedded inside an autonomous AI agent.

        Your task is to write a Python function named `run(...)` that performs the following user-defined task:

        Task: "{task_description}"

        ---

        RULES:

        1. Follow the instruction provided carefully.

        2. Validate each required parameter inside the function:
        - If any parameter is missing or empty, return a message like:
            `"Missing required parameter: 'city'. Please provide a city name."`

        3. If an API key is needed, fetch it using `os.getenv(...)` from the following environment variables:
        {env_summary}

        4. Use a real, publicly accessible API if appropriate. Choose the most suitable free API if the task doesn't mention one.

        5. Make the function return a **clear, helpful message** explaining the result.
        - If the task involves accessing sensitive or system data (like IP address), include a respectful disclaimer in the result.

        6. DO NOT:
        - Include *any* markdown formatting (like ```python, triple backticks, or headings)  write only clean code
        - Include example usage or test calls
        - Print anything — only `return` a user-facing string
        - Output anything other than the final `def run(...)` function
        7. Before generating code check if api is live and working
        ---

        IMPORTANT:
        - Output **only** the valid Python code starting from `def run(...)`.
        - Do **not** include the word `python` or any markdown formatting at the top or anywhere else.

        Now write the `run(...)` function only.
        """
# If the task includes **specific values** (like "Mumbai", "Bitcoin", or "USD"), convert them into function parameters:
#         - Example: "Get weather for Mumbai" → `run(city: str)`
#         - Example: "Price of Bitcoin in USD" → `run(coin: str, currency: str)`

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
        print(f"LLM naming failed: {e}")
        # fallback to original method
        base = task.lower().strip().replace(" ", "_")
        base = re.sub(r"[^a-z0-9_]", "", base) 
        return base[:30]

def save_tool_file(tool_name: str, code: str) -> str:
    path = os.path.join(TOOLS_DIR, f"{tool_name}.py")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    return path
