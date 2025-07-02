import importlib.util
import os

def run_tool(tool_name: str, *args):
    tool_path = f"tools/{tool_name}.py"
    if not os.path.exists(tool_path):
        return f"Tool '{tool_name}' not found."

    spec = importlib.util.spec_from_file_location(tool_name, tool_path)
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
        if hasattr(mod, "run"):
            return mod.run(*args)
        else:
            return f"Tool '{tool_name}' does not define a `run()` function."
    except Exception as e:
        return f"Error running tool '{tool_name}': {e}"
