# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CopilotKit-powered multi-agent personal assistant system with a LangGraph backend and Next.js frontend. The system uses a supervisor pattern to route user requests to specialized agents (Email, Scheduler, Research) that handle domain-specific tasks.

**Tech Stack:**
- Backend: Python (LangGraph, LangChain, FastAPI)
- Frontend: Next.js 16 + React 19 + TypeScript
- LLM: Google Gemini 2.5 Flash (configurable to Azure OpenAI)
- Integration: CopilotKit for agent-UI communication
- Observability: Arize Phoenix

## Development Commands

### Frontend (Next.js)
All frontend commands run from the `frontend/` directory:

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm start           # Start production server
npm run lint        # Run ESLint
```

### Backend (Python Agent)
All backend commands run from the `agent/` directory:

```bash
cd agent

# Install dependencies (using uv)
uv sync

# Start the FastAPI server
uv run python server.py          # Runs on http://localhost:8123

# Start Phoenix observability server (optional)
uv run python -m phoenix.server.main serve  # Runs on http://localhost:6006

# Test Gemini connection
uv run python test_gemini.py
```

### Full Stack Development
1. Terminal 1: Start the backend agent server from `agent/` directory
2. Terminal 2: Start the frontend dev server from `frontend/` directory
3. Optional Terminal 3: Start Phoenix observability from `agent/` directory

### Environment Variables

**Backend (`agent/.env`):**
- `GOOGLE_API_KEY`: Google Gemini API key (required)
- `PORT`: Agent server port (default: 8000)

**Frontend:**
- `LANGGRAPH_DEPLOYMENT_URL`: URL to LangGraph agent (default: http://localhost:8123)

## Architecture

### Backend Multi-Agent System

The backend follows a **supervisor-worker pattern** implemented with LangGraph:

```
User Request → Supervisor Agent → Routes to → [Email | Scheduler | Research] Agent → END
```

**Key Files:**
- [agent/main_graph.py](agent/main_graph.py) - Defines the LangGraph workflow with StateGraph
- [agent/supervisor.py](agent/supervisor.py) - Supervisor agent that analyzes requests and routes to specialists
- [agent/state.py](agent/state.py) - Shared AgentState schema (extends CopilotKitState)
- [agent/server.py](agent/server.py) - FastAPI server with CopilotKit integration and Phoenix instrumentation

**Specialized Agents:**
- [agent/agents/email_agent.py](agent/agents/email_agent.py) - Handles email composition, sending, scheduling
- [agent/agents/scheduler_agent.py](agent/agents/scheduler_agent.py) - Manages calendar events, meetings, time slots
- [agent/agents/research_agent.py](agent/agents/research_agent.py) - Document search, analysis, summaries

**Agent Pattern:**
Each specialized agent:
1. Defines domain-specific tools using `@tool` decorator
2. Uses `create_agent()` from LangChain with tools, model, and system prompt
3. Has async `process()` method that returns `Command[str]` with updates to shared state
4. Tracks activity (emails sent, events created, research results) in state

### Frontend Architecture

**Key Files:**
- [frontend/app/page.tsx](frontend/app/page.tsx) - Main page with CopilotKit hooks and UI components
- [frontend/app/layout.tsx](frontend/app/layout.tsx) - Root layout with CopilotKit provider
- [frontend/app/api/copilotkit/route.ts](frontend/app/api/copilotkit/route.ts) - API endpoint connecting to LangGraph backend
- [frontend/app/lib/types.ts](frontend/app/lib/types.ts) - TypeScript types matching Python AgentState

**CopilotKit Integration:**
The frontend uses several CopilotKit hooks in [page.tsx](frontend/app/page.tsx:1):
- `useCoAgent()` - Syncs frontend state with backend agent state
- `useRenderToolCall()` - Custom UI rendering for specific tool calls (create_event, send_email, etc.)
- `useHumanInTheLoop()` - Approval workflow for sensitive actions (email sending)
- `useFrontendTool()` - Frontend-only tools (theme color control)

**Component Pattern:**
Components in [frontend/app/components/](frontend/app/components/) accept tool call arguments and theme color, rendering specialized UI cards for:
- [schedule.tsx](frontend/app/components/schedule.tsx) - Calendar events
- [email.tsx](frontend/app/components/email.tsx) - Email composition/sending with approval buttons
- [documents.tsx](frontend/app/components/documents.tsx) - Document search results
- [weather.tsx](frontend/app/components/weather.tsx) - Weather information

### State Management Flow

1. User sends message via CopilotKit sidebar
2. Frontend sends request to [/api/copilotkit](frontend/app/api/copilotkit/route.ts:19)
3. Request forwarded to LangGraph agent at http://localhost:8123
4. Supervisor analyzes request and routes to appropriate agent
5. Specialized agent invokes tools and updates shared state
6. State changes sync back to frontend via `useCoAgent()`
7. Tool calls trigger custom UI via `useRenderToolCall()`

## Testing

The project includes a smoke test workflow at [.github/workflows/smoke.yml](.github/workflows/smoke.yml) that:
- Tests on Ubuntu, Windows, macOS with Node 20/22 and Python 3.12/3.13
- Installs dependencies using uv and npm
- Builds frontend and tests startup
- Runs linting
- Sends Slack notifications on scheduled test failures

## Switching LLM Providers

The code includes commented-out Azure OpenAI configurations. To switch from Gemini to Azure OpenAI:
1. Uncomment Azure imports and model initialization in supervisor.py and agent files
2. Comment out Gemini model initialization
3. Add Azure OpenAI environment variables to `agent/.env`
4. Update all agents (supervisor, email_agent, scheduler_agent, research_agent)

## Important Notes

- The backend uses `MemorySaver` checkpointer for conversation state persistence
- Phoenix observability instruments all LangChain/LangGraph calls automatically
- The supervisor uses keyword-based fallback routing if LLM response is unclear
- All specialized agents return `Command` objects with state updates, not direct responses
- Frontend state schema must match backend `AgentState` for proper synchronization
