"""
Supervisor agent that coordinates and routes requests to specialized agents.
"""

from typing import Dict, Any
from langchain_core.messages import BaseMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
# from langchain_openai import AzureChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.types import Command
from datetime import datetime
import os
from dotenv import load_dotenv

from state import AgentState

# Load environment variables
load_dotenv()


class SupervisorAgent:
    """
    Supervisor agent that analyzes requests and routes them to appropriate specialist agents.
    """

    def __init__(self):
        # self.model = AzureChatOpenAI(
        #     azure_deployment=os.getenv("AZURE_OPENAI_MODEL_NAME"),
        #     azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        #     api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        #     api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        # )
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,
            max_output_tokens=2048,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

    async def route_request(
        self, state: AgentState, config: RunnableConfig
    ) -> Command[str]:
        """
        Analyze the user request and route to the most appropriate specialist agent.
        """

        system_message = SystemMessage(
            content=f"""You are an intelligent supervisor coordinating multiple specialist agents in a personal assistant system.
            
            Available specialist agents:
            
            🔵 EMAIL AGENT - For all email-related tasks:
            - Composing and sending emails
            - Managing email workflows
            - Scheduling email delivery
            - Email thread management
            
            🟢 SCHEDULER AGENT - For calendar and event management:
            - Creating calendar events and meetings
            - Finding available time slots
            - Managing participant schedules
            - Sending calendar invitations
            - Handling scheduling conflicts
            
            🟡 RESEARCH AGENT - For information and document tasks:
            - Searching through documents and knowledge bases
            - Analyzing and summarizing content
            - Extracting specific information
            - Comparing multiple sources
            - Creating research reports
            
            Current system state:
            - Active task: {state.get('current_task', 'New request')}
            - Events scheduled: {len(state.get('scheduled_events', []))}
            - Emails processed: {len(state.get('recent_emails', []))}
            - Research items: {len(state.get('research_results', []))}
            - Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            
            ROUTING INSTRUCTIONS:
            Analyze the user's request and determine which specialist agent should handle it.
            For complex requests involving multiple domains, choose the PRIMARY agent needed.
            
            Respond with ONLY the agent name that should handle this request:
            - "email" for email-related tasks
            - "scheduler" for calendar/meeting tasks  
            - "research" for document/information tasks
            
            If the request is unclear or involves coordination, choose the most relevant primary agent."""
        )

        response = await self.model.ainvoke(
            [system_message, *state["messages"]], config
        )

        # Extract agent choice from response
        agent_choice = self.extract_agent_choice(response.content)
        task_description = self.extract_task_from_message(state["messages"][-1])

        return Command(
            goto=f"{agent_choice}_node",
            update={
                "active_agent": agent_choice,
                "current_task": task_description,
                "conversation_context": {
                    "supervisor_reasoning": response.content,
                    "routed_to": agent_choice,
                    "timestamp": datetime.now().isoformat(),
                },
            },
        )

    def extract_agent_choice(self, content: str) -> str:
        """
        Extract the agent choice from supervisor response.
        """
        content_lower = content.lower().strip()

        # Direct matches
        if content_lower.startswith("email"):
            return "email"
        elif content_lower.startswith("scheduler"):
            return "scheduler"
        elif content_lower.startswith("research"):
            return "research"

        # Keyword-based routing as fallback
        if any(
            keyword in content_lower for keyword in ["email", "send", "compose", "mail"]
        ):
            return "email"
        elif any(
            keyword in content_lower
            for keyword in ["schedule", "calendar", "meeting", "event", "appointment"]
        ):
            return "scheduler"
        elif any(
            keyword in content_lower
            for keyword in ["search", "document", "research", "find", "analyze"]
        ):
            return "research"

        # Default to scheduler for general coordination tasks
        return "scheduler"

    def extract_task_from_message(self, message: BaseMessage) -> str:
        """Extract a brief task description from the user message."""
        content = getattr(message, "content", "")
        if len(content) > 100:
            return content[:97] + "..."
        return content
