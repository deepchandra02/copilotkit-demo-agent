import { Calendar, Clock, Users } from "lucide-react";

interface ScheduleCardProps {
  title?: string;
  date?: string;
  time?: string;
  duration?: string;
  participants?: string;
  event_id?: string;
  message?: string;
  action?: string;
  events?: Array<any>;
  themeColor: string;
}

export function ScheduleCard({
  title,
  date,
  time,
  duration,
  participants,
  event_id,
  message,
  action,
  events = [],
  themeColor
}: ScheduleCardProps) {
  // Handle different actions
  const getActionTitle = () => {
    switch (action) {
      case 'find_slots': return 'Available Time Slots Found';
      case 'send_invites': return 'Calendar Invites Sent';
      default: return 'Event Scheduled';
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'find_slots': return '🔍';
      case 'send_invites': return '📧';
      default: return '✅';
    }
  };

  // If called as a tool render, show the specific event
  if (title || date || action) {
    return (
      <div
        className="p-6 bg-white rounded-lg shadow-lg border-l-4 animate-pulse"
        style={{ borderLeftColor: themeColor }}
      >
        <div className="flex items-center mb-4">
          <Calendar className="w-6 h-6 mr-2" style={{ color: themeColor }} />
          <h3 className="text-lg font-semibold text-gray-800">{getActionTitle()}</h3>
        </div>

        <div className="space-y-2">
          {title && (
            <div className="flex items-center text-gray-600">
              <strong className="mr-2">Event:</strong> {title}
            </div>
          )}
          {date && time && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {date} at {time}
            </div>
          )}
          {duration && (
            <div className="flex items-center text-gray-600">
              <strong className="mr-2">Duration:</strong> {duration}
            </div>
          )}
          {participants && (
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {participants}
            </div>
          )}
          {event_id && (
            <div className="flex items-center text-gray-600">
              <strong className="mr-2">Event ID:</strong> {event_id}
            </div>
          )}
          {message && (
            <div className="flex items-center text-gray-600">
              <strong className="mr-2">Message:</strong> {message}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-green-600 font-medium">
          {getActionIcon()} Successfully completed!
        </div>
      </div>
    );
  }

  // Dashboard view showing all events
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <Calendar className="w-6 h-6 mr-2" style={{ color: themeColor }} />
        <h3 className="text-lg font-semibold text-gray-800">Scheduled Events</h3>
      </div>

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.slice(0, 3).map((event, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-800">{event.title}</div>
              <div className="text-sm text-gray-600">
                {event.date} at {event.time}
              </div>
              <div className="text-xs text-gray-500">{event.participants}</div>
            </div>
          ))}
          {events.length > 3 && (
            <div className="text-sm text-gray-500 text-center">
              +{events.length - 3} more events
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          No scheduled events yet.
          <br />
          <span className="text-sm">Ask me to schedule a meeting!</span>
        </div>
      )}
    </div>
  );
}