import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { noteService } from '../services/noteService';
import { NoteEditor } from '../features/notes/components/NoteEditor';
import { Plus, Search, Grid, List, Clock, FileText, Trash2, MoreHorizontal } from 'lucide-react';

export const NotesPage: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
    const [dashboardMode, setDashboardMode] = useState<'grid' | 'list'>('grid');
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        const data = await noteService.getAll();
        setNotes(data);
    };

    const handleCreateNote = async () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await noteService.save(newNote);
        setCurrentNote(newNote);
        setView('editor');
    };

    const handleSelectNote = (note: Note) => {
        setCurrentNote(note);
        setView('editor');
    };

    const handleSaveNote = async (content: string, title: string, coverImage?: string, icon?: string) => {
        if (currentNote) {
            const updatedNote = { ...currentNote, content, title, coverImage, icon, updatedAt: new Date().toISOString() };
            await noteService.save(updatedNote);
            setCurrentNote(updatedNote);
            // Refresh list in background
            loadNotes();
        }
    };

    const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
            await noteService.delete(id);
            loadNotes();
        }
    };

    const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (view === 'editor' && currentNote) {
        return (
            <NoteEditor
                note={currentNote}
                onSave={handleSaveNote}
                onBack={() => {
                    setView('dashboard');
                    setCurrentNote(null);
                    loadNotes();
                }}
            />
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-[#FDFBFF] p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-normal text-slate-900 tracking-tight mb-2">Notes</h1>
                        <p className="text-slate-500 text-lg">Capture ideas and organize your thoughts.</p>
                    </div>
                    <button
                        onClick={handleCreateNote}
                        className="bg-primary-200 text-primary-900 px-6 py-4 rounded-[16px] hover:bg-primary-300 transition-all flex items-center gap-3 shadow-sm hover:shadow-md font-medium"
                    >
                        <Plus size={24} />
                        <span className="text-base">New Note</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-xl p-2 rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 flex-1 w-full pl-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-white/50 rounded-full text-sm focus:ring-2 focus:ring-primary-100 text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                    <div className="flex bg-white/50 p-1 rounded-full border border-white/50">
                        <button onClick={() => setDashboardMode('grid')} className={`p-2 rounded-full transition-all ${dashboardMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={18} /></button>
                        <button onClick={() => setDashboardMode('list')} className={`p-2 rounded-full transition-all ${dashboardMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
                    </div>
                </div>

                {/* Grid View */}
                {dashboardMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => handleSelectNote(note)}
                                className="group relative bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:bg-white/60 hover:border-white/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col p-6 overflow-hidden h-64"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-[16px] bg-amber-100 text-amber-600 flex items-center justify-center">
                                        <FileText size={24} />
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteNote(e, note.id)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-2 bg-transparent">{note.title || 'Untitled'}</h3>

                                <div className="text-xs text-slate-400 font-medium mb-auto flex items-center gap-1">
                                    <Clock size={12} /> {new Date(note.updatedAt).toLocaleDateString()}
                                </div>

                                <div className="prose prose-sm line-clamp-3 text-slate-500 text-xs pointer-events-none opacity-60">
                                    {/* Strip HTML for preview implies safe render or extraction, simplified here */}
                                    <span dangerouslySetInnerHTML={{ __html: note.content }} />
                                </div>
                            </div>
                        ))}
                        {/* New Note Card (Grid) */}
                        <div
                            onClick={handleCreateNote}
                            className="group relative border-2 border-dashed border-slate-200 rounded-[32px] hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-6 h-64 text-slate-400 hover:text-primary-600"
                        >
                            <Plus size={32} className="mb-2" />
                            <span className="font-bold">Create Note</span>
                        </div>
                    </div>
                ) : (
                    // List View
                    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/50 border-b border-white/50 text-slate-400 uppercase font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="px-8 py-5">Title</th>
                                    <th className="px-8 py-5">Preview</th>
                                    <th className="px-8 py-5">Last Edited</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/50">
                                {filteredNotes.map(note => (
                                    <tr key={note.id} onClick={() => handleSelectNote(note)} className="hover:bg-white/80 transition-colors cursor-pointer group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900 text-base flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                                    <FileText size={16} />
                                                </div>
                                                {note.title || 'Untitled'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="max-w-md truncate text-slate-500" dangerouslySetInnerHTML={{ __html: note.content.replace(/<[^>]*>?/gm, ' ').substring(0, 100) }} />
                                        </td>
                                        <td className="px-8 py-5 text-slate-500">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={(e) => handleDeleteNote(e, note.id)}
                                                className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
