"use client";
import { useState } from "react";
import { CopilotSidebar, CopilotKitCSSProperties } from "@copilotkit/react-ui";
import {
  useCoAgent,
  useFrontendTool,
  useHumanInTheLoop,
  useRenderToolCall,
} from "@copilotkit/react-core";

// Import components
import { ScheduleCard } from "@/components/schedule";
import { EmailCard } from "@/components/email";
import { DocumentCard } from "@/components/documents";
import { WeatherCard } from "@/components/weather";
// import { MoonCard } from "@/components/moon";
// import { ProverbsCard } from "@/components/proverbs";
import { AgentState } from "@/lib/types";

export default function Page() {
  const [themeColor, setThemeColor] = useState("#4f46e5");

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

  return (
    <main
      style={
        { "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties
      }
    >
      <CopilotSidebar
        disableSystemMessage={true}
        clickOutsideToClose={false}
        labels={{
          title: "Personal Assistant",
          initial: "👋 Hi! I'm your personal assistant. I can help you schedule meetings, manage emails, and search documents.",
        }}
        suggestions={[
          {
            title: "Schedule Meeting",
            message: "Schedule a team meeting for tomorrow at 2pm",
          },
          {
            title: "Send Email",
            message: "Send an email to john@company.com about the project update",
          },
          {
            title: "Search Documents",
            message: "Search for the Q1 project requirements",
          },
          {
            title: "Change Theme",
            message: "Change the theme color to a professional blue",
          },
        ]}
      >
        <MainContent themeColor={themeColor} />
      </CopilotSidebar>
    </main>
  );
}

function MainContent({ themeColor }: { themeColor: string }) {
  // 🤝 Co-Agent State Integration
  const { state, setState } = useCoAgent<AgentState>({
    name: "sample_agent",
    initialState: {
      messages: [],
      scheduled_events: [],
      sent_emails: [],
      search_results: [],
      proverbs: [],
    },
  });

  // 🎨 Tool Rendering: Schedule Events
  useRenderToolCall({
    name: "create_event",
    parameters: [
      { name: "title", type: "string", required: true },
      { name: "date", type: "string", required: true },
      { name: "time", type: "string", required: true },
      { name: "duration", type: "string" },
      { name: "participants", type: "string" },
    ],
    render: ({ args }) => (
      <ScheduleCard
        title={args.title}
        date={args.date}
        time={args.time}
        duration={args.duration}
        participants={args.participants}
        themeColor={themeColor}
      />
    ),
  });

  useRenderToolCall({
    name: "find_available_slots",
    parameters: [
      { name: "date", type: "string", required: true },
      { name: "duration", type: "string", required: true },
    ],
    render: ({ args }) => (
      <ScheduleCard
        action="find_slots"
        date={args.date}
        duration={args.duration}
        message="Available slots found for your request"
        themeColor={themeColor}
      />
    ),
  });

  // 🎨 Tool Rendering: Email Management
  useRenderToolCall({
    name: "compose_email",
    parameters: [
      { name: "recipient", type: "string", required: true },
      { name: "subject", type: "string", required: true },
      { name: "content", type: "string", required: true },
    ],
    render: ({ args }) => (
      <EmailCard
        action="compose"
        recipient={args.recipient}
        subject={args.subject}
        content={args.content}
        themeColor={themeColor}
      />
    ),
  });

  useRenderToolCall({
    name: "send_email",
    parameters: [
      { name: "recipient", type: "string", required: true },
      { name: "subject", type: "string", required: true },
      { name: "content", type: "string", required: true },
    ],
    render: ({ args }) => (
      <EmailCard
        action="send"
        recipient={args.recipient}
        subject={args.subject}
        content={args.content}
        themeColor={themeColor}
      />
    ),
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
        onApprove={() => respond("approved")}
        onReject={() => respond("rejected")}
      />
    ),
  });

  // 🎨 Tool Rendering: Document Search
  useRenderToolCall({
    name: "search_documents",
    parameters: [
      { name: "query", type: "string", required: true },
      { name: "category", type: "string" },
      { name: "limit", type: "number" },
    ],
    render: ({ args }) => (
      <DocumentCard
        query={args.query}
        category={args.category}
        limit={args.limit}
        themeColor={themeColor}
      />
    ),
  });

  useRenderToolCall({
    name: "analyze_document",
    parameters: [
      { name: "doc_id", type: "string", required: true },
      { name: "focus_areas", type: "string" },
    ],
    render: ({ args }) => (
      <DocumentCard
        doc_id={args.doc_id}
        focus_areas={args.focus_areas}
        themeColor={themeColor}
      />
    ),
  });

  // 🎨 Tool Rendering: Weather
  useRenderToolCall({
    name: "get_weather",
    parameters: [
      { name: "location", type: "string", required: true },
    ],
    render: ({ args }) => (
      <WeatherCard location={args.location} themeColor={themeColor} />
    ),
  });

  // 👥 Human-in-the-Loop: Moon Mission
  // useHumanInTheLoop({
  //   name: "go_to_moon",
  //   description: "Approval required for moon mission",
  //   render: ({ status, respond }) => (
  //     <MoonCard
  //       themeColor={themeColor}
  //       status={status}
  //       respond={respond}
  //     />
  //   ),
  // });

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: themeColor + "20" }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: themeColor }}>
            Personal Assistant Dashboard
          </h1>
          <p className="text-gray-600">
            Powered by CopilotKit & LangGraph Multi-Agent System
          </p>
        </header>

        {/* Proverbs Section */}
        {state.proverbs && state.proverbs.length > 0 && (
          <div className="mb-8 flex justify-center">
            <ProverbsCard state={state} setState={setState} />
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Schedule Card */}
          <ScheduleCard
            events={state.scheduled_events || []}
            themeColor={themeColor}
          />

          {/* Email Card */}
          <EmailCard
            emails={state.sent_emails || []}
            themeColor={themeColor}
          />

          {/* Document Card */}
          <DocumentCard
            currentTask={state.current_task}
            themeColor={themeColor}
          />
        </div>

        {/* Current Agent Status */}
        {state.active_agent && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-lg text-center">
            <div className="text-sm text-gray-500">Active Agent</div>
            <div className="text-lg font-semibold capitalize" style={{ color: themeColor }}>
              {state.active_agent} Agent
            </div>
            {state.current_task && (
              <div className="text-sm text-gray-600 mt-1">{state.current_task}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}