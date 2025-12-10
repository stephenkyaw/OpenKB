import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Agent, KnowledgeAsset, AgentTool } from '../types';
import { Bot, Plus, Search, Filter, Grid, List, Trash2, MessageSquareText, ChevronLeft, ChevronRight, ArrowRight, User, FileScan, PenTool, Globe, LineChart, Mail, Bell, HardDrive, GitBranch, UserCheck, StopCircle, Cpu, Edit, Settings } from 'lucide-react';
import { AgentWorkflowEditor } from '../features/agents/components/AgentWorkflowEditor';
import { AgentCard } from '../features/agents/components/AgentCard';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { PageContainer } from '../components/layouts/PageContainer';
import { GlassCard } from '../components/ui/GlassCard';

const getToolIconComponent = (tool: AgentTool) => {
    // ... (keep usage of this function same)
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

interface AgentManagementViewProps {
    agents: Agent[];
    assets: KnowledgeAsset[];
    onSaveAgent: (agent: Agent) => void;
    onDeleteAgent: (id: string) => void;
    onChatWithAgent: (id: string) => void;
}

export const AgentsPage: React.FC<AgentManagementViewProps> = ({ agents, assets, onSaveAgent, onDeleteAgent, onChatWithAgent }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent>({
        id: '', name: '', role: '', description: '', systemInstructions: '', allowedAssetIds: [], tools: [], color: 'bg-primary-600'
    });

    // Dashboard State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTool, setFilterTool] = useState<AgentTool | 'All'>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 12 : 8;

    // Filter Logic
    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTool = filterTool === 'All' || agent.tools?.includes(filterTool);
        return matchesSearch && matchesTool;
    });

    const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
    const paginatedAgents = filteredAgents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filterTool, viewMode]);

    const openNewAgentModal = () => {
        setEditingAgent({
            id: Date.now().toString(),
            name: 'New Agent',
            role: 'Assistant',
            description: '',
            systemInstructions: 'You are a helpful assistant.',
            allowedAssetIds: [],
            tools: [AgentTool.RAG_SEARCH],
            color: 'bg-primary-600'
        });
        setShowModal(true);
    };

    const openEditModal = (agent: Agent) => {
        setEditingAgent({ ...agent });
        setShowModal(true);
    };

    const handleSave = (agent: Agent) => {
        onSaveAgent(agent);
        setShowModal(false);
    };

    const renderEditorModal = () => (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} className="md:w-[96vw] md:h-[92vh] max-w-none max-h-none h-full w-full p-0 overflow-hidden md:rounded-[28px]">
            <div className="w-full h-full flex flex-col">
                <AgentWorkflowEditor
                    agent={editingAgent}
                    assets={assets}
                    onSave={handleSave}
                    onCancel={() => setShowModal(false)}
                />
            </div>
        </Modal>
    );

    return (
        <PageContainer>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-normal text-slate-900 tracking-tight mb-2">Agent Studio</h1>
                        <p className="text-slate-500 text-lg">Manage intelligent assistants and workflows.</p>
                    </div>
                    <button
                        onClick={openNewAgentModal}
                        className="bg-primary-200 text-primary-900 px-6 py-4 rounded-[16px] hover:bg-primary-300 transition-all flex items-center gap-3 shadow-sm hover:shadow-md font-medium"
                    >
                        <Plus size={24} />
                        <span className="text-base">New Agent</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-xl p-2 rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 flex-1 w-full pl-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-white/50 rounded-full text-sm focus:ring-2 focus:ring-primary-100 text-slate-700 placeholder:text-slate-400" />
                        </div>
                        <div className="relative">
                            <Select
                                value={filterTool}
                                onChange={(e) => setFilterTool(e.target.value as AgentTool | 'All')}
                                options={[
                                    { value: 'All', label: 'All Tools' },
                                    ...Object.values(AgentTool).map(tool => ({ value: tool, label: tool }))
                                ]}
                                icon={<Filter className="w-4 h-4 text-slate-400" />}
                                className="w-48 bg-white/50 border-white/50 rounded-full h-[42px]"
                            />
                        </div>
                    </div>
                    <div className="flex bg-white/50 p-1 rounded-full border border-white/50">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={18} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
                    </div>
                </div>

                {/* Grid/List View */}
                <GlassCard>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <Bot size={20} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-medium text-slate-800">Your Agents</h2>
                            <p className="text-sm text-slate-500">Manage and customize your AI assistants.</p>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {paginatedAgents.map(agent => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onEdit={openEditModal}
                                    onDelete={onDeleteAgent}
                                    onChat={onChatWithAgent}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <th className="px-8 py-5">Agent</th>
                                        <th className="px-8 py-5">Role</th>
                                        <th className="px-8 py-5">Tools</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/50">
                                    {paginatedAgents.map(agent => (
                                        <tr key={agent.id} className="hover:bg-white/80 transition-colors cursor-pointer group" onClick={() => onChatWithAgent(agent.id)}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white text-xs ${agent.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                                        <Bot size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-900 text-base">{agent.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge variant="outline" className="bg-white/50">{agent.role}</Badge>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex -space-x-2">
                                                    {agent.tools?.slice(0, 3).map((tool, i) => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center text-slate-500 shadow-sm" title={tool}>
                                                            {React.createElement(getToolIconComponent(tool), { size: 14 })}
                                                        </div>
                                                    ))}
                                                    {(agent.tools?.length || 0) > 3 && <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-400">+{agent.tools!.length - 3}</div>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(agent); }} className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors"><Settings size={18} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); onChatWithAgent(agent.id); }} className="p-2 hover:bg-primary-50 text-primary-600 rounded-full transition-colors"><MessageSquareText size={18} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); onDeleteAgent(agent.id); }} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 border-t border-slate-100/50 pt-8">
                            <div className="flex items-center gap-2 bg-white/50 p-1 rounded-full shadow-sm border border-slate-100/50 backdrop-blur-sm">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 hover:bg-slate-50 rounded-full disabled:opacity-50"><ChevronLeft size={16} /></button>
                                <span className="text-sm font-medium text-slate-600 px-2">{currentPage} / {totalPages}</span>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 hover:bg-slate-50 rounded-full disabled:opacity-50"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
            {renderEditorModal()}
        </PageContainer >
    );
};
