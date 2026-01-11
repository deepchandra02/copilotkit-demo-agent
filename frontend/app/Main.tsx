"use client";

import { useState } from "react";
import { AssistantCanvas } from "@/components/AssistantCanvas";
import { AgentState } from "@/lib/types";
import {
  useCoAgent,
  useFrontendTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { EmailCard } from "@/components/email";

export default function Main() {
  const [themeColor, setThemeColor] = useState("#6766FC");

  const { state, setState } = useCoAgent<AgentState>({
    name: "sample_agent",
    initialState: {
      messages: [],
      scheduled_events: [],
      sent_emails: [],
      search_results: [],
      proverbs: [],
      logs: [],
    },
  });

  useCopilotChatSuggestions({
    instructions: "Schedule a team meeting for tomorrow at 2pm",
  });

  // 🪁 Frontend Tool: Theme color control
  useFrontendTool({
    name: "setThemeColor",
    parameters: [
      {
        name: "themeColor",
        description: "The theme color to set. Use professional colors for business apps.",
        required: true,
      },
    ],
    handler({ themeColor }) {
      setThemeColor(themeColor);
    },
  });

  // 👥 Human-in-the-Loop: Email Approval
  useHumanInTheLoop({
    name: "send_email",
    description: "Email approval required before sending",
    render: ({ args, status, respond }) => (
      <EmailCard
        recipient={args.recipient}
        subject={args.subject}
        content={args.content}
        themeColor={themeColor}
        status={status}
        onApprove={() => respond?.("approved")}
        onReject={() => respond?.("rejected")}
      />
    ),
  });

  return (
    <>
      <h1 className="flex h-[60px] bg-[#0E103D] text-white items-center px-10 text-2xl font-medium">
        Personal Assistant
      </h1>

      <div
        className="flex flex-1 border"
        style={{ height: "calc(100vh - 60px)" }}
      >
        <div className="flex-1 overflow-hidden">
          <AssistantCanvas
            state={state}
            setState={setState}
            themeColor={themeColor}
          />
        </div>
        <div
          className="w-[500px] h-full flex-shrink-0"
          style={
            {
              "--copilot-kit-background-color": "#E0E9FD",
              "--copilot-kit-secondary-color": "#6766FC",
              "--copilot-kit-separator-color": "#b8b8b8",
              "--copilot-kit-primary-color": "#FFFFFF",
              "--copilot-kit-contrast-color": "#000000",
              "--copilot-kit-secondary-contrast-color": "#000",
            } as any
          }
        >
          <CopilotChat
            className="h-full"
            onSubmitMessage={async (message) => {
              // clear the logs before starting new work
              setState({ ...state, logs: [] });
              await new Promise((resolve) => setTimeout(resolve, 30));
            }}
            labels={{
              initial: "👋 Hi! I'm your personal assistant. I can help you schedule meetings, manage emails, and search documents.",
            }}
          />
        </div>
      </div>
    </>
  );
}
