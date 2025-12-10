import { Note } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let notesStore: Note[] = [
    {
        id: '1',
        title: 'Project Ideas',
        content: '<h1>Project Ideas</h1><p>Here are some <b>bold</b> ideas.</p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Meeting Notes',
        content: '<h2>Meeting - 10/24</h2><ul><li>Discussed Q4 roadmap</li><li>Approved budget</li></ul>',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
];

export const noteService = {
    getAll: async (): Promise<Note[]> => {
        await delay(300);
        return [...notesStore].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    getById: async (id: string): Promise<Note | undefined> => {
        await delay(200);
        return notesStore.find(d => d.id === id);
    },

    save: async (note: Note): Promise<Note> => {
        await delay(500);
        const index = notesStore.findIndex(d => d.id === note.id);
        const now = new Date().toISOString();
        const noteToSave = { ...note, updatedAt: now };

        if (index >= 0) {
            notesStore[index] = noteToSave;
        } else {
            notesStore.push({ ...noteToSave, createdAt: now });
        }
        return noteToSave;
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        notesStore = notesStore.filter(d => d.id !== id);
    },

    // For AI context
    getContextString: async (id: string): Promise<string> => {
        const note = notesStore.find(d => d.id === id);
        if (!note) return '';
        return `Title: ${note.title}\nContent:\n${note.content.replace(/<[^>]*>?/gm, ' ')}`;
    }
};
