import React, { useState } from 'react';
import { Comment } from '../../../types';
import { X, Send, CheckCircle2, Circle } from 'lucide-react';

interface CommentsSidebarProps {
    comments: Comment[];
    onAddComment: (text: string) => void;
    onResolveComment: (id: string) => void;
    onClose: () => void;
}

export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({ comments, onAddComment, onResolveComment, onClose }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    return (
        <div className="w-80 h-full bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Comments</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 && (
                    <div className="text-center text-slate-400 mt-10">
                        <p className="text-sm">No comments yet.</p>
                    </div>
                )}
                {comments.map(comment => (
                    <div key={comment.id} className={`p-3 rounded-xl border ${comment.isResolved ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                    {comment.authorName.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-slate-700">{comment.authorName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`text-sm text-slate-800 ${comment.isResolved ? 'line-through text-slate-500' : ''}`}>{comment.content}</p>
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={() => onResolveComment(comment.id)}
                                className={`text-xs flex items-center gap-1 ${comment.isResolved ? 'text-green-600' : 'text-slate-400 hover:text-green-600'}`}
                            >
                                {comment.isResolved ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                {comment.isResolved ? 'Resolved' : 'Resolve'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};
