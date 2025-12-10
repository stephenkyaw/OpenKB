import React from 'react';
import { Agent, AgentTool } from '../../../types';
import { Bot, Edit, Trash2, ArrowRight, Sparkles, Search, FileScan, PenTool, Globe, LineChart, Mail, Bell, HardDrive, GitBranch, UserCheck, StopCircle, Cpu, Settings } from 'lucide-react';

interface AgentCardProps {
    agent: Agent;
    onEdit: (agent: Agent) => void;
    onDelete: (id: string) => void;
    onChat: (id: string) => void;
}

const getToolIconComponent = (tool: AgentTool) => {
    switch (tool) {
        case AgentTool.RAG_SEARCH: return Search;
        case AgentTool.DOC_READER: return FileScan;
        case AgentTool.DOC_WRITER: return PenTool;
        case AgentTool.WEB_BROWSER: return Globe;
        case AgentTool.DATA_ANALYSIS: return LineChart;
        case AgentTool.EMAIL_SENDER: return Mail;
        case AgentTool.NOTIFICATION: return Bell;
        case AgentTool.GOOGLE_DRIVE: return HardDrive;
        case AgentTool.ROUTER_CONDITIONAL: return GitBranch;
        case AgentTool.HUMAN_INTERRUPT: return UserCheck;
        case AgentTool.END_NODE: return StopCircle;
        case AgentTool.LLM_NODE: return Cpu;
        default: return Bot;
    }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete, onChat }) => {
    return (
        <div
            onClick={() => onChat(agent.id)}
            className="group relative flex flex-col p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm hover:shadow-soft transition-all duration-300 cursor-pointer h-full overflow-hidden"
        >
            {/* Decorative Top-Right Corner Blob */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] opacity-10 transition-colors duration-300 ${agent.color?.replace('bg-', 'bg-') || 'bg-slate-500'}`} />

            {/* Action Buttons (Top Right) */}
            <div className="absolute top-4 right-4 flex gap-1 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(agent); }}
                    className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                >
                    <Settings size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="relative z-10 flex flex-col h-full">

                {/* Header: Icon + Title */}
                <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-900/5 mb-4 ${agent.color || 'bg-slate-500'}`}>
                        <Bot size={24} strokeWidth={1.5} />
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 group-hover:text-primary-700 transition-colors">{agent.name}</h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{agent.role}</div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-6 font-medium">
                    {agent.systemInstructions || agent.description || "No specific instructions provided."}
                </p>

                {/* Footer Tools */}
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2">
                    {agent.tools.slice(0, 3).map((tool, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            {React.createElement(getToolIconComponent(tool), { size: 12, className: "text-slate-400" })}
                            <span className="capitalize">{tool.toLowerCase().replace('_', ' ').replace('search', 'Ret...').replace('reader', 'Rea...')}</span>
                        </div>
                    ))}
                    {(agent.tools?.length || 0) > 3 && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>+{agent.tools!.length - 3} more</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
