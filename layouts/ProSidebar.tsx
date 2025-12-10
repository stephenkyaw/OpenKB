import React, { useState } from 'react';
import { ViewState, ChatSession, Agent, User } from '../types';
import { Library, MessageSquareText, LogOut, BrainCircuit, Settings, Bot, Trash2, Home, PanelLeftClose, PanelLeft, MoreHorizontal, Notebook } from 'lucide-react';

interface SidebarProps {
    activeView: ViewState;
    onChangeView: (view: ViewState) => void;
    onLogout: () => void;
    // User Data
    user: User | null;
    // History Props
    sessions?: ChatSession[];
    agents?: Agent[];
    activeSessionId?: string;
    onSelectSession?: (id: string) => void;
    onDeleteSession?: (id: string) => void;
}

export const ProSidebar: React.FC<SidebarProps> = ({
    activeView, onChangeView, onLogout, user,
    sessions = [], agents = [], activeSessionId, onSelectSession, onDeleteSession
}) => {
    const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1024);

    const handleNavigation = (view: ViewState) => {
        onChangeView(view);
        if (window.innerWidth < 1024) setIsCollapsed(true);
    };

    const navItemClass = (view: ViewState) => `
    flex items-center gap-3 px-3 py-3 mx-2 rounded-[16px] cursor-pointer transition-all duration-200 font-medium text-sm tracking-wide group relative
    ${activeView === view
            ? 'bg-primary-50 text-primary-900'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
    ${isCollapsed ? 'justify-center' : ''}
  `;

    // Tooltip helper for collapsed mode
    const Tooltip = ({ text }: { text: string }) => {
        if (!isCollapsed) return null;
        return (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {text}
            </div>
        );
    };

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-72'} h-[95vh] my-auto ml-4 rounded-[24px] bg-white/80 backdrop-blur-xl flex flex-col flex-shrink-0 z-20 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ease-in-out`}
        >
            {/* Header */}
            <div className={`h-24 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => handleNavigation(ViewState.HOME)}>
                        <div className="bg-primary-600 p-2 rounded-[14px] shadow-lg shadow-primary-600/20 shrink-0">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-medium text-slate-800 tracking-tight whitespace-nowrap">OpenKB</span>
                    </div>
                )}

                {/* Hamburger / Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors ${isCollapsed ? '' : ''}`}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <PanelLeft size={24} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar overflow-x-hidden">

                {!isCollapsed && (
                    <div className="px-8 mb-2 mt-2 fade-in">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
                    </div>
                )}
                {isCollapsed && <div className="h-4" />}

                <div className={navItemClass(ViewState.HOME)} onClick={() => handleNavigation(ViewState.HOME)}>
                    <Home size={20} />
                    {!isCollapsed && <span>Home</span>}
                    <Tooltip text="Home" />
                </div>

                <div className={navItemClass(ViewState.CHAT)} onClick={() => handleNavigation(ViewState.CHAT)}>
                    <MessageSquareText size={20} />
                    {!isCollapsed && <span>Ask Agent</span>}
                    <Tooltip text="Ask Agent" />
                </div>

                <div className={navItemClass(ViewState.AGENTS)} onClick={() => handleNavigation(ViewState.AGENTS)}>
                    <Bot size={20} />
                    {!isCollapsed && <span>Agent Studio</span>}
                    <Tooltip text="Agent Studio" />
                </div>

                {!isCollapsed && (
                    <div className="px-8 mt-6 mb-2 fade-in">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Management</span>
                    </div>
                )}
                {isCollapsed && <div className="border-t border-slate-100 my-4 mx-4" />}

                <div className={navItemClass(ViewState.KNOWLEDGE)} onClick={() => handleNavigation(ViewState.KNOWLEDGE)}>
                    <Library size={20} />
                    {!isCollapsed && <span>Knowledge Base</span>}
                    <Tooltip text="Knowledge Base" />
                </div>

                <div className={navItemClass(ViewState.NOTES)} onClick={() => handleNavigation(ViewState.NOTES)}>
                    <Notebook size={20} />
                    {!isCollapsed && <span>Notes</span>}
                    <Tooltip text="Notes" />
                </div>

                <div className={navItemClass(ViewState.SETTINGS)} onClick={() => handleNavigation(ViewState.SETTINGS)}>
                    <Settings size={20} />
                    {!isCollapsed && <span>Settings</span>}
                    <Tooltip text="Settings" />
                </div>

                {/* --- Chat History Section (Hidden when collapsed) --- */}
                {!isCollapsed && (
                    <>
                        <div className="px-8 mt-6 mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recent Chats</span>
                        </div>

                        <div className="space-y-4 px-3 pb-4">
                            {agents.map(agent => {
                                const agentSessions = sessions
                                    .filter(s => s.agentId === agent.id)
                                    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

                                if (agentSessions.length === 0) return null;

                                return (
                                    <div key={agent.id} className="mb-2">
                                        <div className="px-5 py-1 text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${agent.color}`} />
                                            {agent.name}
                                        </div>
                                        <div className="mt-1">
                                            {agentSessions.map(session => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => onSelectSession && onSelectSession(session.id)}
                                                    className={`group flex items-center justify-between px-5 py-2 mx-2 rounded-lg cursor-pointer text-sm transition-colors
                                                ${activeSessionId === session.id
                                                            ? 'bg-slate-100 text-slate-900 font-medium'
                                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                                >
                                                    <span className="truncate flex-1 pr-2">{session.title}</span>
                                                    {onDeleteSession && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteSession(session.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {sessions.length === 0 && (
                                <div className="px-6 py-4 text-xs text-slate-400 italic text-center">
                                    No history yet.
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-100/50 bg-white/50 rounded-b-[24px]">
                {user ? (
                    <div className={`flex items-center gap-3 rounded-[16px] p-2 transition-all ${isCollapsed ? 'justify-center' : 'hover:bg-slate-50'}`}>
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-900 truncate">{user.name}</div>
                                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                            </div>
                        )}

                        {!isCollapsed && (
                            <button
                                onClick={onLogout}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={onLogout}
                        className={`flex items-center gap-3 text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors rounded-full font-medium text-sm
                ${isCollapsed ? 'justify-center w-12 h-12 p-0' : 'px-6 py-3 w-full'}`}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                )}
            </div>
        </div>
    );
};