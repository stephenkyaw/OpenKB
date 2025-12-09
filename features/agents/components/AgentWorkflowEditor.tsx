import React, { useState, useEffect, useRef } from 'react';
import { Agent, KnowledgeAsset, AgentTool } from '../../../types';
import { WorkflowNode, Edge, NodeType } from '../types';
import { Bot, Plus, X, Search, FileText, Globe, Database, AppWindow, MessageSquareText, PenTool, FileScan, LineChart, Mail, Bell, HardDrive, GitBranch, UserCheck, StopCircle, Cpu, Sliders, Save, ZoomIn, ZoomOut, Maximize, ArrowRight, Settings, Zap, Check } from 'lucide-react';

interface AgentWorkflowEditorProps {
    agent: Agent;
    assets: KnowledgeAsset[];
    onSave: (agent: Agent) => void;
    onCancel: () => void;
}

// --- Helpers ---
const AddNodeButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 text-slate-700 font-bold text-sm hover:scale-105 transition-all active:scale-95 group ring-1 ring-white/50"
    >
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-transform group-hover:rotate-90">
            <Plus size={18} />
        </div>
        <span>{label}</span>
    </button>
);

const getAssetIcon = (type: string) => {
    switch (type) {
        case 'Document': return FileText;
        case 'Website': return Globe;
        case 'Database': return Database;
        case 'Integration': return AppWindow;
        default: return FileText;
    }
};

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

