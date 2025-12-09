import React from 'react';
import { User, Agent, KnowledgeAsset, ChatSession, ViewState } from '../types';
import { BrainCircuit, MessageSquareText, FileText, Bot, Plus, ArrowRight, Clock, Activity, Sparkles } from 'lucide-react';

interface HomeViewProps {
  user: User;
  agents: Agent[];
  assets: KnowledgeAsset[];
  sessions: ChatSession[];
  onNavigate: (view: ViewState) => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export const HomePage: React.FC<HomeViewProps> = ({
  user, agents, assets, sessions, onNavigate, onSelectSession, onNewChat
}) => {

  // Get recent sessions sorted by date
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 3);

  const stats = [
    { label: 'Active Agents', value: agents.length, icon: Bot, color: 'bg-primary-50 text-primary-600' },
    { label: 'Indexed Assets', value: assets.length, icon: FileText, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total Chats', value: sessions.length, icon: MessageSquareText, color: 'bg-purple-100 text-purple-600' },
  ];

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex-1 overflow-auto bg-[#FDFBFF] p-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-light text-slate-900 tracking-tight mb-2">
              Welcome back, <span className="font-semibold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">{user.name}</span>
            </h1>
            <p className="text-slate-500 text-lg font-light">Here's what's happening in your workspace today.</p>
          </div>
          <button
            onClick={onNewChat}
            className="group relative px-6 py-4 rounded-[20px] bg-slate-900 text-white shadow-xl shadow-primary-900/10 hover:shadow-2xl hover:shadow-primary-900/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3">
              <Plus size={24} />
              <span className="text-base font-medium">New Chat</span>
            </div>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-xl p-6 rounded-[28px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 hover:transform hover:scale-[1.02] transition-all duration-300 group cursor-default">
              <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={32} />
              </div>
              <div>
                <div className="text-4xl font-semibold text-slate-800 tracking-tight">{stat.value}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                <Clock size={20} className="text-slate-400" /> Jump back in
              </h2>
              <button onClick={() => onNavigate(ViewState.CHAT)} className="text-sm font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
                View history <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid gap-4">
              {recentSessions.map(session => {
                const agent = agents.find(a => a.id === session.agentId);
                return (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className="group bg-white/40 backdrop-blur-md p-5 rounded-[24px] border border-white/50 shadow-sm hover:bg-white/80 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer flex items-center gap-5"
                  >
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-purple-900/10 flex-shrink-0 ${agent?.color || 'bg-slate-500'}`}>
                      <Bot size={26} />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-slate-700 bg-white/50 px-2 py-0.5 rounded-full border border-white/50">{agent?.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-auto">
                          {getTimeAgo(session.lastModified)}
                        </span>
                      </div>
                      <div className="font-semibold text-lg text-slate-800 truncate group-hover:text-primary-600 transition-colors">
                        {session.title}
                      </div>
                      <div className="text-sm text-slate-500 truncate mt-1 font-light">
                        {session.messages[session.messages.length - 1]?.content || "No messages yet"}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-slate-300 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <ArrowRight size={20} className="-ml-0.5" />
                    </div>
                  </div>
                );
              })}

              {recentSessions.length === 0 && (
                <div className="bg-white p-10 rounded-[24px] border border-slate-100 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <MessageSquareText size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No recent chats</h3>
                  <p className="text-slate-500 mb-6">Start a new conversation with an AI agent.</p>
                  <button onClick={onNewChat} className="text-primary-600 font-medium hover:underline">Start Chat</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / System Status */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><Sparkles size={20} className="text-purple-400" /> Quick Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => onNavigate(ViewState.AGENTS)}
                  className="w-full flex items-center gap-4 p-5 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-white/90 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 rounded-[18px] bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Bot size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">Create Agent</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Design custom persona</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate(ViewState.KNOWLEDGE)}
                  className="w-full flex items-center gap-4 p-5 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-white/90 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 rounded-[18px] bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">Add Knowledge</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Upload docs or connect DB</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><Activity size={20} className="text-emerald-400" /> System Status</h2>
              <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[28px] border border-white/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-600">Vector Database</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">LLM Gateway</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Activity size={14} />
                    <span>Last system check: Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};