import { Mail, Send, User, CheckCircle, XCircle } from "lucide-react";

interface EmailCardProps {
  action?: string;
  recipient?: string;
  subject?: string;
  content?: string;
  emails?: Array<any>;
  themeColor: string;
  status?: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export function EmailCard({
  action,
  recipient,
  subject,
  content,
  emails = [],
  themeColor,
  status,
  onApprove,
  onReject
}: EmailCardProps) {
  // Human-in-the-loop approval view
  if (status && onApprove && onReject) {
    return (
      <div
        className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-yellow-400"
      >
        <div className="flex items-center mb-4">
          <Mail className="w-6 h-6 mr-2 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">Email Approval Required</h3>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <strong className="mr-2">To:</strong> {recipient}
          </div>
          <div className="text-gray-600">
            <strong className="mr-2">Subject:</strong> {subject}
          </div>
          <div className="text-gray-600">
            <strong className="mr-2">Content:</strong>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {content}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve & Send
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Tool render view for completed email action
  if (action) {
    const isSuccess = action === "send";
    const iconColor = isSuccess ? "text-green-500" : themeColor;

    return (
      <div
        className="p-6 bg-white rounded-lg shadow-lg border-l-4 animate-pulse"
        style={{ borderLeftColor: themeColor }}
      >
        <div className="flex items-center mb-4">
          <Send className="w-6 h-6 mr-2" style={{ color: themeColor }} />
          <h3 className="text-lg font-semibold text-gray-800">Email {action === "send" ? "Sent" : "Processed"}</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <strong className="mr-2">To:</strong> {recipient}
          </div>
          <div className="text-gray-600">
            <strong className="mr-2">Subject:</strong> {subject}
          </div>
          <div className="text-gray-600">
            <strong className="mr-2">Action:</strong> {action}
          </div>
        </div>

        <div className={`mt-4 text-sm font-medium ${isSuccess ? 'text-green-600' : 'text-blue-600'}`}>
          {isSuccess ? '📧 Email sent successfully!' : '📝 Email action completed!'}
        </div>
      </div>
    );
  }

  // Dashboard view showing recent emails
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <Mail className="w-6 h-6 mr-2" style={{ color: themeColor }} />
        <h3 className="text-lg font-semibold text-gray-800">Recent Emails</h3>
      </div>

      {emails.length > 0 ? (
        <div className="space-y-3">
          {emails.slice(0, 3).map((email, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-gray-800">{email.subject}</div>
                <span className={`text-xs px-2 py-1 rounded ${email.action === 'send' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                  {email.action}
                </span>
              </div>
              <div className="text-sm text-gray-600">{email.recipient}</div>
              {email.timestamp && (
                <div className="text-xs text-gray-500 mt-1">{email.timestamp}</div>
              )}
            </div>
          ))}
          {emails.length > 3 && (
            <div className="text-sm text-gray-500 text-center">
              +{emails.length - 3} more emails
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          No recent email activity.
          <br />
          <span className="text-sm">Ask me to send an email!</span>
        </div>
      )}
    </div>
  );
}