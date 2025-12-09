import { AgentTool } from '../../types';

export type NodeType = 'trigger' | 'brain' | 'asset' | 'tool';

export interface WorkflowNode {
    id: string; // Unique UI ID
    type: NodeType;
    dataId: string; // ID for logic (asset ID, tool enum, etc.)
    label: string;
    subLabel?: string;
    x: number;
    y: number;
    icon: any;
    color: string;
    config?: Record<string, any>; // Store node specific settings
}

export interface Edge {
    id: string;
    source: string;
    target: string;
}
