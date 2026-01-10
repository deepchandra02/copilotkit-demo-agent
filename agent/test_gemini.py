"""
Simple test script to verify ChatGoogleGenerativeAI works correctly.
"""

import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from env_utils import doublecheck_env, doublecheck_pkgs
from dotenv import load_dotenv


def test_gemini():
    """Test basic ChatGoogleGenerativeAI functionality."""

    print("🧪 Testing ChatGoogleGenerativeAI...")
    print(f"📍 Google API Key present: {bool(os.getenv('GOOGLE_API_KEY'))}")

    try:
        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,
            max_output_tokens=2048,
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )
        print("✅ Model initialized successfully")

        # Test a simple invocation
        messages = [
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="Say 'Hello from Gemini!' and nothing else."),
        ]

        print("🔄 Sending test message...")
        response = model.invoke(messages)

        print(f"✅ Response received: {response.content}")
        print("\n✨ ChatGoogleGenerativeAI is working correctly!")
        return True

    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("💡 Try installing: pip install langchain-google-genai")
        return False

    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"💡 Error type: {type(e).__name__}")

        if "API key" in str(e) or "authentication" in str(e).lower():
            print("💡 Make sure GOOGLE_API_KEY is set in your environment")
            print("💡 Get your API key from: https://aistudio.google.com/")

        return False


if __name__ == "__main__":
    load_dotenv()
    # Check and print results
    print(doublecheck_env(".env"))  # check environmental variables
    success = test_gemini()
    exit(0 if success else 1)
