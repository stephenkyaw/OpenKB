import React, { useState, useEffect } from 'react';
import { Document } from '../../../types';
import { documentService } from '../../../services/documentService';
import { FileText, Plus, Clock, MoreVertical, Trash2 } from 'lucide-react';

interface DocumentListProps {
    onSelectDocument: (doc: Document) => void;
    onCreateDocument: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ onSelectDocument, onCreateDocument }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        const docs = await documentService.getAll();
        setDocuments(docs);
        setLoading(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this document?')) {
            await documentService.delete(id);
            loadDocuments();
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Documents</h1>
                    <p className="text-slate-500 mt-1">Manage and edit your knowledge base documents</p>
                </div>
                <button
                    onClick={onCreateDocument}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
                >
                    <Plus size={20} />
                    New Document
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create New Card (optional alternative to button) */}

                    {documents.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => onSelectDocument(doc)}
                            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-[280px]"
                        >
                            <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center border-b border-slate-100 relative group-hover:bg-indigo-50/30 transition-colors">
                                <FileText size={48} className="text-indigo-300 group-hover:text-indigo-500 transition-colors mb-4" />
                                {/* Preview could go here */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDelete(e, doc.id)}
                                        className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                <h3 className="font-semibold text-slate-800 truncate" title={doc.title}>{doc.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                    <Clock size={12} />
                                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {documents.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No documents yet</p>
                            <p className="text-sm">Create your first document to get started</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
