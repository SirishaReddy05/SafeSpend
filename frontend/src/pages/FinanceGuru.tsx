import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Bot,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  askResourceAgent,
  deleteResource,
  listResources,
  uploadResource,
  type ResourceItem,
} from "../services/pythonEngineApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: string[];
  timestamp: Date;
}

export function FinanceGuru() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Finance Guru. Upload your financial PDFs, images, DOCX, or text files, and I will answer using those saved resources.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourceError, setResourceError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const load = async () => {
      try {
        const existing = await listResources();
        setResources(existing);
        setResourceError("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load resources.";
        setResourceError(message);
      }
    };
    load();
  }, []);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i += 1) {
      newFiles.push(files[i]);
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteResource(resourceId);
      setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "Analyze my uploaded files.",
      files: selectedFiles.map((file) => file.name),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const uploaded: ResourceItem[] = [];
      for (const file of selectedFiles) {
        const saved = await uploadResource(file);
        uploaded.push(saved);
      }

      if (uploaded.length > 0) {
        setResources((prev) => [...uploaded, ...prev]);
      }
      setSelectedFiles([]);

      const prompt =
        userMessage.content.trim() || "Analyze my financial resources and share advice.";
      const resourceIds = uploaded.length > 0 ? uploaded.map((resource) => resource.id) : undefined;
      const answer = await askResourceAgent(prompt, resourceIds);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? `I hit an issue: ${error.message}`
            : "I encountered an error while processing your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
        <div className="p-2 bg-emerald-500 rounded-xl text-white">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Finance Guru
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            AI Assistant Grounded In Your Saved Resources
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
          Saved Resources
        </p>
        {resources.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            No files saved yet. Upload PDF, image, DOCX, or text files to build context.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-lg text-xs text-gray-700 dark:text-gray-300"
              >
                <FileText className="w-3 h-3 text-emerald-500" />
                <span className="truncate max-w-[180px]">{resource.name}</span>
                <button
                  onClick={() => handleDeleteResource(resource.id)}
                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Delete saved resource"
                >
                  <Trash2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
        {resourceError && (
          <p className="text-xs text-red-500 mt-2">{resourceError}</p>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 max-w-[80%]",
              message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === "user"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
              )}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-2">
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-emerald-500 text-white rounded-tr-none shadow-lg shadow-emerald-500/20"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700",
                )}
              >
                {message.content}

                {message.files && message.files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-700/50 space-y-2">
                    <p className="text-[10px] font-bold uppercase opacity-70">
                      Attached Files:
                    </p>
                    {message.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs bg-white/10 dark:bg-gray-900/50 p-2 rounded-lg"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p
                className={cn(
                  "text-[10px] text-gray-400 dark:text-gray-500 font-bold",
                  message.role === "user" && "text-right",
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                <FileText className="w-3 h-3 text-emerald-500" />
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={() => removePendingFile(index)}
                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask based on your saved financial resources..."
              rows={1}
              className="w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none dark:text-gray-200 transition-colors"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-500 transition-colors"
              title="Upload files"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp,.txt,.md,.csv,.docx"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
            className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3 font-medium">
          Finance Guru may make mistakes. Verify critical financial decisions.
        </p>
      </div>
    </div>
  );
}
