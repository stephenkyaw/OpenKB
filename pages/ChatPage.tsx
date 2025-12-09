import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatSource, Agent, AgentTool } from '../types';
import { Send, User as UserIcon, Bot, FileText, ChevronDown, PenTool, Search, Globe, FileScan, LineChart, Sparkles, Check, Plus, Paperclip, Mic } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  agents: Agent[];
  activeAgentId: string;
  onAgentChange: (agentId: string) => void;
  // New props
  onNewChat: () => void;
  sessionTitle?: string;
}

export const ChatPage: React.FC<ChatViewProps> = ({
  messages, onSendMessage, isThinking, agents, activeAgentId, onAgentChange, onNewChat, sessionTitle
}) => {
  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Mock attachment logic
      alert(`Attached: ${e.target.files[0].name}`);
    }
  };

  const handleMicClick = () => {
    alert("Voice input is not configured in this demo.");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative font-outfit">

      {/* Top Bar (Glass) */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-white/30 bg-white/40 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-white shadow-lg shadow-purple-900/10 ${activeAgent.color}`}>
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-2 tracking-tight">
              {sessionTitle || activeAgent.name}
            </h2>
            <div className="text-sm font-medium text-slate-500">{activeAgent.role}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            variant="ghost"
            icon={<Plus size={20} />}
            className="hidden md:flex bg-white/50 hover:bg-white border-white/50 shadow-sm"
          >
            New Chat
          </Button>

          {/* Custom Agent Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white/50 hover:bg-white transition-all px-5 py-2.5 rounded-full cursor-pointer border border-white/60 shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Persona</span>
                <span className="text-sm font-bold text-slate-800">{activeAgent.name}</span>
              </div>
              <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={18} className="text-slate-500" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white/80 backdrop-blur-xl rounded-[24px] shadow-2xl shadow-purple-900/10 border border-white/60 py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 overflow-hidden ring-1 ring-black/5">
                <div className="px-5 py-3 border-b border-slate-100/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Switch Persona</span>
                </div>
                <div className="max-h-80 overflow-y-auto py-2 custom-scrollbar p-2">
                  {agents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        onAgentChange(agent.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-4 hover:bg-white/60 transition-all group
                                 ${activeAgentId === agent.id ? 'bg-primary-50/80 border border-primary-100/50' : 'border border-transparent'}`}
                    >
                      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white text-xs shadow-md shadow-purple-900/5 ${agent.color} group-hover:scale-105 transition-transform`}>
                        <Bot size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-base ${activeAgentId === agent.id ? 'text-primary-700' : 'text-slate-800'}`}>
                          {agent.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate font-medium">{agent.role}</div>
                      </div>
                      {activeAgentId === agent.id && <div className="bg-primary-600 text-white p-1 rounded-full"><Check size={12} /></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8 pb-4">

          {/* Welcome Message Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-80">
              <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 text-white shadow-xl ${activeAgent.color}`}>
                <Sparkles size={40} />
              </div>
              <h3 className="text-2xl font-normal text-slate-800 mb-3">Hi there, I'm {activeAgent.name}</h3>
              <p className="text-slate-500 text-center max-w-md leading-relaxed mb-8">
                {activeAgent.systemInstructions.slice(0, 150)}...
              </p>

              {activeAgent.tools && activeAgent.tools.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {activeAgent.tools.map(tool => (
                    <Badge key={tool} variant="outline" className="bg-white">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row group'}`}>

                {/* Avatar for Model */}
                {msg.role === 'model' && (
                  <div className={`w-10 h-10 rounded-[14px] flex-shrink-0 flex items-center justify-center text-white shadow-md ${activeAgent.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <Bot size={20} />
                  </div>
                )}

                {/* Content Bubble */}
                <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-7 py-5 text-base leading-7 whitespace-pre-wrap shadow-sm backdrop-blur-sm
                      ${msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-[26px] rounded-tr-sm shadow-xl shadow-slate-900/10'
                        : 'bg-white/80 border border-white/60 text-slate-800 rounded-[26px] rounded-tl-sm shadow-[0_4px_20px_rgb(0,0,0,0.03)]'}`}
                  >
                    {msg.content}
                  </div>

                  {/* Sources Section (Only for Model) */}
                  {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 ml-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Sources</span>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source) => (
                          <div
                            key={source.id}
                            className="cursor-pointer"
                          >
                            <div className="bg-white/50 hover:bg-white border border-white/60 hover:border-white/80 rounded-xl py-2 pl-3 pr-4 flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
                              <FileText size={14} className="text-primary-600" />
                              <span className="truncate max-w-[150px] text-xs font-bold text-slate-600">{source.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex w-full justify-start items-center gap-4 pl-14">
              {/*
               <div className={`w-8 h-8 rounded-[10px] flex-shrink-0 flex items-center justify-center text-white shadow-sm ${activeAgent.color}`}>
                    <Bot size={16} />
                </div>
                */}
              <div className="flex gap-4 flex-row">
                <div className="bg-white/40 backdrop-blur-md px-6 py-4 rounded-[24px] rounded-tl-sm flex items-center gap-2 border border-white/40 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Floating) */}
      <div className="p-6 md:p-8 bg-gradient-to-t from-[#FDFBFF] via-[#FDFBFF]/80 to-transparent sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white/70 backdrop-blur-xl rounded-[32px] p-2 pr-2 border border-white/80 transition-all focus-within:bg-white/90 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-primary-200/50 shadow-lg shadow-purple-900/5 ring-1 ring-white/50">

          {/* Attachment Button */}
          <button
            onClick={handleAttachClick}
            className="p-3.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all mb-1 ml-1"
            title="Attach file"
          >
            <Paperclip size={22} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeAgent.name}...`}
            className="w-full py-4 bg-transparent border-none outline-none focus:ring-0 resize-none h-[64px] max-h-[200px] text-slate-700 placeholder-slate-400 scrollbar-hide text-lg font-medium"
            style={{ minHeight: '64px' }}
          />

          {/* Voice Input Button */}
          <button
            onClick={handleMicClick}
            className="p-3.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all mb-1"
            title="Voice Input"
          >
            <Mic size={22} />
          </button>

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-[24px] transition-all duration-300 mb-0.5
              ${!inputText.trim() || isThinking
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-primary-600 shadow-xl shadow-slate-900/20 hover:shadow-primary-600/30 hover:scale-105 active:scale-95'}`}
          >
            <Send size={24} className={inputText.trim() ? "ml-1" : ""} />
          </button>
        </div>
        <div className="text-center mt-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">OpenKB v2.0 • Gemini 1.5 Pro</p>
        </div>
      </div>

    </div>
  );
};