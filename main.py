from fastapi import FastAPI, Request
from pydantic import BaseModel
from agent.tool_registry import load_registry, register_tool, find_tool_match
from agent.tool_generator import generate_tool_code, safe_tool_name, save_tool_file
from agent.run_tool import run_tool
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

registry = load_registry()

class TaskRequest(BaseModel):
    task: str
    args: dict = {}

@app.post("/execute")
async def execute_task(request: TaskRequest):
    task = request.task.strip()
    if not task:
        return {"error": "Empty task."}

    tool_name = find_tool_match(task, registry)
    used_existing = False

    if tool_name:
        tool_meta = registry.get(tool_name, {})
        tool_path = tool_meta.get("path")

        # ✅ Check if file exists
        if tool_path and not os.path.exists(tool_path):
            print(f"⚠️ Tool '{tool_name}' registered but file missing. Recreating...")

            code = generate_tool_code(task)
            tool_path = save_tool_file(tool_name, code)
            register_tool(registry, tool_name, task, tool_path)
        else:
            used_existing = True
    else:
        # ✅ Generate new tool
        code = generate_tool_code(task)
        tool_name = safe_tool_name(task)
        tool_path = save_tool_file(tool_name, code)
        register_tool(registry, tool_name, task, tool_path)

    # ✅ Run the tool
    tool_meta = registry.get(tool_name, {})
    params = tool_meta.get("params", [])
    args = [request.args.get(param["name"], "") for param in params]
    result = run_tool(tool_name, *args)

    return {"tool": tool_name, "result": result, "used_existing": used_existing}

@app.get("/")
def root():
    return {"message": "AgentForge API is running"}



@app.get("/tools")
def get_all_tools():
    registry = load_registry()
    return {"tools": registry}