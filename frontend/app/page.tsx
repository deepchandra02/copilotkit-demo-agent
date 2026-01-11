"use client";

import { CopilotKit } from "@copilotkit/react-core";
import Main from "./Main";

export default function Page() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="sample_agent" showDevConsole={false}>
      <Main />
    </CopilotKit>
  );
}