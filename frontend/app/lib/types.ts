export interface AgentState {
  messages: Array<any>;
  active_agent?: string;
  current_task?: string;
  scheduled_events?: Array<{
    title: string;
    date: string;
    time: string;
    duration?: string;
    participants?: string;
    event_id?: string;
  }>;
  sent_emails?: Array<{
    recipient: string;
    subject: string;
    action: string;
    timestamp?: string;
  }>;
  search_results?: Array<any>;
  proverbs?: string[];
  logs?: Array<{
    message: string;
    done: boolean;
  }>;
}
