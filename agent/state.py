"""
Shared state definition for all agents in the multi-agent system.
"""

from typing import List, Dict, Any
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    """
    Unified state shared across all agents in the system.
    """

    current_task: str = ""
    active_agent: str = "supervisor"
    scheduled_events: List[Dict[str, Any]] = []
    recent_emails: List[Dict[str, Any]] = []
    research_results: List[Dict[str, Any]] = []
    conversation_context: Dict[str, Any] = {}
    logs: List[Dict[str, Any]] = []
