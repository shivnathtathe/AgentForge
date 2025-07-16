# AgentForge: Self-Evolving AI Agents

**AgentForge** is a research-driven framework for autonomous AI agents that can **create, name, register, and execute tools** at runtime using LLMs.

> Based on the paper: [Autonomous Tool-Creation in AI Agents – Zenodo, 2025](https://doi.org/10.5281/zenodo.15272894)

---

## What It Solves
Traditional AI agents fail when a required tool is missing.

**AgentForge enables LLM-powered agents to:**
- Understand the user's task
- Autonomously write a Python function (`run()`)
- Save it as a callable tool
- Register it to a persistent tool registry
- Reuse it in future tasks

No human needed in the loop.

---

## Why It Matters
In mission-critical environments like:
- 🛰 Aerospace systems
- Emergency diagnostics
- Defense robotics

...agents must solve **unknown tasks in real time**.  
AgentForge gives them the ability to *evolve their own capabilities* on the fly.

---

## Tech Stack
- **LangChain** + **gemini-2.5-flash-preview-04-17 (Google Generative AI)**
- On-the-fly code generation, validation, and registration
- Pythonic execution environment with parameterized tools
- `.env` awareness for API key injection

---

## Project Structure

| Folder | Purpose |
|--------|---------|
| `/agent` | Agent logic, LLM setup, tool creation & execution |
| `/tools` | Auto-generated Python tools (`def run(...)`) |
| `/paper` | Published research (PDF) |
| `.env`   | API keys injected automatically at runtime |

---

## Installation & Usage

AgentForge consists of a **Python backend** and an **Angular frontend**. Follow the steps below to set up both.

---

### Backend (Python)

1. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server**

   ```bash
   uvicorn app:main --reload
   ```

---

### Frontend (Angular UI)

1. **Navigate to the frontend folder**

   ```bash
   cd frontend/agentforge-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the Angular development server**

   ```bash
   ng serve
   ```

4. **Access the app** in your browser:

   ```
   http://localhost:4200
   ```

---

### API Keys

Ensure you have a `.env` file in the root folder with your Gemini or OpenAI API keys:

```
GEMINI_API_KEY=your_gemini_key_here
```

> Tools created at runtime will be stored under the `/tools` folder and automatically registered.

---

### You’re Ready!

Now the AgentForge backend and frontend are up and running. Start giving tasks to your agent — it will analyze the task, generate Python tools if needed, and execute them in real time.

---

## Citation

Tathe, S. (2025). *Autonomous Tool-Creation in AI Agents*.  
Zenodo. [https://doi.org/10.5281/zenodo.15272894](https://doi.org/10.5281/zenodo.15272894)

---

## License
MIT License. Attribution required for academic use and derivative works based on the research concept. See `LICENSE`.

---

> Designed for researchers, builders, and developers who believe agents shouldn’t wait for tools — they should make them.
