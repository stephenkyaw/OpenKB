
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { KnowledgeAsset, DocStatus, AssetType } from '../types';
import { CloudUpload, FileText, Trash2, CheckCircle2, Clock, AlertCircle, Globe, Database, Plus, AppWindow, Mail, Cloud, Youtube, Link, Eye, Download, X, Power, HardDrive, KeyRound, Search, ChevronLeft, ChevronRight, MoreVertical, Plug } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageContainer } from '../components/layouts/PageContainer';
import { GlassCard } from '../components/ui/GlassCard';

const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case AssetType.FILE: return FileText;
    case AssetType.WEBSITE: return Globe;
    case AssetType.DATABASE: return Database;
    case AssetType.INTEGRATION: return AppWindow;
    default: return FileText;
  }
};

interface KnowledgeBaseViewProps {
  assets: KnowledgeAsset[];
  onAddAsset: (asset: Partial<KnowledgeAsset>) => void;
  onRemoveAsset: (id: string) => void;
  onToggleAssetStatus: (id: string) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBaseViewProps> = ({ assets, onAddAsset, onRemoveAsset, onToggleAssetStatus }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<AssetType>(AssetType.FILE);
  const [dragActive, setDragActive] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<KnowledgeAsset | null>(null);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Connection Modal State
  const [connectingService, setConnectingService] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Form States
  const [urlInput, setUrlInput] = useState('');
  const [dbConfig, setDbConfig] = useState({ host: '', type: 'PostgreSQL', database: '' });
  const [youtubeInput, setYoutubeInput] = useState('');

  // --- Filtering & Pagination Logic ---
  const filteredAssets = assets.filter(a => {
    const matchesTab = a.type === activeTab;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    onAddAsset({
      name: file.name,
      type: AssetType.FILE,
      details: (file.size / 1024).toFixed(1) + ' KB',
      status: DocStatus.PENDING
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddWebsite = () => {
    if (!urlInput) return;
    onAddAsset({
      name: urlInput,
      type: AssetType.WEBSITE,
      details: 'Pending Crawl',
      status: DocStatus.PENDING
    });
    setUrlInput('');
  };

  const handleAddDatabase = () => {
    if (!dbConfig.host || !dbConfig.database) return;
    onAddAsset({
      name: `${dbConfig.type} - ${dbConfig.database}`,
      type: AssetType.DATABASE,
      details: dbConfig.host,
      status: DocStatus.PENDING
    });
    setDbConfig({ host: '', type: 'PostgreSQL', database: '' });
  };

  const openConnectionModal = (service: string) => {
    setConnectingService(service);
    setAccountEmail('');
  };

  const handleConnectService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingService || !accountEmail) return;

    setIsConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      onAddAsset({
        name: `${connectingService} - ${accountEmail}`,
        type: AssetType.INTEGRATION,
        details: `Connected Account (${connectingService})`,
        status: DocStatus.INDEXED
      });
      setIsConnecting(false);
      setConnectingService(null);
    }, 1000);
  };

  const handleYoutubeAdd = () => {
    if (!youtubeInput) return;
    onAddAsset({
      name: `YouTube Video: ${youtubeInput}`,
      type: AssetType.INTEGRATION,
      details: 'Video Transcript',
      status: DocStatus.PENDING
    });
    setYoutubeInput('');
  };

  const getStatusChip = (status: DocStatus) => {
    switch (status) {
      case DocStatus.INDEXED:
        return <Badge variant="success"><CheckCircle2 size={12} /> Ready</Badge>;
      case DocStatus.PENDING:
        return <Badge variant="warning"><Clock size={12} /> Indexing</Badge>;
      default:
        return <Badge variant="error"><AlertCircle size={12} /> Error</Badge>;
    }
  };

  // --- Sub-Components (Modals) ---

  const PreviewModal = () => (
    <Modal isOpen={!!previewAsset} onClose={() => setPreviewAsset(null)} title={previewAsset?.name} className="max-w-3xl">
      <div className="bg-slate-50/50 px-8 py-2 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-500 mb-6 -mx-8 -mt-2">
        <span className="font-bold uppercase tracking-wider">{previewAsset?.type}</span>
        <span>•</span>
        <span>{previewAsset?.details}</span>
        <span>•</span>
        <span>{previewAsset?.dateIndexed}</span>
      </div>

      <div className="prose prose-slate max-w-none">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Content Preview</h4>
        <p className="text-slate-600 leading-relaxed">
          [Preview of {previewAsset?.name}]
          <br /><br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          <br /><br />
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-sm text-slate-500 italic">
          This is a simulated preview of the indexed content.
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={() => setPreviewAsset(null)}>Close</Button>
        <Button variant="primary" icon={<Download size={16} />}>Download</Button>
      </div>
    </Modal>
  );

  const ConnectServiceModal = () => (
    <Modal
      isOpen={!!connectingService}
      onClose={() => setConnectingService(null)}
      title={`Connect ${connectingService}`}
      className="max-w-md"
    >
      <div className="p-6">
        <form onSubmit={handleConnectService}>
          <div className="mb-6">
            <Input
              label="Account Email / ID"
              required
              placeholder="name@example.com"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2 pl-1">We will redirect you to authenticate securely.</p>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isConnecting}
            disabled={isConnecting}
          >
            {isConnecting ? 'Authenticating...' : 'Authorize Access'}
          </Button>
        </form>
      </div>
    </Modal>
  );

  return (
    <PageContainer>
      <div className="space-y-6">

        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-4xl font-normal text-slate-900 tracking-tight mb-2">Knowledge Base</h1>
            <p className="text-slate-500 text-lg">Manage data sources and integrations for your OpenKB agent.</p>
          </div>
        </div>

        {/* Tabs & Active Content */}
        <GlassCard noPadding className="overflow-hidden">
          <div className="flex border-b border-white/50 overflow-x-auto p-1.5 gap-1 bg-white/40">
            {[
              { type: AssetType.FILE, icon: FileText, label: 'Documents' },
              { type: AssetType.WEBSITE, icon: Globe, label: 'Web Resources' },
              { type: AssetType.DATABASE, icon: Database, label: 'Databases' },
              { type: AssetType.INTEGRATION, icon: AppWindow, label: 'Apps & Integrations' },
            ].map((tab) => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all rounded-[24px]
                  ${activeTab === tab.type
                    ? 'text-slate-900 bg-white shadow-sm border border-slate-100/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Areas */}
          <div className="p-8 bg-transparent">

            {/* FILE UPLOAD VIEW */}
            {activeTab === AssetType.FILE && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[24px] p-12 flex flex-col items-center justify-center transition-all cursor-pointer group bg-white/40 backdrop-blur-sm
                  ${dragActive ? 'border-primary-500 bg-primary-50/50' : 'border-slate-300/60 hover:border-primary-400 hover:bg-white/60'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <CloudUpload className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-slate-900 font-medium text-lg">Click or drag files to upload</p>
                <p className="text-slate-400 text-sm mt-1">PDF, DOCX, TXT, XLSX (Max 20MB)</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt,.xlsx" />
              </div>
            )}

            {/* WEBSITE INPUT VIEW */}
            {activeTab === AssetType.WEBSITE && (
              <Card className="p-8 bg-white/40 backdrop-blur-md border-white/60 shadow-none">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      label="Add Website URL"
                      placeholder="https://docs.example.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      icon={<Globe className="h-5 w-5 text-slate-400" />}
                    />
                  </div>
                  <Button
                    onClick={handleAddWebsite}
                    variant="primary"
                    icon={<Plus size={18} />}
                    className="mb-0.5 h-[46px]"
                  >
                    Add Source
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-3 pl-1 flex items-center gap-1">
                  <AlertCircle size={12} /> The agent will crawl and index pages from this domain recursively.
                </p>
              </Card>
            )}

            {/* DATABASE INPUT VIEW */}
            {activeTab === AssetType.DATABASE && (
              <Card className="p-8 bg-white/40 backdrop-blur-md border-white/60 shadow-none">
                <h3 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <Database size={20} className="text-primary-600" /> New Database Connection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Select
                      label="Type"
                      value={dbConfig.type}
                      onChange={(e) => setDbConfig({ ...dbConfig, type: e.target.value })}
                      options={['PostgreSQL', 'MySQL', 'MongoDB', 'Snowflake'].map(t => ({ value: t, label: t }))}
                    />
                  </div>
                  <div>
                    <Input
                      label="Host"
                      placeholder="db.example.com"
                      value={dbConfig.host}
                      onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Database Name"
                      placeholder="production_db"
                      value={dbConfig.database}
                      onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleAddDatabase}
                    variant="primary"
                    icon={<Plug size={18} />}
                    className="px-8"
                  >
                    Connect Database
                  </Button>
                </div>
              </Card>
            )}

            {/* INTEGRATION VIEW */}
            {activeTab === AssetType.INTEGRATION && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Google Drive Card */}
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group bg-white/40 backdrop-blur-md border-white/60">
                  <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center mb-5 text-primary-600 shadow-md group-hover:scale-110 transition-transform">
                    <HardDrive size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Google Drive</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Connect docs, sheets, and slides.</p>
                  <Button
                    onClick={() => openConnectionModal('Google Drive')}
                    variant="ghost"
                    className="mt-auto w-full border border-white/50 bg-white/50 hover:bg-white text-primary-700 shadow-sm"
                  >
                    Connect
                  </Button>
                </Card>

                {/* Gmail Card */}
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group bg-white/40 backdrop-blur-md border-white/60">
                  <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center mb-5 text-red-600 shadow-md group-hover:scale-110 transition-transform">
                    <Mail size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Gmail</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Index emails and threads.</p>
                  <Button
                    onClick={() => openConnectionModal('Gmail')}
                    variant="ghost"
                    className="mt-auto w-full border border-white/50 bg-white/50 hover:bg-white text-red-700 shadow-sm"
                  >
                    Connect
                  </Button>
                </Card>

                {/* YouTube Card */}
                <Card className="p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group bg-white/40 backdrop-blur-md border-white/60">
                  <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center mb-5 text-red-600 shadow-md group-hover:scale-110 transition-transform">
                    <Youtube size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">YouTube</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Transcribe and index videos.</p>
                  <div className="w-full mt-auto space-y-3">
                    <Input
                      placeholder="Video URL..."
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      className="bg-white/50 border-white/50 focus:bg-white"
                    />
                    <Button
                      onClick={handleYoutubeAdd}
                      disabled={!youtubeInput}
                      variant="primary"
                      className="w-full bg-red-600 hover:bg-red-700 border-none shadow-lg shadow-red-600/20"
                    >
                      Add Video
                    </Button>
                  </div>
                </Card>
              </div>
            )}

          </div>
        </GlassCard>

        {/* Assets Table */}
        <GlassCard noPadding className="overflow-hidden">

          {/* Toolbar */}
          <div className="p-6 border-b border-white/50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/30">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Indexed Assets <span className="bg-white text-primary-600 border border-primary-100 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{filteredAssets.length}</span>
            </h2>

            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="block w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/50 rounded-full text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder-slate-400 transition-all font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/50 text-slate-400 uppercase tracking-wider font-bold text-[11px] border-b border-white/50">
                <tr>
                  <th className="px-8 py-5">Name</th>
                  <th className="px-8 py-5">Type / Details</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Active</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 text-base mb-0.5">{asset.name}</div>
                      <div className="text-xs text-slate-400">{asset.dateIndexed}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-slate-100 rounded-md text-slate-500">
                          {React.createElement(getAssetIcon(asset.type), { size: 14 })}
                        </span>
                        <span className="text-slate-600 font-medium">{asset.details}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {getStatusChip(asset.status)}
                    </td>
                    <td className="px-8 py-5">
                      {/* Modern Toggle Switch */}
                      <button
                        onClick={() => onToggleAssetStatus(asset.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                             ${asset.isActive ? 'bg-primary-600' : 'bg-slate-200'}`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out
                                ${asset.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="text-slate-400 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onRemoveAsset(asset.id)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedAssets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="mb-3 text-slate-200" />
                        <p>No assets found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Centered Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-center bg-white">
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm font-bold text-slate-700 px-4">
                  {currentPage} <span className="text-slate-400 font-normal">/</span> {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </GlassCard>

      </div>

      {/* Render Modals */}
      <PreviewModal />
      <ConnectServiceModal />
    </PageContainer>
  );
};

// Helper for icon component in DB add button
