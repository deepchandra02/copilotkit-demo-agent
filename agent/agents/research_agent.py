"""
Research agent specialized for document search and knowledge management.
"""

from typing import Dict, Any
from langchain.tools import tool
from langchain_core.runnables import RunnableConfig
# from langchain_openai import AzureChatOpenAI
# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
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
def search_documents(query: str, category: str = "all", limit: int = 10) -> str:
    """Search through document database for relevant information."""
    return f"🔍 Found {limit} documents matching '{query}' in category '{category}'"


@tool
def analyze_document(doc_id: str, focus_areas: str = "summary") -> str:
    """Analyze and extract insights from a specific document."""
    return f"📊 Analysis complete for document {doc_id} focusing on: {focus_areas}"


@tool
def create_research_summary(doc_ids: str, summary_type: str = "comprehensive") -> str:
    """Create a summary report from multiple documents."""
    return f"📝 {summary_type} summary created from documents: {doc_ids}"


@tool
def extract_key_information(text: str, information_type: str = "facts") -> str:
    """Extract specific types of information from text."""
    return f"🎯 Extracted {information_type} from provided text"


@tool
def compare_documents(doc1_id: str, doc2_id: str, comparison_criteria: str) -> str:
    """Compare two documents based on specified criteria."""
    return f"⚖️ Comparison complete between {doc1_id} and {doc2_id} on: {comparison_criteria}"


# System prompt for research agent
RESEARCH_AGENT_PROMPT = """You are a research and knowledge management specialist with advanced analytical capabilities.

Your expertise includes:
- Searching and retrieving relevant documents from knowledge bases
- Analyzing documents for key insights and patterns
- Synthesizing information from multiple sources
- Creating comprehensive summaries and reports
- Extracting specific information types (facts, figures, conclusions)
- Comparing and contrasting different documents or sources
- Organizing research findings for easy consumption

Use your research tools to provide thorough and accurate information.
Always cite sources and provide clear, well-organized findings."""


class ResearchAgent:
    """Agent specialized in research, document analysis, and knowledge management."""

    def __init__(self):
        self.tools = [
            search_documents,
            analyze_document,
            create_research_summary,
            extract_key_information,
            compare_documents,
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
            system_prompt=RESEARCH_AGENT_PROMPT,
        )

    def get_tools(self):
        """Return list of tools for this agent."""
        return self.tools

    async def process(self, state: AgentState, config: RunnableConfig) -> Command[str]:
        """Process research and document analysis requests using the created agent."""

        # Build new logs for this agent's work (don't reuse old logs)
        new_logs = []
        new_logs.append({"message": "🔍 Research agent processing request...", "done": False})

        # Invoke the agent with current state
        result = await self.agent.ainvoke(state, config)

        # Track research activity from tool calls if any
        new_research = list(state.get("research_results", []))

        # Extract tool call information from result messages
        if "messages" in result:
            for msg in result["messages"]:
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        tool_name = tool_call.get("name", "unknown")
                        args = tool_call.get("args", {})
                        new_logs.append({"message": f"Executing: {tool_name}", "done": True})

                        new_research.append(
                            {
                                "tool": tool_name,
                                "query": args.get("query", ""),
                                "category": args.get("category", "general"),
                                "timestamp": datetime.now().isoformat(),
                                "status": "completed",
                            }
                        )

        # Mark research agent processing as complete
        new_logs[0] = {"message": "🔍 Research agent processing request...", "done": True}
        new_logs.append({"message": "✅ Research agent completed", "done": True})

        return Command(
            goto=END,
            update={
                "messages": result.get("messages", []),
                "research_results": new_research,
                "logs": new_logs,
            },
        )
