
import { KnowledgeAsset, DocStatus, AssetType, User, UserRole, Agent, AgentTool, ChatSession } from './types';

export const APP_NAME = "OpenKB";

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@openkb.ai', role: UserRole.ADMIN, status: 'Active', lastActive: 'Just now', plan: 'Enterprise', joinedDate: '2023-01-15' },
  { id: 'u2', name: 'Sarah Connor', email: 'sarah@openkb.ai', role: UserRole.EDITOR, status: 'Active', lastActive: '2 hours ago', plan: 'Pro', joinedDate: '2023-02-20' },
  { id: 'u3', name: 'John Smith', email: 'john@openkb.ai', role: UserRole.VIEWER, status: 'Inactive', lastActive: '1 day ago', plan: 'Free', joinedDate: '2023-03-10' },
  { id: 'u4', name: 'Emily Chen', email: 'emily@openkb.ai', role: UserRole.EDITOR, status: 'Active', lastActive: '5 mins ago', plan: 'Pro', joinedDate: '2023-04-05' },
  { id: 'u5', name: 'Michael Scott', email: 'michael@dunder.com', role: UserRole.VIEWER, status: 'Active', lastActive: '3 days ago', plan: 'Free', joinedDate: '2023-04-12' },
  { id: 'u6', name: 'Dwight Schrute', email: 'dwight@dunder.com', role: UserRole.ADMIN, status: 'Active', lastActive: '1 hour ago', plan: 'Enterprise', joinedDate: '2023-04-12' },
  { id: 'u7', name: 'Jim Halpert', email: 'jim@dunder.com', role: UserRole.EDITOR, status: 'Active', lastActive: '4 hours ago', plan: 'Pro', joinedDate: '2023-04-15' },
  { id: 'u8', name: 'Pam Beesly', email: 'pam@dunder.com', role: UserRole.EDITOR, status: 'Inactive', lastActive: '1 week ago', plan: 'Pro', joinedDate: '2023-04-18' },
  { id: 'u9', name: 'Ryan Howard', email: 'ryan@dunder.com', role: UserRole.VIEWER, status: 'Inactive', lastActive: '2 months ago', plan: 'Free', joinedDate: '2023-05-01' },
  { id: 'u10', name: 'Stanley Hudson', email: 'stanley@dunder.com', role: UserRole.VIEWER, status: 'Active', lastActive: '10 mins ago', plan: 'Free', joinedDate: '2023-05-05' },
  { id: 'u11', name: 'Kevin Malone', email: 'kevin@dunder.com', role: UserRole.VIEWER, status: 'Active', lastActive: 'Yesterday', plan: 'Free', joinedDate: '2023-05-10' },
  { id: 'u12', name: 'Angela Martin', email: 'angela@dunder.com', role: UserRole.ADMIN, status: 'Active', lastActive: 'Just now', plan: 'Enterprise', joinedDate: '2023-05-12' },
];

