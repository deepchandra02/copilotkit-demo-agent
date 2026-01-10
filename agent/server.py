import os

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from fastapi import FastAPI

# from langgraph.graph import END, START, MessagesState, StateGraph
# from langgraph.checkpoint.memory import MemorySaver
# from langchain_core.messages import SystemMessage
# from langchain_openai import ChatOpenAI
# from langchain_openai import AzureChatOpenAI
import uvicorn
from dotenv import load_dotenv
from main_graph import graph

# Phoenix observability imports
from openinference.instrumentation.langchain import LangChainInstrumentor
from phoenix.otel import register

load_dotenv()

# Set up Phoenix observability
# Set the Phoenix collector endpoint via environment variable
# uv run python -m phoenix.server.main serve
os.environ["PHOENIX_COLLECTOR_ENDPOINT"] = "http://localhost:6006"

# Register and instrument
# Note: LangChainInstrumentor will capture LLM calls within LangGraph nodes
tracer_provider = register()
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)

# async def mock_llm(state: MessagesState):
#   print(os.getenv("AZURE_OPENAI_API_KEY"))
#   model = AzureChatOpenAI(
#             azure_deployment=os.getenv("AZURE_OPENAI_MODEL_NAME"),
#             azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
#             api_key=os.getenv("AZURE_OPENAI_API_KEY"),
#             api_version=os.getenv("AZURE_OPENAI_API_VERSION")
#         )
# #   model = ChatOpenAI(model="gpt-4.1-mini")
#   system_message = SystemMessage(content="You are a helpful assistant.")
#   response = await model.ainvoke(
#     [
#       system_message,
#       *state["messages"],
#     ]
#   )
#   return {"messages": response}

# graph = StateGraph(MessagesState)
# graph.add_node(mock_llm)
# graph.add_edge(START, "mock_llm")
# graph.add_edge("mock_llm", END)
# graph = graph.compile()


app = FastAPI()

add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="multi_agent_supervisor",
        description="A multi-agent system with supervisor routing to email, scheduler, and research agents",
        graph=graph,
    ),
    path="/",
)


def main():
    """Run the uvicorn server."""
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8123,
        reload=True,
    )


if __name__ == "__main__":
    main()
