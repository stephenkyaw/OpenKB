
export enum ViewState {
  AUTH = 'AUTH',
  HOME = 'HOME',
  CHAT = 'CHAT',
  KNOWLEDGE = 'KNOWLEDGE',
  SETTINGS = 'SETTINGS',
  AGENTS = 'AGENTS'
}

export enum DocStatus {
  INDEXED = 'Indexed',
  PENDING = 'Pending',
  ERROR = 'Error'
}

export enum AssetType {
  FILE = 'Document',
  WEBSITE = 'Website',
  DATABASE = 'Database',
  INTEGRATION = 'Integration'
}

export enum AgentTool {
  RAG_SEARCH = 'Knowledge Retrieval',
  DOC_READER = 'Document Reader',
  DOC_WRITER = 'Document Writer',
  WEB_BROWSER = 'Web Browser',
  DATA_ANALYSIS = 'Data Analysis',
  EMAIL_SENDER = 'Email Sender',
  NOTIFICATION = 'System Notification',
  GOOGLE_DRIVE = 'Google Drive',
  ROUTER_CONDITIONAL = 'Router / Logic',
  HUMAN_INTERRUPT = 'Human Approval',
  END_NODE = 'End Workflow',
  LLM_NODE = 'LLM / Chain Step'
}

export enum UserRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer'
}

export interface KnowledgeAsset {
  id: string;
  name: string;
  type: AssetType;
  details: string; // Size, URL, Connection String, or Account Name
  dateIndexed: string;
  status: DocStatus;
  isActive: boolean; // New field for toggle status
}

export interface Agent {
  id: string;
  name: string;
  role: string; // e.g., "Legal Expert"
  description: string;
  systemInstructions: string;
  allowedAssetIds: string[]; // IDs of assets this agent can access
  tools: AgentTool[]; // Workflow capabilities
  color: string;
}

export interface ChatSource {
  id: string;
  title: string;
  type?: AssetType;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  agentId: string;
  title: string;
  messages: Message[];
  lastModified: string; // ISO Date string
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'Free' | 'Pro' | 'Enterprise'; // Replaced Role with Plan
  role: UserRole;
  status: string;
  lastActive: string;
  avatarUrl?: string;
  joinedDate: string;
}
