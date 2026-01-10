"""
Scheduler agent specialized for calendar and event management.
"""

from typing import Dict, Any
from langchain.tools import tool
from langchain_core.runnables import RunnableConfig
# from langchain_openai import AzureChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.types import Command
from langgraph.graph import END
from datetime import datetime
from langchain.agents import create_agent
import os
from dotenv import load_dotenv

from state import AgentState

# Load environment variables
load_dotenv()


@tool
def create_event(
    title: str, date: str, time: str, duration: str, participants: str
) -> str:
    """Create a calendar event with specified details."""
    return f"📅 Event '{title}' created for {date} at {time} ({duration}) with {participants}"


@tool
def find_available_slots(date: str, duration: str, participants: str) -> str:
    """Find available time slots for scheduling meetings."""
    return f"🔍 Available {duration} slots found for {date} with {participants}"


@tool
def send_calendar_invites(event_id: str, participants: str, message: str = "") -> str:
    """Send calendar invites to meeting participants."""
    return f"📨 Calendar invites sent for event {event_id} to {participants}"


@tool
def reschedule_event(event_id: str, new_date: str, new_time: str) -> str:
    """Reschedule an existing event to a new date and time."""
    return f"🔄 Event {event_id} rescheduled to {new_date} at {new_time}"


@tool
def check_calendar_conflicts(date: str, time: str, participants: str) -> str:
    """Check for scheduling conflicts with participants."""
    return f"✅ No conflicts found for {date} at {time} with {participants}"


# System prompt for scheduler agent
SCHEDULER_AGENT_PROMPT = """You are a calendar and scheduling specialist with advanced event management capabilities.

Your expertise includes:
- Creating and managing calendar events
- Finding optimal meeting times across multiple schedules
- Coordinating with multiple participants
- Handling complex scheduling scenarios and conflicts
- Managing recurring events and meeting series
- Sending professional calendar invitations

Use your scheduling tools to efficiently manage calendar operations.
Always check for conflicts and provide clear scheduling confirmations."""


class SchedulerAgent:
    """Agent specialized in calendar management and event scheduling."""

    def __init__(self):
        self.tools = [
            create_event,
            find_available_slots,
            send_calendar_invites,
            reschedule_event,
            check_calendar_conflicts,
        ]

        # Create Azure OpenAI model
        # model = AzureChatOpenAI(
        #     azure_deployment=os.getenv("AZURE_OPENAI_MODEL_NAME"),
        #     azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        #     api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        #     api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        # )
        model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,
            max_output_tokens=2048,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        # Create agent using LangChain's create_agent API
        self.agent = create_agent(
            model,
            tools=self.tools,
            state_schema=AgentState,
            system_prompt=SCHEDULER_AGENT_PROMPT,
        )

    def get_tools(self):
        """Return list of tools for this agent."""
        return self.tools

    async def process(self, state: AgentState, config: RunnableConfig) -> Command[str]:
        """Process scheduling and calendar-related requests using the created agent."""

        # Invoke the agent with current state
        result = await self.agent.ainvoke(state, config)

        # Track scheduling activity from tool calls if any
        new_events = list(state.get("scheduled_events", []))

        # Extract tool call information from result messages
        if "messages" in result:
            for msg in result["messages"]:
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        if tool_call.get("name") == "create_event":
                            args = tool_call.get("args", {})
                            new_events.append(
                                {
                                    "title": args.get("title", "New Event"),
                                    "date": args.get("date", "TBD"),
                                    "time": args.get("time", "TBD"),
                                    "participants": args.get("participants", ""),
                                    "duration": args.get("duration", "1 hour"),
                                    "timestamp": datetime.now().isoformat(),
                                }
                            )

        return Command(
            goto=END,
            update={
                "messages": result.get("messages", []),
                "scheduled_events": new_events,
            },
        )
