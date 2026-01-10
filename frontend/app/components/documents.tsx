import { Search, FileText, Folder } from "lucide-react";

interface DocumentCardProps {
  query?: string;
  category?: string;
  limit?: number;
  doc_id?: string;
  focus_areas?: string;
  doc_type?: string;
  currentTask?: string;
  themeColor: string;
}

export function DocumentCard({
  query,
  category = "all",
  limit = 10,
  doc_id,
  focus_areas,
  doc_type = "all",
  currentTask,
  themeColor
}: DocumentCardProps) {
  // Handle document analysis view
  if (doc_id) {
    return (
      <div
        className="p-6 bg-white rounded-lg shadow-lg border-l-4 animate-pulse"
        style={{ borderLeftColor: themeColor }}
      >
        <div className="flex items-center mb-4">
          <FileText className="w-6 h-6 mr-2" style={{ color: themeColor }} />
          <h3 className="text-lg font-semibold text-gray-800">Document Analysis</h3>
        </div>

        <div className="mb-4">
          <div className="text-gray-600">
            <strong>Document ID:</strong> {doc_id}
          </div>
          <div className="text-gray-600">
            <strong>Focus Areas:</strong> {focus_areas || "summary"}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h4 className="font-medium text-gray-800 mb-2">Analysis Results</h4>
          <div className="text-sm text-gray-600">
            Document analysis completed for {doc_id}. Key insights and {focus_areas || "summary"} have been generated.
          </div>
        </div>

        <div className="mt-4 text-sm text-green-600 font-medium">
          🔍 Analysis completed successfully!
        </div>
      </div>
    );
  }

  // Tool render view for search results
  if (query) {
    const mockResults = [
      {
        title: `${query} - Project Requirements`,
        type: "PDF",
        relevance: "High",
        snippet: "This document contains the requirements and specifications..."
      },
      {
        title: `${query} - Meeting Notes`,
        type: "DOC",
        relevance: "Medium",
        snippet: "Notes from the discussion about..."
      },
      {
        title: `${query} - Technical Specs`,
        type: "MD",
        relevance: "High",
        snippet: "Technical implementation details and architecture..."
      }
    ];

    return (
      <div
        className="p-6 bg-white rounded-lg shadow-lg border-l-4 animate-pulse"
        style={{ borderLeftColor: themeColor }}
      >
        <div className="flex items-center mb-4">
          <Search className="w-6 h-6 mr-2" style={{ color: themeColor }} />
          <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
        </div>

        <div className="mb-4">
          <div className="text-gray-600">
            <strong>Query:</strong> "{query}"
          </div>
          <div className="text-gray-600">
            <strong>Category:</strong> {category}
          </div>
          <div className="text-gray-600">
            <strong>Results shown:</strong> {Math.min(limit, 3)}
          </div>
        </div>

        <div className="space-y-3">
          {mockResults.map((result, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="font-medium text-gray-800">{result.title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${result.relevance === 'High' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                  {result.relevance}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-1">Type: {result.type}</div>
              <div className="text-xs text-gray-500">{result.snippet}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-green-600 font-medium">
          🔍 Found {mockResults.length} relevant documents
        </div>
      </div>
    );
  }

  // Dashboard view showing current task and recent activity
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <Folder className="w-6 h-6 mr-2" style={{ color: themeColor }} />
        <h3 className="text-lg font-semibold text-gray-800">Document Activity</h3>
      </div>

      {currentTask ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4" style={{ borderLeftColor: themeColor }}>
            <div className="font-medium text-gray-800 mb-2">Current Task</div>
            <div className="text-gray-600">{currentTask}</div>
          </div>

          <div className="text-sm text-gray-500">
            Recent document searches and activities will appear here.
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          No recent document activity.
          <br />
          <span className="text-sm">Ask me to search for documents!</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold" style={{ color: themeColor }}>24</div>
          <div className="text-xs text-gray-500">Documents</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold" style={{ color: themeColor }}>8</div>
          <div className="text-xs text-gray-500">Searches Today</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold" style={{ color: themeColor }}>3</div>
          <div className="text-xs text-gray-500">Recent Downloads</div>
        </div>
      </div>
    </div>
  );
}