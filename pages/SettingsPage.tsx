
import React, { useState } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Key, CreditCard, Cpu, Eye, EyeOff, CheckCircle2, Plus, Trash2, Github, Chrome, Twitter, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

interface ConnectedModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  apiKeyPreview: string;
  lastUsed: string;
}

const PROVIDER_MODELS: Record<string, string[]> = {
  'Google Gemini': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
  'OpenAI': ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  'Anthropic': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  'Mistral AI': ['mistral-large', 'mistral-medium', 'mistral-small'],
  'Local (Ollama)': ['llama3', 'mistral', 'gemma', 'phi3']
};

import { PageContainer } from '../components/layouts/PageContainer';
import { GlassCard } from '../components/ui/GlassCard';

// ... (previous interfaces and constants kept the same, just showing the component structure change)

export const SettingsPage: React.FC<SettingsViewProps> = ({ user, onUpdateUser }) => {
  // ... (state lines 33-47 unchanged)
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Connected Models State
  const [connectedModels, setConnectedModels] = useState<ConnectedModel[]>([
    { id: '1', name: 'Primary Gemini', provider: 'Google Gemini', modelId: 'gemini-1.5-pro', apiKeyPreview: 'AIzaSy...', lastUsed: 'Just now' },
    { id: '2', name: 'Backup GPT', provider: 'OpenAI', modelId: 'gpt-4-turbo', apiKeyPreview: 'sk-proj...', lastUsed: '2 days ago' }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Model Form State
  const [newModelConfig, setNewModelConfig] = useState({ provider: 'Google Gemini', name: '', apiKey: '', modelId: 'gemini-1.5-pro' });

  const handleProfileSave = () => {
    onUpdateUser({ name, email });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  const handleDeleteModel = (id: string) => {
    setConnectedModels(prev => prev.filter(m => m.id !== id));
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    const newModel: ConnectedModel = {
      id: Date.now().toString(),
      name: newModelConfig.name || `${newModelConfig.provider} Connection`,
      provider: newModelConfig.provider,
      modelId: newModelConfig.modelId,
      apiKeyPreview: newModelConfig.apiKey.substring(0, 6) + '...',
      lastUsed: 'Never'
    };
    setConnectedModels([...connectedModels, newModel]);
    setShowAddModal(false);
    setNewModelConfig({ provider: 'Google Gemini', name: '', apiKey: '', modelId: 'gemini-1.5-pro' });
  };

  return (
    <PageContainer>
      <div className="space-y-8">

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-normal text-slate-900 tracking-tight mb-2">Settings</h1>
            <p className="text-slate-500 text-lg">Manage your account preferences and AI model connections.</p>
          </div>
        </div>

        {/* Profile Settings */}
        <GlassCard>
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 border-4 border-slate-50 text-2xl font-bold shadow-sm">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-primary-600 transition-colors shadow-sm">
                <Plus size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-medium text-slate-900">Personal Profile</h2>
              <p className="text-sm text-slate-500">Update your photo and personal details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            <div>
              <Input
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <Button
              onClick={handleProfileSave}
              variant={isProfileSaved ? "success" : "primary"}
              icon={isProfileSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
              className="px-8"
            >
              {isProfileSaved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </GlassCard>

        {/* Connected Models List */}
        <GlassCard>
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Cpu size={24} />
              </div>
              <div>
                <h2 className="text-xl font-medium text-slate-900">Connected Models</h2>
                <p className="text-sm text-slate-500">Manage your LLM connections.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus size={16} /> Add Model
            </button>
          </div>

          <div className="space-y-4">
            {connectedModels.map(model => (
              <div key={model.id} className="flex items-center justify-between p-5 rounded-[16px] border border-slate-200 hover:border-primary-300 hover:shadow-sm transition-all bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                    {model.provider.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{model.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">{model.provider}</span>
                      <span>•</span>
                      <span>{model.modelId}</span>
                      <span>•</span>
                      <span>Last used: {model.lastUsed}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteModel(model.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Social Accounts */}
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Github size={24} />
            </div>
            <div>
              <h2 className="text-xl font-medium text-slate-900">Connected Accounts</h2>
              <p className="text-sm text-slate-500">Enable social login for easier access.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-[16px] border border-slate-100">
              <div className="flex items-center gap-3">
                <Github className="text-slate-900" />
                <span className="font-medium text-slate-700">GitHub</span>
              </div>
              <button className="text-sm font-medium text-red-600 hover:underline">Disconnect</button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-[16px] border border-slate-100">
              <div className="flex items-center gap-3">
                <Chrome className="text-primary-600" />
                <span className="font-medium text-slate-700">Google</span>
              </div>
              <button className="text-sm font-medium text-primary-600 hover:underline">Connect</button>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Add Model Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Model" className="max-w-md">
        <div className="p-6">
          <form onSubmit={handleAddModel} className="space-y-5">
            <div>
              <Input
                label="Connection Name"
                required
                placeholder="e.g. Work Gemini"
                value={newModelConfig.name}
                onChange={(e) => setNewModelConfig({ ...newModelConfig, name: e.target.value })}
              />
            </div>
            <div>
              <Select
                label="Provider"
                value={newModelConfig.provider}
                onChange={(e) => setNewModelConfig({ ...newModelConfig, provider: e.target.value })}
                options={Object.keys(PROVIDER_MODELS).map(p => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <Input
                label="API Key"
                type="password"
                required
                placeholder="sk-..."
                value={newModelConfig.apiKey}
                onChange={(e) => setNewModelConfig({ ...newModelConfig, apiKey: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
            >
              Save Connection
            </Button>
          </form>
        </div>
      </Modal>
    </PageContainer>
  );
};


