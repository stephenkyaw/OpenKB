import React, { useState, useEffect } from 'react';
import { ProSidebar } from './layouts/ProSidebar';
import { AuthPage } from './pages/AuthPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { AgentsPage } from './pages/AgentsPage';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { NotesPage } from './pages/NotesPage';
import { ViewState, KnowledgeAsset, Message, DocStatus, ChatSession } from './types'; // Removed User, Agent (handled by hooks)
import { MOCK_INITIAL_ASSETS, MOCK_SESSIONS } from './constants';
import { generateRAGResponse } from './services/geminiService';

import { useAuth } from './hooks/useAuth';
import { useAgents } from './hooks/useAgents';

const App: React.FC = () => {
  // Domain Hooks
  const { user: currentUser, login, logout, updateUser } = useAuth();
  const { agents, saveAgent, deleteAgent, loading: agentsLoading } = useAgents();

  // Application View State
  const [activeView, setActiveView] = useState<ViewState>(ViewState.CHAT);

  // Data State (Legacy - To be moved to hooks/useKnowledge later)
  const [assets, setAssets] = useState<KnowledgeAsset[]>(MOCK_INITIAL_ASSETS);

  // Chat Session Management
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>(MOCK_SESSIONS[0].id);
  const [activeAgentId, setActiveAgentId] = useState<string>('agent-1'); // Default valid ID needed
  const [isThinking, setIsThinking] = useState(false);

  // Sync Active Agent ID with loaded agents
  useEffect(() => {
    if (agents.length > 0 && !agents.find(a => a.id === activeAgentId)) {
      setActiveAgentId(agents[0].id);
    }
  }, [agents, activeAgentId]);

  // Computed Active State
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Auth Handlers
  const handleLogin = async (userPartial: Partial<any>) => {
    try {
      await login(userPartial.email, 'password'); // Mock password
      setActiveView(ViewState.HOME);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Document/Asset Handlers
  const handleAddAsset = (asset: Partial<KnowledgeAsset>) => {
    const newAsset: KnowledgeAsset = {
      id: Date.now().toString(),
      name: asset.name || 'Untitled',
      type: asset.type!,
      details: asset.details || '',
      dateIndexed: new Date().toLocaleDateString(),
      status: DocStatus.PENDING,
      isActive: true
    };

    setAssets(prev => [newAsset, ...prev]);

    // Simulate Indexing Process
    setTimeout(() => {
      setAssets(prev => prev.map(a =>
        a.id === newAsset.id ? { ...a, status: DocStatus.INDEXED } : a
      ));
    }, 2500);
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleAssetStatus = (id: string) => {
    setAssets(prev => prev.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };



  // Agent Management Handlers
  // Agents are now managed by useAgents hook directly passed to AgentManagementView

  const handleChatWithAgent = (agentId: string) => {
    // Check if there is an existing empty session for this agent
    const emptySession = sessions.find(s => s.agentId === agentId && s.messages.length === 0);
    if (emptySession) {
      setActiveSessionId(emptySession.id);
    } else {
      // Create new
      handleNewChat(agentId);
    }
    setActiveAgentId(agentId);
    setActiveView(ViewState.CHAT);
  };

  // Chat Session Handlers
  const handleNewChat = (agentId: string = activeAgentId) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      agentId: agentId,
      title: 'New Conversation',
      messages: [],
      lastModified: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveAgentId(agentId);
    setActiveView(ViewState.CHAT);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setActiveAgentId(session.agentId); // Switch to the agent of this session
      setActiveView(ViewState.CHAT);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    if (activeSessionId === sessionId) {
      // If we deleted the active session, switch to the first available or create new
      if (newSessions.length > 0) {
        setActiveSessionId(newSessions[0].id);
        setActiveAgentId(newSessions[0].agentId);
      } else {
        handleNewChat(agents[0].id);
      }
    }
  };

  // Chat Message Handler
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    // Optimistic Update
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          title: s.messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : s.title,
          lastModified: new Date().toISOString()
        };
      }
      return s;
    }));

    setIsThinking(true);

    const currentAgent = agents.find(a => a.id === activeAgentId) || agents[0];

    // Call Gemini Service
    // Only pass ACTIVE assets to the agent
    const activeAssets = assets.filter(a => a.isActive);
    const aiResponseText = await generateRAGResponse(text, activeAssets, currentAgent);

    // Simulate finding sources (only from active assets)
    const permittedAssets = activeAssets.filter(a => currentAgent.allowedAssetIds.includes(a.id));
    const relevantAssets = permittedAssets
      .filter(a => a.status === DocStatus.INDEXED)
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.random() > 0.5 ? 1 : 2)
      .map(a => ({ id: a.id, title: a.name, type: a.type }));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: aiResponseText,
      timestamp: new Date(),
      sources: relevantAssets.length > 0 ? relevantAssets : undefined
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, aiMsg],
          lastModified: new Date().toISOString()
        };
      }
      return s;
    }));

    setIsThinking(false);
  };

  // Navigation Logic
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-25 text-slate-900 font-sans">
      <ProSidebar
        activeView={activeView}
        onChangeView={setActiveView}
        onLogout={handleLogout}
        user={currentUser}
        sessions={sessions}
        agents={agents}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Content Area - Clean Split Screen */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-25 z-0">
        {/* Global Mesh Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">

          {activeView === ViewState.HOME && (
            <HomePage
              user={currentUser}
              agents={agents}
              assets={assets}
              sessions={sessions}
              onNavigate={setActiveView}
              onSelectSession={handleSelectSession}
              onNewChat={() => handleNewChat(agents[0].id)}
            />
          )}

          {activeView === ViewState.KNOWLEDGE && (
            <KnowledgeBasePage
              assets={assets}
              onAddAsset={handleAddAsset}
              onRemoveAsset={handleRemoveAsset}
              onToggleAssetStatus={handleToggleAssetStatus}
            />
          )}

          {activeView === ViewState.NOTES && <NotesPage />}


          {activeView === ViewState.SETTINGS && (
            <SettingsPage
              user={currentUser}
              onUpdateUser={updateUser}
            />
          )}

          {activeView === ViewState.AGENTS && (
            <AgentsPage
              agents={agents}
              assets={assets}
              onSaveAgent={saveAgent}
              onDeleteAgent={deleteAgent}
              onChatWithAgent={handleChatWithAgent}
            />
          )}

          {activeView === ViewState.CHAT && (
            <ChatPage
              messages={activeSession?.messages || []}
              onSendMessage={handleSendMessage}
              isThinking={isThinking}
              agents={agents}
              activeAgentId={activeAgentId}
              onAgentChange={(agentId) => handleNewChat(agentId)}
              onNewChat={() => handleNewChat(activeAgentId)}
              sessionTitle={activeSession?.title}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;