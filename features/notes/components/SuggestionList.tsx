import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Heading1, Heading2, List, ListOrdered, CheckSquare, Sparkles } from 'lucide-react';

export default forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[280px] p-1 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1">
            <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Basic blocks</div>
            {props.items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => selectItem(index)}
                    className={`flex items-center gap-3 px-2 py-2 w-full text-left rounded-lg transition-colors ${index === selectedIndex ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <div className={`w-10 h-10 rounded border border-slate-200 flex items-center justify-center bg-white ${index === selectedIndex ? 'border-slate-300 shadow-sm' : ''}`}>
                        {item.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.title}</span>
                        <span className="text-xs text-slate-400">{item.description}</span>
                    </div>
                </button>
            ))}
        </div>
    );
});
