import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User } from 'lucide-react';
import API from '../../services/api';

export default function AIChatbotDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Study Wizard AI Assistant. Ask me anything about your study schedule, weak subjects, or upcoming revisions!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "What should I study today?",
    "Which subject is weakest?",
    "Am I on track?",
    "How many hours left?",
    "When should I revise?",
    "Suggest tomorrow's schedule"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await API.post('/chatbot/ask', { question: query });
      const botMsg = { sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I ran into an issue connecting to the AI database engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-900/10 to-blue-900/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#4F8EF7] text-white flex items-center justify-center text-sm shadow">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-outfit">AI Study Assistant</h3>
            <span className="text-[10px] text-[#6C63FF] font-semibold">Live Database Context</span>
          </div>
        </div>

        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-[#6C63FF] flex items-center justify-center text-xs shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-[#6C63FF] text-white font-medium rounded-tr-none'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-line'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Sparkles className="w-4 h-4 text-[#6C63FF] animate-spin" />
            <span>AI is analyzing your academic data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts & Input Area */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        
        {/* Suggested Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full whitespace-nowrap hover:border-[#6C63FF] transition shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask your AI assistant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          />
          <button
            type="submit"
            className="p-2 bg-[#6C63FF] text-white rounded-xl hover:bg-[#5B52E0] transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
