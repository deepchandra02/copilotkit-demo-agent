"use client";

import { useCoAgentStateRender } from "@copilotkit/react-core";
import { Progress } from "./progress";
import { ScheduleCard } from "./schedule";
import { EmailCard } from "./email";
import { DocumentCard } from "./documents";
import { AgentState } from "@/lib/types";

interface AssistantCanvasProps {
  state: AgentState;
  setState: (state: AgentState) => void;
  themeColor: string;
}

export function AssistantCanvas({
  state,
  setState,
  themeColor,
}: AssistantCanvasProps) {
  useCoAgentStateRender({
    name: "sample_agent",
    render: ({ state }) => {
      if (!state.logs || state.logs.length === 0) {
        return null;
      }
      return <Progress logs={state.logs} />;
    },
  });

  return (
    <div className="w-full h-full overflow-y-auto p-10 bg-[#F5F8FF]">
      <div className="space-y-8 pb-10">
        {/* Active Agent Status - TOP */}
        {state.active_agent && (
          <div>
            <h2 className="text-lg font-medium mb-3 text-primary">
              Active Agent
            </h2>
            <div className="bg-white px-6 py-6 border-0 shadow-md rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-grow">
                  <h3
                    className="font-bold text-xl capitalize"
                    style={{ color: themeColor }}
                  >
                    {state.active_agent} Agent
                  </h3>
                  {state.current_task && (
                    <p className="text-base mt-2 text-gray-600">
                      {state.current_task}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Events Section */}
        <div>
          <h2 className="text-lg font-medium mb-3 text-primary">
            Scheduled Events
          </h2>
          {(!state.scheduled_events || state.scheduled_events.length === 0) && (
            <div className="text-sm text-slate-400">No events scheduled yet.</div>
          )}
          {state.scheduled_events && state.scheduled_events.length > 0 && (
            <div className="flex space-x-3 overflow-x-auto">
              {state.scheduled_events.map((event, idx) => (
                <div key={idx} className="flex-none" style={{ width: "320px" }}>
                  <ScheduleCard
                    title={event.title}
                    date={event.date}
                    time={event.time}
                    duration={event.duration}
                    participants={event.participants}
                    themeColor={themeColor}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Emails Section */}
        <div>
          <h2 className="text-lg font-medium mb-3 text-primary">
            Sent Emails
          </h2>
          {(!state.sent_emails || state.sent_emails.length === 0) && (
            <div className="text-sm text-slate-400">No emails sent yet.</div>
          )}
          {state.sent_emails && state.sent_emails.length > 0 && (
            <div className="flex space-x-3 overflow-x-auto">
              {state.sent_emails.map((email, idx) => (
                <div key={idx} className="flex-none" style={{ width: "320px" }}>
                  <EmailCard
                    recipient={email.recipient}
                    subject={email.subject}
                    action={email.action}
                    themeColor={themeColor}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents/Search Results Section */}
        {state.current_task && (
          <div>
            <h2 className="text-lg font-medium mb-3 text-primary">
              Research & Documents
            </h2>
            <div className="flex-none" style={{ width: "320px" }}>
              <DocumentCard
                currentTask={state.current_task}
                themeColor={themeColor}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