export const AgentWorkflowEditor: React.FC<AgentWorkflowEditorProps> = ({ agent: initialAgent, assets, onSave, onCancel }) => {
    const [editingAgent, setEditingAgent] = useState<Agent>({ ...initialAgent }); // Clone to local state

    // Workflow Editor State
    const [activeTab, setActiveTab] = useState<'flow' | 'settings'>('flow');
    const [pickerState, setPickerState] = useState<{ type: 'asset' | 'tool' | null; x: number; y: number; }>({ type: null, x: 0, y: 0 });
    const [showAssetPicker, setShowAssetPicker] = useState(false);
    const [showToolPicker, setShowToolPicker] = useState(false);
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isDraggingNode, setIsDraggingNode] = useState(false);
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // For dragging/highlight
    const [openConfigId, setOpenConfigId] = useState<string | null>(null);     // For config panel
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [dragNodeOffset, setDragNodeOffset] = useState({ x: 0, y: 0 });
    const pendingNodePos = useRef<{ x: number, y: number, id: string } | null>(null);
    const [isDrawingEdge, setIsDrawingEdge] = useState(false);
    const [edgeStart, setEdgeStart] = useState<{ x: number, y: number, sourceNodeId: string, type: 'input' | 'output' } | null>(null);
    const [tempEdgeEnd, setTempEdgeEnd] = useState({ x: 0, y: 0 });
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Initialization
    useEffect(() => {
        if (nodes.length === 0) {
            initializeNodes(editingAgent);
        }
    }, []);

    const initializeNodes = (agent: Partial<Agent>) => {
        const startX = 100;
        const startY = 350;
        const gapX = 320;

        const newNodes: WorkflowNode[] = [];

        // 1. Trigger Node
        newNodes.push({
            id: 'trigger-chat',
            type: 'trigger',
            dataId: 'chat',
            label: 'User Chat',
            subLabel: 'Start',
            x: startX,
            y: startY,
            icon: MessageSquareText,
            color: 'bg-slate-800'
        });

        // 2. Brain Node
        newNodes.push({
            id: 'brain-core',
            type: 'brain',
            dataId: 'brain',
            label: agent.name || 'Agent',
            subLabel: 'Intelligence',
            x: startX + gapX,
            y: startY,
            icon: Bot,
            color: 'bg-slate-900'
        });

        // 3. Knowledge Retrieval (RAG) Node - Vertical layout first
        const ragEnabled = agent.tools?.includes(AgentTool.RAG_SEARCH);
        let ragNodeY = startY;

        if (ragEnabled) {
            newNodes.push({
                id: `tool-${AgentTool.RAG_SEARCH}`,
                type: 'tool',
                dataId: AgentTool.RAG_SEARCH,
                label: 'Knowledge Retrieval',
                subLabel: 'Capability',
                x: startX + (gapX * 2),
                y: startY - 100,
                icon: Search,
                color: 'bg-indigo-600'
            });
            ragNodeY = startY - 100;

            // 4. Connected Assets (Right of RAG)
            (agent.allowedAssetIds || []).forEach((assetId, index) => {
                const asset = assets.find(a => a.id === assetId);
                if (asset) {
                    newNodes.push({
                        id: `asset-${assetId}`,
                        type: 'asset',
                        dataId: assetId,
                        label: asset.name,
                        subLabel: asset.type,
                        x: startX + (gapX * 3), // Extended to right
                        y: ragNodeY + (index * 120),
                        icon: getAssetIcon(asset.type),
                        color: 'bg-emerald-600'
                    });
                }
            });
        }

        // 5. Other Tools (Below RAG or centralized)
        const otherTools = (agent.tools || []).filter(t => t !== AgentTool.RAG_SEARCH);
        otherTools.forEach((tool, index) => {
            newNodes.push({
                id: `tool-${tool}`,
                type: 'tool',
                dataId: tool,
                label: tool,
                subLabel: 'Action',
                x: startX + (gapX * 2),
                y: startY + 120 + (index * 120),
                icon: getToolIconComponent(tool),
                color: 'bg-purple-600'
            });
        });

        // Initialize Default Edges based on Config
        const newEdges: Edge[] = [];

        // Connect Trigger -> Brain
        newEdges.push({ id: 'e-trigger-brain', source: 'trigger-chat', target: 'brain-core' });

        // Connect Brain -> RAG (if exists)
        if (ragEnabled) {
            newEdges.push({ id: 'e-brain-rag', source: 'brain-core', target: `tool-${AgentTool.RAG_SEARCH}` });

            // Connect RAG -> Assets
            (agent.allowedAssetIds || []).forEach(assetId => {
                if (assets.find(a => a.id === assetId)) {
                    newEdges.push({ id: `e-rag-${assetId}`, source: `tool-${AgentTool.RAG_SEARCH}`, target: `asset-${assetId}` });
                }
            });
        }

        // Connect Brain -> Other Tools
        otherTools.forEach(tool => {
            newEdges.push({ id: `e-brain-${tool}`, source: 'brain-core', target: `tool-${tool}` });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    };

    // Handle Deletion (Keys)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedEdgeId) {
                    const edge = edges.find(e => e.id === selectedEdgeId);
                    if (edge) {
                        setEdges(prev => prev.filter(e => e.id !== selectedEdgeId));
                        // Update Config
                        if (edge.source.startsWith('tool-rag_search') && edge.target.startsWith('asset-')) {
                            const assetId = edge.target.replace('asset-', '');
                            setEditingAgent(prev => ({
                                ...prev,
                                allowedAssetIds: (prev.allowedAssetIds || []).filter(id => id !== assetId)
                            }));
                        } else if (edge.source === 'brain-core' && edge.target.startsWith('tool-')) {
                            const toolId = edge.target.replace('tool-', '') as AgentTool;
                            setEditingAgent(prev => ({
                                ...prev,
                                tools: (prev.tools || []).filter(t => t !== toolId)
                            }));
                        }
                    }
                    setSelectedEdgeId(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedEdgeId, edges]);

    const screenToWorld = (screenX: number, screenY: number) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (screenX - rect.left - viewport.x) / viewport.zoom,
            y: (screenY - rect.top - viewport.y) / viewport.zoom
        };
    };

    const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        setSelectedNodeId(nodeId);
        setPickerState({ ...pickerState, type: null });

        const worldPos = screenToWorld(e.clientX, e.clientY);
        setDragNodeOffset({ x: worldPos.x - node.x, y: worldPos.y - node.y });
        setDraggedNodeId(nodeId);
        setIsDraggingNode(true);
    };

    const handleMouseDownPort = (e: React.MouseEvent, nodeId: string, type: 'input' | 'output') => {
        e.stopPropagation();
        e.preventDefault();
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const worldPos = screenToWorld(e.clientX, e.clientY);
        const portX = type === 'output' ? node.x + 288 : node.x;
        const portY = node.y + 60;

        setIsDrawingEdge(true);
        setEdgeStart({ x: portX, y: portY, sourceNodeId: nodeId, type });
        setTempEdgeEnd(worldPos);
    };

    const handleMouseDownCanvas = (e: React.MouseEvent) => {
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        setSelectedNodeId(null);
        setOpenConfigId(null); // Close panel on canvas click? Or maybe keep it open? User said "not model pop...". Let's close it to be safe/clean.
        setSelectedEdgeId(null);
        setPickerState({ ...pickerState, type: null });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const worldPos = screenToWorld(e.clientX, e.clientY);

        if (isDrawingEdge) {
            setTempEdgeEnd(worldPos);
            const hitNode = nodes.find(n => {
                if (n.id === edgeStart?.sourceNodeId) return false;
                return worldPos.x >= n.x && worldPos.x <= n.x + 288 &&
                    worldPos.y >= n.y && worldPos.y <= n.y + 120;
            });
            setHoveredNodeId(hitNode ? hitNode.id : null);
            return;
        }

        if (isDraggingNode && draggedNodeId) {
            setNodes(prev => prev.map(n =>
                n.id === draggedNodeId ? { ...n, x: worldPos.x - dragNodeOffset.x, y: worldPos.y - dragNodeOffset.y } : n
            ));
            return;
        }

        if (isPanning) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isDrawingEdge && edgeStart) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            const sourceNode = nodes.find(n => n.id === edgeStart.sourceNodeId);
            const hitNode = nodes.find(n => {
                if (n.id === edgeStart.sourceNodeId) return false;
                return worldPos.x >= n.x && worldPos.x <= n.x + 288 &&
                    worldPos.y >= n.y && worldPos.y <= n.y + 120;
            });

            if (hitNode) {
                if (sourceNode?.type === 'brain' && edgeStart.type === 'output' && hitNode.type === 'tool') {
                    const toolId = hitNode.dataId as AgentTool;
                    if (!editingAgent.tools?.includes(toolId)) {
                        setEditingAgent(prev => ({ ...prev, tools: [...(prev.tools || []), toolId] }));
                    }
                } else if (sourceNode?.dataId === AgentTool.RAG_SEARCH && edgeStart.type === 'output' && hitNode.type === 'asset') {
                    if (!editingAgent.allowedAssetIds?.includes(hitNode.dataId)) {
                        setEditingAgent(prev => ({ ...prev, allowedAssetIds: [...(prev.allowedAssetIds || []), hitNode.dataId] }));
                    }
                }

                const edgeId = `e-${sourceNode!.id}-${hitNode.id}`;
                if (!edges.find(e => e.id === edgeId)) {
                    setEdges(prev => [...prev, { id: edgeId, source: sourceNode!.id, target: hitNode.id }]);
                }
            } else {
                let dropType: 'tool' | 'asset' | null = null;
                if (sourceNode?.type === 'brain' && edgeStart.type === 'output') dropType = 'tool';
                else if (sourceNode?.dataId === AgentTool.RAG_SEARCH && edgeStart.type === 'output') dropType = 'asset';

                if (dropType) {
                    setPickerState({ type: dropType, x: e.clientX, y: e.clientY });
                    pendingNodePos.current = { x: worldPos.x - 144, y: worldPos.y - 50, id: 'pending' };
                }
            }
        }

        setIsDraggingNode(false);
        setDraggedNodeId(null);
        setIsPanning(false);
        setIsDrawingEdge(false);
        setEdgeStart(null);
        setHoveredNodeId(null);
    };

    const handleAddAsset = (assetId: string, positionOverride?: { x: number, y: number }) => {
        // Logic same as before... simplified for prompt width
        let spawnX = 0, spawnY = 0;
        if (positionOverride) {
            spawnX = positionOverride.x;
            spawnY = positionOverride.y;
        } else if (pendingNodePos.current) {
            spawnX = pendingNodePos.current.x;
            spawnY = pendingNodePos.current.y;
        } else {
            // Default to center of viewport
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
                const centerX = (rect.width / 2 - viewport.x) / viewport.zoom;
                const centerY = (rect.height / 2 - viewport.y) / viewport.zoom;
                spawnX = centerX - 144; // Center the node (width 288/2)
                spawnY = centerY - 60;  // Center the node (height 120/2)
            }
        }

        const asset = assets.find(a => a.id === assetId);
        if (asset && !editingAgent.allowedAssetIds?.includes(assetId)) {
            setEditingAgent(prev => ({ ...prev, allowedAssetIds: [...(prev.allowedAssetIds || []), assetId] }));
        }

        if (asset) {
            setNodes(prev => [...prev, {
                id: `asset-${assetId}-${Date.now()}`,
                type: 'asset',
                dataId: assetId,
                label: asset.name,
                subLabel: asset.type,
                x: spawnX,
                y: spawnY,
                icon: getAssetIcon(asset.type),
                color: 'bg-emerald-600'
            }]);
        }
        setPickerState({ ...pickerState, type: null });
        setShowAssetPicker(false);
    };

    // Simplified logic for brevity, assuming standard imports
    const handleAddTool = (tool: AgentTool, positionOverride?: { x: number, y: number }) => {
        let spawnX = 0, spawnY = 0;
        if (positionOverride) {
            spawnX = positionOverride.x;
            spawnY = positionOverride.y;
        } else if (pendingNodePos.current) {
            spawnX = pendingNodePos.current.x;
            spawnY = pendingNodePos.current.y;
        } else {
            // Default to center of viewport
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
                const centerX = (rect.width / 2 - viewport.x) / viewport.zoom;
                const centerY = (rect.height / 2 - viewport.y) / viewport.zoom;
                spawnX = centerX - 144; // Center the node (width 288/2)
                spawnY = centerY - 60;  // Center the node (height 120/2)
            }
        }

        if (!editingAgent.tools?.includes(tool)) {
            setEditingAgent(prev => ({ ...prev, tools: [...(prev.tools || []), tool] }));
        }

        const isRag = tool === AgentTool.RAG_SEARCH;
        setNodes(prev => [...prev, {
            id: `tool-${tool}-${Date.now()}`,
            type: 'tool',
            dataId: tool,
            label: isRag ? 'Knowledge Retrieval' : tool,
            subLabel: 'Action',
            x: spawnX,
            y: spawnY,
            icon: getToolIconComponent(tool),
            color: isRag ? 'bg-indigo-600' : 'bg-purple-600'
        }]);
        setPickerState({ ...pickerState, type: null });
        setShowToolPicker(false);
    };

    const handleToggleAsset = (assetId: string) => {
        setEditingAgent(prev => ({ ...prev, allowedAssetIds: (prev.allowedAssetIds || []).filter(id => id !== assetId) }));
    };
    const handleToggleTool = (tool: AgentTool) => {
        setEditingAgent(prev => ({ ...prev, tools: (prev.tools || []).filter(t => t !== tool) }));
    };

    const getEdgePath = (source: { x: number, y: number }, target: { x: number, y: number }) => {
        const sourceX = source.x + 288;
        const sourceY = source.y + 60;
        const targetX = target.x;
        const targetY = target.y + 60;
        const dist = Math.abs(targetX - sourceX) / 2;
        return `M ${sourceX} ${sourceY} C ${sourceX + dist} ${sourceY}, ${targetX - dist} ${targetY}, ${targetX} ${targetY}`;
    };

    const getTempEdgePath = () => {
        if (!edgeStart) return '';
        const sourceX = edgeStart.x;
        const sourceY = edgeStart.y;
        const targetX = tempEdgeEnd.x;
        const targetY = tempEdgeEnd.y;
        const dist = Math.abs(targetX - sourceX) / 2;
        const cx1 = edgeStart.type === 'output' ? sourceX + dist : sourceX - dist;
        const cx2 = edgeStart.type === 'output' ? targetX - dist : targetX + dist;
        return `M ${sourceX} ${sourceY} C ${cx1} ${sourceY}, ${cx2} ${targetY}, ${targetX} ${targetY}`;
    };

    const handleConfigChange = (key: string, value: any) => {
        setNodes(prev => prev.map(n => {
            if (n.id === selectedNodeId) {
                return { ...n, config: { ...(n.config || {}), [key]: value } };
            }
            return n;
        }));
    };

    const handleMenuDragStart = (e: React.DragEvent, type: 'asset' | 'tool', id: string) => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('id', id);
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const id = e.dataTransfer.getData('id');

        const worldPos = screenToWorld(e.clientX, e.clientY);
        const spawnX = worldPos.x - 144;
        const spawnY = worldPos.y - 50;

        if (type === 'asset') {
            handleAddAsset(id, { x: spawnX, y: spawnY });
        } else if (type === 'tool') {
            handleAddTool(id as AgentTool, { x: spawnX, y: spawnY });
        }
    };

    const NodeConfigPanel = () => {
        const node = nodes.find(n => n.id === openConfigId);
        if (!node) return null;

        return (
            <div
                className="absolute right-6 top-24 bottom-6 w-96 bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[60] flex flex-col animate-in slide-in-from-right-10 fade-in duration-300 overflow-hidden ring-1 ring-white/50"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${node.color} text-white shadow-lg shadow-indigo-500/20`}>
                            {React.createElement(node.icon, { size: 20 })}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{node.label}</h3>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{node.type} Node</div>
                        </div>
                    </div>
                    <button onClick={() => setOpenConfigId(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/10">
                    {node.type === 'trigger' && (
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">This workflow starts when a user sends a message in the chat interface.</p>
                        </div>
                    )}

                    {node.type === 'brain' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LLM Model</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-3 border border-white/60 rounded-xl text-sm bg-white/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 outline-none appearance-none font-medium">
                                        <option>Gemini 2.5 Flash</option>
                                        <option>GPT-4o</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <ArrowRight size={14} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {node.type === 'tool' && (
                        <div className="space-y-6">
                            {node.dataId === AgentTool.EMAIL_SENDER && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recipient</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-white/60 rounded-xl text-sm bg-white/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 outline-none font-medium placeholder-slate-400"
                                            placeholder="e.g. hr@company.com"
                                            value={node.config?.recipient || ''}
                                            onChange={(e) => handleConfigChange('recipient', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            {node.dataId === AgentTool.GOOGLE_DRIVE && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Folder</label>
                                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 border border-white/60 rounded-xl">
                                            <HardDrive size={16} className="text-slate-400" />
                                            <input
                                                type="text"
                                                className="bg-transparent border-none p-0 text-sm w-full text-slate-600 font-medium focus:ring-0"
                                                value={node.config?.folder || "/Reports"}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {node.dataId === AgentTool.DOC_WRITER && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Output Format</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-3 border border-white/60 rounded-xl text-sm bg-white/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 outline-none appearance-none font-medium">
                                                <option>PDF</option>
                                                <option>DOCX</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <ArrowRight size={14} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/40 bg-white/30 backdrop-blur-sm">
                    <button onClick={() => setOpenConfigId(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-white/70 backdrop-blur-xl rounded-full p-2 pr-2 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50 flex items-center gap-4">
                    <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                        <ArrowRight size={20} className="rotate-180 text-slate-600" />
                    </button>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex items-center gap-3 pl-1">
                        <div className={`w-8 h-8 rounded-full ${editingAgent.color} flex items-center justify-center text-white text-xs shadow-sm`}>
                            <Bot size={16} />
                        </div>
                        <input
                            type="text"
                            value={editingAgent.name}
                            onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                            className="font-bold text-lg text-slate-900 border-none p-0 focus:ring-0 placeholder-slate-400 bg-transparent w-48 focus:w-64 transition-all"
                            placeholder="Name your agent..."
                        />
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex bg-slate-100/50 rounded-full p-1 border border-slate-200/50">
                        <button onClick={() => setActiveTab('flow')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'flow' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Zap size={14} /> Design
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Settings size={14} /> Configure
                        </button>
                    </div>

                    <button onClick={() => onSave(editingAgent)} className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all shadow-md ml-2 hover:scale-105 active:scale-95">
                        <Check size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'settings' && (
                    <div className="w-full h-full overflow-y-auto custom-scrollbar p-12">
                        <div className="max-w-4xl mx-auto space-y-8 glass-panel p-8 rounded-[32px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Agent Name</label>
                                    <input
                                        type="text"
                                        value={editingAgent.name}
                                        onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                        className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-900 font-bold text-lg bg-white/50 backdrop-blur-sm transition-all shadow-sm"
                                        placeholder="e.g. Research Assistant"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Role / Title</label>
                                    <input
                                        type="text"
                                        value={editingAgent.role}
                                        onChange={(e) => setEditingAgent({ ...editingAgent, role: e.target.value })}
                                        className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-700 bg-white/50 backdrop-blur-sm transition-all shadow-sm"
                                        placeholder="e.g. Technical Specialist"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={editingAgent.description}
                                    onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                    className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-700 bg-white/50 backdrop-blur-sm transition-all shadow-sm resize-none"
                                    placeholder="Briefly describe what this agent does..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4">Appearance Color</label>
                                <div className="flex flex-wrap gap-4">
                                    {['bg-slate-900', 'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-purple-600', 'bg-fuchsia-600', 'bg-pink-600', 'bg-rose-600', 'bg-orange-600', 'bg-amber-600', 'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-sky-600'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setEditingAgent({ ...editingAgent, color })}
                                            className={`w-12 h-12 rounded-full cursor-pointer transition-all hover:scale-110 shadow-sm border-2 ${color} ${editingAgent.color === color ? 'border-white ring-4 ring-slate-200 scale-110' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">System Instructions (Prompt)</label>
                                <div className="relative">
                                    <textarea
                                        rows={12}
                                        value={editingAgent.systemInstructions}
                                        onChange={(e) => setEditingAgent({ ...editingAgent, systemInstructions: e.target.value })}
                                        className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-700 bg-white/50 backdrop-blur-sm transition-all shadow-sm font-mono text-sm leading-relaxed"
                                        placeholder="You are a helpful AI assistant..."
                                    />
                                    <div className="absolute right-4 bottom-4 text-xs font-bold text-slate-400 pointer-events-none">MARKDOWN SUPPORTED</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'flow' && (
                    <div ref={canvasRef} className="absolute inset-0 overflow-hidden bg-transparent cursor-grab"
                        onMouseDown={handleMouseDownCanvas}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleCanvasDrop}
                        onClick={() => setPickerState({ ...pickerState, type: null })}
                        onWheel={(e) => setViewport(prev => ({ ...prev, zoom: Math.min(Math.max(viewport.zoom - e.deltaY * 0.001, 0.2), 2.5) }))}
                    >
                        <div style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, transformOrigin: '0 0', width: '100%', height: '100%' }}>
                            <svg className="absolute inset-0 w-full h-full z-0 overflow-visible">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" /></marker>
                                </defs>
                                {edges.map(edge => {
                                    const sourceStrict = nodes.find(n => n.id === edge.source);
                                    const targetStrict = nodes.find(n => n.id === edge.target);
                                    if (!sourceStrict || !targetStrict) return null;
                                    return (
                                        <g key={edge.id} onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); setOpenConfigId(null); }} className="cursor-pointer group">
                                            <path d={getEdgePath(sourceStrict, targetStrict)} fill="none" stroke={selectedEdgeId === edge.id ? "#7c3aed" : "#CBD5E1"} strokeWidth={selectedEdgeId === edge.id ? "3" : "2"} markerEnd="url(#arrowhead)" className="transition-all group-hover:stroke-primary-400" />
                                        </g>
                                    );
                                })}
                                {isDrawingEdge && <path d={getTempEdgePath()} fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="5" className="animate-pulse" />}
                            </svg>

                            {nodes.map(node => (
                                <div
                                    key={node.id}
                                    className="absolute w-72"
                                    style={{ left: node.x, top: node.y }}
                                    onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                                    onDoubleClick={(e) => { e.stopPropagation(); setOpenConfigId(node.id); }}
                                >
                                    <div className={`
                                        bg-white/80 backdrop-blur-xl rounded-[20px] shadow-lg overflow-hidden transition-all duration-300
                                        ${selectedNodeId === node.id ? 'ring-2 ring-primary-500 shadow-xl scale-[1.02] z-20' : 'border border-white/60 hover:shadow-xl hover:bg-white/90'}
                                    `}>
                                        <div className={`h-1.5 w-full ${node.color}`} />
                                        <div className="p-4 flex items-center gap-3 relative">
                                            <div className={`p-2.5 rounded-xl ${node.color} bg-opacity-10 text-slate-700`}>
                                                {React.createElement(node.icon, { size: 20, className: "opacity-90" })}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{node.subLabel}</div>
                                                <div className="font-bold text-slate-900 text-sm truncate">{node.label}</div>
                                            </div>

                                            {/* Config Icon */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenConfigId(node.id); }}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-primary-600 transition-colors p-1 rounded-full hover:bg-slate-50"
                                            >
                                                <Settings size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {node.type !== 'brain' && (
                                        <>
                                            <div className="absolute -left-1.5 top-1/2 w-3 h-3 bg-slate-300 rounded-full border-2 border-white z-20 cursor-crosshair hover:scale-125 transition-transform" onMouseDown={(e) => handleMouseDownPort(e, node.id, 'input')} />
                                            <div className="absolute -right-1.5 top-1/2 w-3 h-3 bg-slate-300 rounded-full border-2 border-white z-20 cursor-crosshair hover:scale-125 transition-transform" onMouseDown={(e) => handleMouseDownPort(e, node.id, 'output')} />
                                        </>
                                    )}
                                    {node.type === 'brain' && (
                                        <>
                                            <div className="absolute -left-1.5 top-1/2 w-4 h-4 bg-slate-900 rounded-full border-2 border-white z-20 cursor-crosshair hover:scale-125 transition-transform" onMouseDown={(e) => handleMouseDownPort(e, node.id, 'input')} />
                                            <div className="absolute -right-1.5 top-1/2 w-4 h-4 bg-slate-900 rounded-full border-2 border-white z-20 cursor-crosshair hover:scale-125 transition-transform" onMouseDown={(e) => handleMouseDownPort(e, node.id, 'output')} />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Configuration Side Panel */}
                        <NodeConfigPanel />

                        {/* View Controls (Bottom Left) */}
                        <div className="absolute bottom-6 left-6 flex gap-2 z-50">
                            <div className="flex bg-white/70 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-1">
                                <button onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 0.2) }))} className="p-2 hover:bg-white/50 rounded-lg text-slate-600" title="Zoom Out"><ZoomOut size={18} /></button>
                                <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} className="px-3 hover:bg-white/50 rounded-lg text-slate-600 font-mono text-xs flex items-center">{Math.round(viewport.zoom * 100)}%</button>
                                <button onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 2.5) }))} className="p-2 hover:bg-white/50 rounded-lg text-slate-600" title="Zoom In"><ZoomIn size={18} /></button>
                            </div>
                            <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} className="p-2 bg-white/70 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 text-slate-600 hover:bg-white/50" title="Fit to Screen"><Maximize size={20} /></button>
                        </div>

                        {/* Menus Layer (Absolute positioned) */}
                        <div
                            className="absolute top-8 right-8 flex flex-col gap-4 z-50"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {/* Add Knowledge Menu */}
                            <div className="relative">
                                <AddNodeButton
                                    label="Add Knowledge"
                                    onClick={() => setPickerState({ type: pickerState.type === 'asset' ? null : 'asset', x: 0, y: 0 })}
                                />
                                {(pickerState.type === 'asset' || showAssetPicker) && (
                                    <div
                                        className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[20px] shadow-xl border border-slate-100 overflow-hidden z-50 ring-1 ring-black/5 custom-scrollbar"
                                        style={pickerState.x !== 0 ? { position: 'fixed', left: pickerState.x, top: pickerState.y, marginTop: 0 } : {}}
                                    >
                                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">Select Data Source</div>
                                        <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
                                            {assets.map(asset => (
                                                <button
                                                    key={asset.id}
                                                    draggable
                                                    onDragStart={(e) => handleMenuDragStart(e, 'asset', asset.id)}
                                                    onClick={() => handleAddAsset(asset.id)}
                                                    className="w-full text-left px-3 py-3 hover:bg-slate-50 rounded-xl text-sm flex items-center gap-3 transition-colors group cursor-grab active:cursor-grabbing"
                                                >
                                                    <div className="bg-white border border-slate-200 p-2 rounded-lg text-slate-500 group-hover:text-primary-600 group-hover:border-primary-200 transition-colors">
                                                        {React.createElement(getAssetIcon(asset.type), { size: 16 })}
                                                    </div>
                                                    <span className="truncate font-medium text-slate-700">{asset.name}</span>
                                                </button>
                                            ))}
                                            {assets.length === 0 && <div className="p-4 text-xs text-center text-slate-400">No assets found</div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Add Action Menu */}
                            <div className="relative">
                                <AddNodeButton
                                    label="Add Action"
                                    onClick={() => setPickerState({ type: pickerState.type === 'tool' ? null : 'tool', x: 0, y: 0 })}
                                />
                                {(pickerState.type === 'tool' || showToolPicker) && (
                                    <div
                                        className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[20px] shadow-xl border border-slate-100 overflow-hidden z-50 ring-1 ring-black/5"
                                        style={pickerState.x !== 0 ? { position: 'fixed', left: pickerState.x, top: pickerState.y, marginTop: 0 } : {}}
                                    >
                                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">Select Capability</div>
                                        <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">

                                            {/* LangGraph Nodes */}
                                            <div className="text-xs font-bold text-slate-500 uppercase px-1 mb-2 mt-2">Flow Logic & AI</div>
                                            <button onClick={() => handleAddTool(AgentTool.LLM_NODE)} className="w-full text-left p-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-sm text-slate-700">
                                                <div className="p-1.5 bg-cyan-100 text-cyan-600 rounded-md"><Cpu size={16} /></div>
                                                LLM / Chain Step
                                            </button>
                                            <button onClick={() => handleAddTool(AgentTool.ROUTER_CONDITIONAL)} className="w-full text-left p-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-sm text-slate-700">
                                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md"><GitBranch size={16} /></div>
                                                Logic Router
                                            </button>
                                            <button onClick={() => handleAddTool(AgentTool.HUMAN_INTERRUPT)} className="w-full text-left p-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-sm text-slate-700">
                                                <div className="p-1.5 bg-pink-100 text-pink-600 rounded-md"><UserCheck size={16} /></div>
                                                Human Approval
                                            </button>
                                            <button onClick={() => handleAddTool(AgentTool.END_NODE)} className="w-full text-left p-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-sm text-slate-700">
                                                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><StopCircle size={16} /></div>
                                                End Workflow
                                            </button>
                                            <div className="my-2 border-b border-slate-100" />

                                            <div className="text-xs font-bold text-slate-500 uppercase px-1 mb-2">Available Actions</div>
                                            {Object.values(AgentTool).map(tool => {
                                                if ([AgentTool.LLM_NODE, AgentTool.ROUTER_CONDITIONAL, AgentTool.HUMAN_INTERRUPT, AgentTool.END_NODE].includes(tool)) return null;
                                                const ToolIcon = getToolIconComponent(tool);
                                                return (
                                                    <button
                                                        key={tool}
                                                        draggable
                                                        onDragStart={(e) => handleMenuDragStart(e, 'tool', tool)}
                                                        disabled={editingAgent.tools?.includes(tool)}
                                                        onClick={() => handleAddTool(tool)}
                                                        className="w-full text-left px-3 py-3 hover:bg-slate-50 rounded-xl text-sm flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group cursor-grab active:cursor-grabbing"
                                                    >
                                                        <div className="bg-white border border-slate-200 p-2 rounded-lg text-slate-500 group-hover:text-purple-600 group-hover:border-purple-200 transition-colors">
                                                            <ToolIcon size={16} />
                                                        </div>
                                                        <span className="truncate font-medium text-slate-700">{tool}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
