import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, Sparkles, MessageSquare, MoreHorizontal, Share2, Image as ImageIcon, Smile, X } from 'lucide-react';
import '../documents.css';
import { Note, Comment } from '../../../types';
import { useDocumentAI } from '../hooks/useDocumentAI';
import { CommentsSidebar } from './CommentsSidebar';
import SuggestionList from './SuggestionList';
import { SlashCommand } from '../extensions/slashCommand';

interface NoteEditorProps {
    note?: Note;
    onSave: (content: string, title: string, coverImage?: string, icon?: string) => void;
    readOnly?: boolean;
    onBack?: () => void;
}

const getRandomCover = () => {
    const gradients = [
        'bg-gradient-to-r from-rose-100 to-teal-100',
        'bg-gradient-to-r from-blue-200 to-cyan-200',
        'bg-gradient-to-r from-fuchsia-200 to-stone-100',
        'bg-gradient-to-r from-amber-200 to-yellow-100',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
};

const getRandomIcon = () => {
    const icons = ['📝', '💡', '🚀', '🎨', '📚', '⚡', '💻', '🎯'];
    return icons[Math.floor(Math.random() * icons.length)];
};

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onBack, readOnly = false }) => {
    const [title, setTitle] = React.useState(note?.title || 'Untitled');
    const [coverImage, setCoverImage] = React.useState<string | undefined>(note?.coverImage);
    const [icon, setIcon] = React.useState<string | undefined>(note?.icon);

    const { askAI } = useDocumentAI();
    const [showComments, setShowComments] = React.useState(false);
    const [comments, setComments] = React.useState<Comment[]>(note?.comments || []);

    const slashCommand = SlashCommand.configure({
        suggestion: {
            items: ({ query }) => {
                return [
                    {
                        title: 'Heading 1',
                        description: 'Big section heading',
                        icon: <Heading1 size={18} />,
                        command: ({ editor, range }) => {
                            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
                        },
                    },
                    {
                        title: 'Heading 2',
                        description: 'Medium section heading',
                        icon: <Heading2 size={18} />,
                        command: ({ editor, range }) => {
                            editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
                        },
                    },
                    {
                        title: 'Bullet List',
                        description: 'Create a simple bullet list',
                        icon: <List size={18} />,
                        command: ({ editor, range }) => {
                            editor.chain().focus().deleteRange(range).toggleBulletList().run();
                        },
                    },
                    {
                        title: 'AI Assist',
                        description: 'Generate or improve content',
                        icon: <Sparkles size={18} />,
                        command: async ({ editor, range }) => {
                            // Placeholder for inline AI trigger
                            const userPrompt = window.prompt("What should AI write?");
                            if (userPrompt) {
                                const res = await askAI("", userPrompt);
                                editor.chain().focus().deleteRange(range).insertContent(res).run();
                            }
                        },
                    },
                ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
            },
            render: () => {
                let component: ReactRenderer;
                let popup: any;

                return {
                    onStart: (props) => {
                        component = new ReactRenderer(SuggestionList, {
                            props,
                            editor: props.editor,
                        });

                        if (!props.clientRect) {
                            return;
                        }

                        popup = tippy('body', {
                            getReferenceClientRect: props.clientRect,
                            appendTo: () => document.body,
                            content: component.element,
                            showOnCreate: true,
                            interactive: true,
                            trigger: 'manual',
                            placement: 'bottom-start',
                        });
                    },
                    onUpdate(props) {
                        component.updateProps(props);
                        if (!props.clientRect) {
                            return;
                        }
                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect,
                        });
                    },
                    onKeyDown(props) {
                        if (props.event.key === 'Escape') {
                            popup[0].hide();
                            return true;
                        }
                        // @ts-ignore
                        return component.ref?.onKeyDown(props);
                    },
                    onExit() {
                        popup[0].destroy();
                        component.destroy();
                    },
                };
            },
        },
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Type '/' for commands",
            }),
            Underline,
        ],
        content: note?.content || '',
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none',
            },
        },
    });

    // Auto-save title change or content change
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (editor && (title !== note?.title || editor.getHTML() !== note?.content)) {
                onSave(editor.getHTML(), title);
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [title, editor?.getHTML()]);

    // Sync content if note prop changes
    useEffect(() => {
        if (editor && note) {
            if (note.title !== title) setTitle(note.title);
            if (editor.getHTML() !== note.content) {
                editor.commands.setContent(note.content);
            }
        }
    }, [note?.id, editor]);

    const handleAddComment = (text: string) => {
        const newComment: Comment = {
            id: Date.now().toString(),
            authorName: 'You',
            content: text,
            createdAt: new Date().toISOString(),
            isResolved: false
        };
        setComments([...comments, newComment]);
    };

    const handleResolveComment = (id: string) => {
        setComments(comments.map(c => c.id === id ? { ...c, isResolved: !c.isResolved } : c));
    };

    if (!editor) return null;

    return (
        <div className="flex-1 flex h-full bg-[#FDFBFF] relative overflow-hidden">

            {/* Main Editor Composition Area - Glass Card Effect */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8">
                <div className="w-full max-w-5xl mx-auto h-full flex flex-col bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

                    {/* Minimal Header */}
                    <div className="h-16 flex items-center justify-between px-8 md:px-12 border-b border-white/40 bg-white/30">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 cursor-pointer hover:text-primary-600 transition-colors" onClick={onBack}>
                            <span className="opacity-50 hover:underline">Notes</span> <span className="opacity-30">/</span> <span className="text-primary-600">{title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mr-3">Saved</span>
                            <button onClick={() => setShowComments(!showComments)} className="p-2 hover:bg-white/50 rounded-full text-slate-400 hover:text-primary-600 transition-colors relative">
                                <MessageSquare size={18} />
                                {comments.filter(c => !c.isResolved).length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />}
                            </button>
                            <button className="p-2 hover:bg-white/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <Share2 size={18} />
                            </button>
                            <button className="p-2 hover:bg-white/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Editor Scroll Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Title Input */}
                        <div className="px-8 md:px-12 pt-12 pb-4 max-w-4xl mx-auto w-full">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Untitled"
                                className="text-4xl md:text-5xl font-bold text-slate-900 border-none outline-none placeholder-slate-200 w-full bg-transparent p-0 tracking-tight"
                            />
                        </div>

                        {/* Tiptap Editor */}
                        <div className="px-8 md:px-12 pb-24 max-w-4xl mx-auto w-full">
                            {editor && (
                                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-slate-900 text-white rounded-lg shadow-xl">
                                    <button
                                        onClick={() => editor.chain().focus().toggleBold().run()}
                                        className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-700' : ''}`}
                                    >
                                        <Bold size={14} />
                                    </button>
                                    <button
                                        onClick={() => editor.chain().focus().toggleItalic().run()}
                                        className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-700' : ''}`}
                                    >
                                        <Italic size={14} />
                                    </button>
                                    <button
                                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                                        className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('underline') ? 'bg-slate-700' : ''}`}
                                    >
                                        <UnderlineIcon size={14} />
                                    </button>
                                    <div className="w-px h-4 bg-slate-700 mx-1" />
                                    <button
                                        className="p-1.5 rounded hover:bg-purple-600 text-purple-300 hover:text-white flex items-center gap-1"
                                        onClick={async () => {
                                            const selection = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to);
                                            if (selection) {
                                                const result = await askAI(selection, "Improve this text");
                                                // Simplify replace for demo
                                                editor.chain().focus().deleteSelection().insertContent(result).run();
                                            }
                                        }}
                                    >
                                        <Sparkles size={14} />
                                        <span className="text-xs font-medium">AI Fix</span>
                                    </button>
                                </BubbleMenu>
                            )}

                            {editor && (
                                <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 -ml-8 bg-white border border-slate-200 shadow-lg rounded-md p-1">
                                    <button
                                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-100' : ''}`}
                                    >
                                        <Heading1 size={16} className="text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-100' : ''}`}
                                    >
                                        <Heading2 size={16} className="text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                                        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bulletList') ? 'bg-slate-100' : ''}`}
                                    >
                                        <List size={16} className="text-slate-600" />
                                    </button>
                                </FloatingMenu>
                            )}

                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Sidebar Overlay */}
            {showComments && (
                <div className="absolute top-0 right-0 h-full shadow-2xl z-30 animate-in slide-in-from-right duration-300 border-l border-slate-200">
                    <CommentsSidebar
                        comments={comments}
                        onAddComment={handleAddComment}
                        onResolveComment={handleResolveComment}
                        onClose={() => setShowComments(false)}
                    />
                </div>
            )}
        </div>
    );
};
