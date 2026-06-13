import { useState, useRef, useEffect } from 'react';
import { FileImage, Send, Sparkles, TrendingUp, Lightbulb, ShieldAlert, MessageSquare, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { askFinancialAgent } from '../services/gemini';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { financeApi } from '../services/financeApi';
import { parseOcrAction } from '../services/pythonEngineApi';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const suggestions = [
  { icon: TrendingUp, label: 'Analyze my savings', color: 'blue' },
  { icon: Lightbulb, label: 'Tax optimization tips', color: 'blue' },
  { icon: ShieldAlert, label: 'Debt reduction plan', color: 'blue' },
];

export function AskAgent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !selectedFile) || isLoading) return;

    const attachedFile = selectedFile;
    const userText = text.trim() || 'Read this screenshot and add it to SafeSpend.';
    const userMessage: Message = {
      role: 'user',
      content: attachedFile ? `${userText}\n\nAttached: ${attachedFile.name}` : userText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    const history = messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    }));

    try {
      if (attachedFile) {
        if (!user?.id) {
          throw new Error('Please log in before adding OCR results to your account.');
        }

        const result = await parseOcrAction(attachedFile, userText);
        const { action } = result;
        const amount = Number(action.payload?.amount);

        if (action.target === 'wallet' && Number.isFinite(amount) && amount > 0) {
          const incomeType = String(action.payload.incomeType || 'OCR income').trim();
          const response = await financeApi.wallets.create(user.id, {
            incomeType,
            amount,
          });

          setMessages((prev) => [
            ...prev,
            {
              role: 'model',
              content: `Added a wallet entry for **${response.data.incomeType}** with amount **${response.data.amount}**.\n\nOCR note: ${action.notes ?? 'Screenshot parsed successfully.'}`,
            },
          ]);
          return;
        }

        if (action.target === 'budget' && Number.isFinite(amount) && amount > 0) {
          const response = await financeApi.budgets.create(user.id, {
            name: String(action.payload.name || 'OCR budget').trim(),
            category: String(action.payload.category || 'others'),
            amount,
            period: action.payload.period || 'monthly',
          });

          setMessages((prev) => [
            ...prev,
            {
              role: 'model',
              content: `Added a budget entry for **${response.data.name}** in **${response.data.category}** with amount **${response.data.amount}**.\n\nOCR note: ${action.notes ?? 'Screenshot parsed successfully.'}`,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `I read the screenshot, but could not confidently add it to a wallet or budget.\n\nOCR preview:\n\n${result.extracted_text.slice(0, 700)}`,
          },
        ]);
        return;
      }

      const response = await askFinancialAgent(userText, history);
      const modelMessage: Message = {
        role: 'model',
        content: response ?? "I'm sorry, I couldn't generate a response right now.",
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      const modelMessage: Message = {
        role: 'model',
        content:
          error instanceof Error
            ? error.message
            : "I'm sorry, I couldn't generate a response right now.",
      };

      setMessages((prev) => [...prev, modelMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Expenzo Financial Agent</h1>
            <p className="text-xs text-gray-400">Powered by Gemini • Always learning</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How can I help your wealth grow?</h2>
              <p className="text-sm text-gray-500 max-w-md">
                I can help you analyze your portfolio, set budgets, or give advice on complex financial questions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSend(suggestion.label)}
                  className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-center group"
                >
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100 transition-colors">
                    <suggestion.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">{suggestion.label}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-4',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  message.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-indigo-600 text-white',
                )}
              >
                {message.role === 'user' ? <MessageSquare className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  'max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-gray-50 text-gray-900'
                    : 'bg-white border border-gray-100 text-gray-900 shadow-sm',
                )}
              >
                <div className="markdown-body">
                  <Markdown>{message.content}</Markdown>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-gray-50">
        {selectedFile ? (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            <div className="flex min-w-0 items-center gap-2">
              <FileImage className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="ml-3 rounded-lg p-1 text-indigo-500 hover:bg-white hover:text-indigo-700"
              aria-label="Remove screenshot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/bmp,image/tiff,image/webp,application/pdf"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask anything, or attach a screenshot to add a wallet/budget..."
            className="w-full pl-14 pr-16 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 rounded-xl hover:bg-white hover:text-indigo-600 disabled:opacity-50 transition-colors"
            aria-label="Attach screenshot"
          >
            <FileImage className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
