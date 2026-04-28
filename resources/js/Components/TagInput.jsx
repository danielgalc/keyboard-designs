import { useEffect, useRef, useState } from 'react';

export default function TagInput({ tags = [], allTags = [], onChange }) {
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const suggestions = allTags.filter(t =>
        t.name.includes(input.toLowerCase()) &&
        !tags.includes(t.name)
    );

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addTag = (name) => {
        const normalized = name.trim().toLowerCase();
        if (normalized && !tags.includes(normalized)) {
            onChange([...tags, normalized]);
        }
        setInput('');
        setOpen(false);
        inputRef.current?.focus();
    };

    const removeTag = (name) => {
        onChange(tags.filter(t => t !== name));
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            addTag(input);
        }
        if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div
                className="flex flex-wrap items-center gap-1.5 min-h-[42px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-100 pl-2.5 pr-1.5 py-0.5 text-xs font-medium text-indigo-700">
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                            className="rounded-full hover:bg-indigo-200 p-0.5"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => { setInput(e.target.value.toLowerCase()); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? 'Añade etiquetas...' : ''}
                    className="flex-1 min-w-[120px] border-0 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 py-0.5"
                />
            </div>

            {open && (input || suggestions.length > 0) && (
                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-sm">
                    {suggestions.map(t => (
                        <li
                            key={t.id}
                            onMouseDown={() => addTag(t.name)}
                            className="cursor-pointer px-3 py-1.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            {t.name}
                        </li>
                    ))}
                    {input.trim() && !allTags.find(t => t.name === input.trim().toLowerCase()) && (
                        <li
                            onMouseDown={() => addTag(input)}
                            className="flex items-center gap-2 cursor-pointer border-t border-slate-100 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Crear etiqueta "<strong>{input.trim()}</strong>"
                        </li>
                    )}
                    {suggestions.length === 0 && !input.trim() && (
                        <li className="px-3 py-2 text-xs text-slate-400">Escribe para buscar o crear etiquetas</li>
                    )}
                </ul>
            )}
            <p className="mt-1 text-xs text-slate-400">Pulsa Enter o coma para añadir · Borrar para eliminar la última</p>
        </div>
    );
}