export const MOCK_INITIAL_ASSETS: KnowledgeAsset[] = [
  { id: '1', name: 'project_charter_v3.pdf', type: AssetType.FILE, details: '1.2 MB', dateIndexed: '2023-10-24', status: DocStatus.INDEXED, isActive: true },
  { id: '2', name: 'https://docs.stripe.com/api', type: AssetType.WEBSITE, details: 'Crawled 45 pages', dateIndexed: '2023-10-25', status: DocStatus.INDEXED, isActive: true },
  { id: '3', name: 'Production_DB_Replica', type: AssetType.DATABASE, details: 'PostgreSQL (Read-Only)', dateIndexed: '2023-10-26', status: DocStatus.PENDING, isActive: false },
  { id: '4', name: 'Q3 Town Hall Recording', type: AssetType.INTEGRATION, details: 'YouTube (Video ID: dX839s)', dateIndexed: '2023-10-27', status: DocStatus.INDEXED, isActive: true },
  { id: '5', name: 'Marketing_Q4_Plan.docx', type: AssetType.FILE, details: '4.5 MB', dateIndexed: '2023-10-28', status: DocStatus.INDEXED, isActive: true },
  { id: '6', name: 'Employee_Handbook_2024.pdf', type: AssetType.FILE, details: '2.8 MB', dateIndexed: '2023-10-29', status: DocStatus.INDEXED, isActive: true },
  { id: '7', name: 'Competitor_Analysis_Report.pdf', type: AssetType.FILE, details: '1.5 MB', dateIndexed: '2023-10-30', status: DocStatus.INDEXED, isActive: false },
  { id: '8', name: 'https://react.dev', type: AssetType.WEBSITE, details: 'Crawled 120 pages', dateIndexed: '2023-11-01', status: DocStatus.INDEXED, isActive: true },
  { id: '9', name: 'Sales_Records_2023', type: AssetType.DATABASE, details: 'MySQL', dateIndexed: '2023-11-02', status: DocStatus.INDEXED, isActive: true },
  { id: '10', name: 'Product Demo Video', type: AssetType.INTEGRATION, details: 'YouTube (Video ID: abc123xyz)', dateIndexed: '2023-11-03', status: DocStatus.INDEXED, isActive: true },
  { id: '11', name: 'Q4 Financials.xlsx', type: AssetType.FILE, details: '500 KB', dateIndexed: '2023-11-04', status: DocStatus.PENDING, isActive: true },
  { id: '12', name: 'https://tailwindcss.com/docs', type: AssetType.WEBSITE, details: 'Crawled 85 pages', dateIndexed: '2023-11-05', status: DocStatus.INDEXED, isActive: true },
  { id: '13', name: 'Legal_Contracts_Archive', type: AssetType.DATABASE, details: 'MongoDB', dateIndexed: '2023-11-06', status: DocStatus.INDEXED, isActive: false },
  { id: '14', name: 'CEO Interview 2024', type: AssetType.INTEGRATION, details: 'YouTube (Video ID: interview24)', dateIndexed: '2023-11-07', status: DocStatus.ERROR, isActive: false },
  { id: '15', name: 'Design_System_Guidelines.pdf', type: AssetType.FILE, details: '12 MB', dateIndexed: '2023-11-08', status: DocStatus.INDEXED, isActive: true },
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'default',
    name: 'General Assistant',
    role: 'Helpful Assistant',
    description: 'Standard agent with access to all general documents.',
    systemInstructions: 'You are a helpful general assistant. Answer questions based on all available knowledge.',
    allowedAssetIds: ['1', '2', '3', '4', '6', '8'],
    tools: [AgentTool.RAG_SEARCH],
    color: 'bg-blue-600'
  },
  {
    id: 'assignment_agent',
    name: 'Assignment Bot',
    role: 'Workflow Specialist',
    description: 'Reads requirements and writes formal assignment documents.',
    systemInstructions: 'You are an Assignment Specialist. Your workflow is to READ requirements from the knowledge base and WRITE structured assignment documents or reports.',
    allowedAssetIds: ['1', '5'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.DOC_READER, AgentTool.DOC_WRITER],
    color: 'bg-indigo-600'
  },
  {
    id: 'hr_bot',
    name: 'HR Onboarding',
    role: 'HR Specialist',
    description: 'Manages onboarding, sends welcome emails, and notifies managers.',
    systemInstructions: 'You are an HR Onboarding Specialist.',
    allowedAssetIds: ['6'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.EMAIL_SENDER, AgentTool.NOTIFICATION],
    color: 'bg-pink-600'
  },
  {
    id: 'tech_support',
    name: 'Tech Support Bot',
    role: 'Technical Expert',
    description: 'Specializes in API docs and database schemas.',
    systemInstructions: 'You are a technical support engineer.',
    allowedAssetIds: ['2', '3', '8', '9', '12'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.WEB_BROWSER],
    color: 'bg-purple-600'
  },
  {
    id: 'legal_advisor',
    name: 'Legal Compliance',
    role: 'Legal Advisor',
    description: 'Reviews contracts and ensures compliance with regulations.',
    systemInstructions: 'You are a Legal Advisor. Review texts for compliance issues.',
    allowedAssetIds: ['13', '15'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.DOC_READER],
    color: 'bg-slate-700'
  },
  {
    id: 'marketing_guru',
    name: 'Marketing Guru',
    role: 'Content Strategist',
    description: 'Generates social media copy and marketing strategies.',
    systemInstructions: 'You are a Creative Content Strategist.',
    allowedAssetIds: ['5', '7'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.DOC_WRITER],
    color: 'bg-orange-600'
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    role: 'Data Scientist',
    description: 'Analyzes datasets and provides insights.',
    systemInstructions: 'You are a Data Analyst.',
    allowedAssetIds: ['9', '11'],
    tools: [AgentTool.DATA_ANALYSIS, AgentTool.RAG_SEARCH],
    color: 'bg-teal-600'
  },
  {
    id: 'code_reviewer',
    name: 'Code Reviewer',
    role: 'Senior Engineer',
    description: 'Reviews code for bugs, style, and security vulnerabilities.',
    systemInstructions: 'You are a Senior Software Engineer conducting code reviews.',
    allowedAssetIds: ['2', '8', '12'],
    tools: [AgentTool.RAG_SEARCH],
    color: 'bg-zinc-800'
  },
  {
    id: 'travel_planner',
    name: 'Travel Planner',
    role: 'Concierge',
    description: 'Plans itineraries and books flights/hotels.',
    systemInstructions: 'You are a Travel Concierge.',
    allowedAssetIds: [],
    tools: [AgentTool.WEB_BROWSER, AgentTool.EMAIL_SENDER],
    color: 'bg-sky-500'
  },
  {
    id: 'research_assistant',
    name: 'Research Aide',
    role: 'Academic Researcher',
    description: 'Finds papers, summarizes findings, and drafts abstracts.',
    systemInstructions: 'You are an Academic Research Assistant.',
    allowedAssetIds: ['1', '6', '7', '15'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.WEB_BROWSER, AgentTool.DOC_WRITER],
    color: 'bg-amber-600'
  },
  {
    id: 'sales_rep',
    name: 'Sales Rep',
    role: 'Account Executive',
    description: 'Drafts outreach emails and prepares sales decks.',
    systemInstructions: 'You are an Aggressive Sales Representative.',
    allowedAssetIds: ['5', '9'],
    tools: [AgentTool.EMAIL_SENDER, AgentTool.RAG_SEARCH],
    color: 'bg-green-600'
  },
  {
    id: 'security_audit',
    name: 'SecOps Bot',
    role: 'Security Engineer',
    description: 'Analyzes logs and config files for vulnerabilities.',
    systemInstructions: 'You are a Security Operations Engineer.',
    allowedAssetIds: ['3', '9', '12'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.NOTIFICATION],
    color: 'bg-red-700'
  },
  {
    id: 'customer_support',
    name: 'Support Agent',
    role: 'Customer Service',
    description: 'Answers customer tickets and resolves issues.',
    systemInstructions: 'You are a friendly Customer Support Agent.',
    allowedAssetIds: ['6', '2'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.EMAIL_SENDER],
    color: 'bg-blue-500'
  },
  {
    id: 'product_manager',
    name: 'Product PM',
    role: 'Product Manager',
    description: 'Writes PRDs and manages backlog prioritization.',
    systemInstructions: 'You are a Senior Product Manager.',
    allowedAssetIds: ['1', '5', '8'],
    tools: [AgentTool.DOC_WRITER, AgentTool.RAG_SEARCH],
    color: 'bg-indigo-500'
  },
  {
    id: 'translator_bot',
    name: 'Polyglot',
    role: 'Translator',
    description: 'Translates documents between languages.',
    systemInstructions: 'You are a professional Translator.',
    allowedAssetIds: [],
    tools: [AgentTool.DOC_READER, AgentTool.DOC_WRITER],
    color: 'bg-violet-600'
  },
  {
    id: 'financial_advisor',
    name: 'Finance Bot',
    role: 'Financial Analyst',
    description: 'Reviews spreadsheets and financial reports.',
    systemInstructions: 'You are a Certified Financial Analyst.',
    allowedAssetIds: ['11'],
    tools: [AgentTool.DATA_ANALYSIS, AgentTool.DOC_READER],
    color: 'bg-emerald-700'
  },
  {
    id: 'social_media',
    name: 'Social Bot',
    role: 'SMM Manager',
    description: 'Drafts tweets, LinkedIn posts, and schedules content.',
    systemInstructions: 'You are a Social Media Manager.',
    allowedAssetIds: ['5', '10'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.WEB_BROWSER],
    color: 'bg-pink-500'
  },
  {
    id: 'executive_coach',
    name: 'Exec Coach',
    role: 'Leadership Coach',
    description: 'Provides advice on leadership and management.',
    systemInstructions: 'You are an Executive Leadership Coach.',
    allowedAssetIds: ['6'],
    tools: [AgentTool.RAG_SEARCH],
    color: 'bg-cyan-600'
  },
  {
    id: 'qa_tester',
    name: 'QA Bot',
    role: 'QA Engineer',
    description: 'Generates test cases and bug reports.',
    systemInstructions: 'You are a Quality Assurance Engineer.',
    allowedAssetIds: ['1', '2', '8'],
    tools: [AgentTool.RAG_SEARCH, AgentTool.NOTIFICATION],
    color: 'bg-lime-600'
  },
  {
    id: 'event_planner',
    name: 'Event Bot',
    role: 'Coordinator',
    description: 'Coordinates schedules and logistics.',
    systemInstructions: 'You are an Event Coordinator.',
    allowedAssetIds: ['4'],
    tools: [AgentTool.EMAIL_SENDER, AgentTool.GOOGLE_DRIVE],
    color: 'bg-fuchsia-600'
  },
  {
    id: 'compliance_officer',
    name: 'Compliance Bot',
    role: 'Officer',
    description: 'Checks for regulatory adherence.',
    systemInstructions: 'You are a Compliance Officer.',
    allowedAssetIds: ['13', '6'],
    tools: [AgentTool.DOC_READER, AgentTool.NOTIFICATION],
    color: 'bg-slate-600'
  },
  {
    id: 'recruiter_bot',
    name: 'Recruiter',
    role: 'Talent Acquisition',
    description: 'Screens resumes and schedules interviews.',
    systemInstructions: 'You are a Technical Recruiter.',
    allowedAssetIds: ['6'],
    tools: [AgentTool.EMAIL_SENDER, AgentTool.DOC_READER],
    color: 'bg-rose-500'
  },
  {
    id: 'scrum_master',
    name: 'Scrum Master',
    role: 'Agile Coach',
    description: 'Facilitates standups and sprint planning.',
    systemInstructions: 'You are a Scrum Master.',
    allowedAssetIds: ['1'],
    tools: [AgentTool.RAG_SEARCH],
    color: 'bg-blue-800'
  },
  {
    id: 'inventory_mgr',
    name: 'Inventory Bot',
    role: 'Logistics Manager',
    description: 'Tracks stock levels and orders.',
    systemInstructions: 'You are an Inventory Manager.',
    allowedAssetIds: ['9'],
    tools: [AgentTool.DATA_ANALYSIS, AgentTool.NOTIFICATION],
    color: 'bg-stone-600'
  }
];

