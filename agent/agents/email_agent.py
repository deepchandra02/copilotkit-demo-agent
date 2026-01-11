"""
Email agent specialized for email composition and management.
"""

from typing import Dict, Any
from langchain.tools import tool
from langchain_core.runnables import RunnableConfig
# from langchain_openai import AzureChatOpenAI
# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langgraph.types import Command
from langgraph.graph import END
from langchain.agents import create_agent
import os
from dotenv import load_dotenv

from state import AgentState

# Load environment variables
load_dotenv()


@tool
def compose_email(recipient: str, subject: str, content: str) -> str:
    """Compose a professional email with proper formatting."""
    return f"📧 Email composed to {recipient} with subject '{subject}'"


@tool
def send_email(recipient: str, subject: str, content: str) -> str:
    """Send an email to the specified recipient."""
    return f"✅ Email sent to {recipient} with subject '{subject}'"


@tool
def schedule_email_send(
    recipient: str, subject: str, content: str, send_time: str
) -> str:
    """Schedule an email to be sent at a specific time."""
    return f"⏰ Email to {recipient} scheduled for {send_time}"


@tool
def manage_email_thread(thread_id: str, action: str) -> str:
    """Manage email threads (mark as read, archive, etc.)."""
    return f"📬 Email thread {thread_id} - action: {action}"


# System prompt for email agent
EMAIL_AGENT_PROMPT = """You are an email management specialist with access to professional email tools.

Your expertise includes:
- Composing professional and effective emails
- Managing email workflows and organization
- Scheduling emails for optimal timing
- Handling email threads and follow-ups
- Ensuring proper email etiquette and formatting

Use your tools to handle email-related requests efficiently and professionally.
Always confirm actions and provide clear status updates."""


class EmailAgent:
    """Agent specialized in email management and communication."""

    def __init__(self):
        self.tools = [
            compose_email,
            send_email,
            schedule_email_send,
            manage_email_thread,
        ]

        # Create Azure OpenAI model
        # model = AzureChatOpenAI(
        #     azure_deployment=os.getenv("AZURE_OPENAI_MODEL_NAME"),
        #     azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        #     api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        #     api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        # )
        model = ChatOpenAI(
            model=os.getenv("LOCAL_MODEL_NAME", "TheBloke/Mistral-7B-Instruct-v0.2-GGUF"),
            temperature=0.7,
            max_tokens=2048,
            base_url=os.getenv("OPENAI_BASE_URL", "http://localhost:1234/v1"),
            api_key=os.getenv("OPENAI_API_KEY", "lm-studio")
        )

        # Create agent using LangChain's create_agent API
        self.agent = create_agent(
            model,
            tools=self.tools,
            state_schema=AgentState,
            system_prompt=EMAIL_AGENT_PROMPT,
        )

    def get_tools(self):
        """Return list of tools for this agent."""
        return self.tools

    async def process(self, state: AgentState, config: RunnableConfig) -> Command[str]:
        """Process email-related requests using the created agent."""

        # Build new logs for this agent's work (don't reuse old logs)
        new_logs = []
        new_logs.append({"message": "📧 Email agent processing request...", "done": False})

        # Invoke the agent with current state
        result = await self.agent.ainvoke(state, config)

        # Track email activity from tool calls if any
        new_emails = list(state.get("recent_emails", []))

        # Extract tool call information from result messages
        if "messages" in result:
            for msg in result["messages"]:
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        tool_name = tool_call.get("name", "unknown")
                        new_logs.append({"message": f"Executing: {tool_name}", "done": True})

                        new_emails.append(
                            {
                                "tool": tool_name,
                                "args": tool_call.get("args", {}),
                                "timestamp": "now",
                            }
                        )

        # Mark email agent processing as complete
        new_logs[0] = {"message": "📧 Email agent processing request...", "done": True}
        new_logs.append({"message": "✅ Email agent completed", "done": True})

        return Command(
            goto=END,
            update={
                "messages": result.get("messages", []),
                "recent_emails": new_emails,
                "logs": new_logs,
            },
        )
