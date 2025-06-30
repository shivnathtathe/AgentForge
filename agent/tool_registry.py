# import json
# import os

# REGISTRY_PATH = "agent/tool_registry.json"

# def load_registry():
#     if not os.path.exists(REGISTRY_PATH):
#         with open(REGISTRY_PATH, "w") as f:
#             json.dump({}, f)
#         return {}

#     try:
#         with open(REGISTRY_PATH, "r") as f:
#             return json.load(f)
#     except json.JSONDecodeError:
#         print("⚠️  tool_registry.json is empty or invalid. Reinitializing...")
#         with open(REGISTRY_PATH, "w") as f:
#             json.dump({}, f)
#         return {}

# def save_registry(registry):
#     with open(REGISTRY_PATH, "w") as f:
#         json.dump(registry, f, indent=2)

# def register_tool(registry, name: str, description: str, path: str, params: list = None):
#     registry[name] = {
#         "description": description,
#         "path": path,
#         "params": params or []
#     }
#     save_registry(registry)


# def find_tool_match(task: str, registry) -> str:
#     for name, data in registry.items():
#         if any(word in task.lower() for word in name.lower().split("_")):
#             return name
#     return None



import json
from agent.langchain_setup import get_llm
import os
import ast

REGISTRY_PATH = "agent/tool_registry.json"

def load_registry():
    if not os.path.exists(REGISTRY_PATH):
        with open(REGISTRY_PATH, "w") as f:
            json.dump({}, f)
        return {}

    try:
        with open(REGISTRY_PATH, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print("⚠️  tool_registry.json is empty or invalid. Reinitializing...")
        with open(REGISTRY_PATH, "w") as f:
            json.dump({}, f)
        return {}

def save_registry(registry):
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=2)

def extract_function_params(filepath):
    try:
        with open(filepath, "r") as f:
            source = f.read()
        tree = ast.parse(source)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and node.name == "run":
                return [{"name": arg.arg, "type": "str"} for arg in node.args.args]
    except Exception as e:
        print(f"⚠️ Failed to extract parameters: {e}")
    return []

def register_tool(registry, name: str, description: str, path: str):
    params = extract_function_params(path)
    registry[name] = {
        "description": description,
        "path": path,
        "params": params
    }
    save_registry(registry)



def find_tool_match(task: str, registry) -> str:
    llm = get_llm()
    for name, data in registry.items():
        description = data.get("description", "")
        prompt = f"""
You're an AI that decides if a tool matches a given task.

Task: "{task}"
Tool: "{name}"
Description: "{description}"

Does this tool perform the task? Respond with only YES or NO.
"""
        try:
            response = llm.invoke(prompt)
            answer = response.content.strip().lower()
            if answer.startswith("yes"):
                return name
        except Exception as e:
            print(f"⚠️ LLM matching error: {e}")
            continue

    return None