export const MOCK_SESSIONS: ChatSession[] = [
  {
    id: 's1',
    agentId: 'default',
    title: 'Project Charter Summary',
    lastModified: new Date(Date.now() - 10000000).toISOString(),
    messages: [
      { id: 'm1', role: 'user', content: 'Summarize the project charter.', timestamp: new Date(Date.now() - 10000000) },
      { id: 'm2', role: 'model', content: 'The project charter outlines the scope for the Q3 migration...', timestamp: new Date(Date.now() - 9999000), sources: [{ id: '1', title: 'project_charter_v3.pdf', type: AssetType.FILE }] }
    ]
  },
  {
    id: 's2',
    agentId: 'hr_bot',
    title: 'Onboarding Checklist',
    lastModified: new Date(Date.now() - 5000000).toISOString(),
    messages: [
      { id: 'm3', role: 'user', content: 'What is the checklist for new hires?', timestamp: new Date(Date.now() - 5000000) }
    ]
  },
  {
    id: 's3',
    agentId: 'tech_support',
    title: 'API Authentication',
    lastModified: new Date(Date.now() - 2000000).toISOString(),
    messages: [
      { id: 'm4', role: 'user', content: 'How do I authenticate with the Stripe API?', timestamp: new Date(Date.now() - 2000000) },
      { id: 'm5', role: 'model', content: 'You authenticate by passing your secret key in the Authorization header...', timestamp: new Date(Date.now() - 1900000), sources: [{ id: '2', title: 'https://docs.stripe.com/api', type: AssetType.WEBSITE }] }
    ]
  },
  {
    id: 's4',
    agentId: 'default',
    title: 'Meeting Notes',
    lastModified: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      { id: 'm6', role: 'user', content: 'Draft notes for the town hall.', timestamp: new Date(Date.now() - 86400000) }
    ]
  },
  {
    id: 's5',
    agentId: 'assignment_agent',
    title: 'Q4 Report Draft',
    lastModified: new Date(Date.now() - 1200000).toISOString(),
    messages: [
      { id: 'm7', role: 'user', content: 'Help me write the Q4 marketing analysis.', timestamp: new Date(Date.now() - 1200000) }
    ]
  }
];

export const THEME = {
  primary: 'bg-blue-700',
  primaryHover: 'hover:bg-blue-800',
  primaryText: 'text-blue-700',
  secondary: 'bg-gray-200',
  success: 'bg-green-600',
  successText: 'text-green-600',
  background: 'bg-gray-50'
};
