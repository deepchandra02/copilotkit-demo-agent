"""
CopilotKit-compatible multi-agent system with specialized agents.
This orchestrates a supervisor agent that coordinates email, scheduling, and research specialists.
"""

from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from state import AgentState
from supervisor import SupervisorAgent
from agents.email_agent import EmailAgent
from agents.scheduler_agent import SchedulerAgent
from agents.research_agent import ResearchAgent
from langgraph.checkpoint.memory import MemorySaver

# Load environment variables from .env file
load_dotenv()


# Initialize all agents
supervisor = SupervisorAgent()
email_agent = EmailAgent()
scheduler_agent = SchedulerAgent()
research_agent = ResearchAgent()

# Define the workflow graph
workflow = StateGraph(AgentState)

# Add agent nodes only - tools are called within agents
workflow.add_node("supervisor_node", supervisor.route_request)
workflow.add_node("email_node", email_agent.process)
workflow.add_node("scheduler_node", scheduler_agent.process)
workflow.add_node("research_node", research_agent.process)

# Direct agent-to-END flow (tools called internally)
workflow.add_edge("email_node", END)
workflow.add_edge("scheduler_node", END)
workflow.add_edge("research_node", END)

# Set supervisor as the entry point
workflow.set_entry_point("supervisor_node")

# Compile the graph for execution
# Add checkpointer before compiling
checkpointer = MemorySaver()
graph = workflow.compile(checkpointer=checkpointer)
# graph = workflow.compile()
