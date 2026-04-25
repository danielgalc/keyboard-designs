import { useEffect, useRef, useState } from 'react';

export default function Combobox({
    value,
    onChange,
    options = [],
    placeholder = 'Selecciona o escribe...',
    disabled = false,
    allowNew = false,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value ?? '');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Sync query when value changes externally (e.g. reset)
    useEffect(() => {
        setQuery(value ?? '');
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                // If not allowNew and typed value doesn't match any option, clear it
                if (!allowNew && !options.includes(query)) {
                    setQuery(value ?? '');
                }
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [query, value, options, allowNew]);

    const filtered = query.trim() === ''
        ? options
        : options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (option) => {
        setQuery(option);
        onChange(option);
        setOpen(false);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val);
        setOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
        }
        if (e.key === 'Enter' && filtered.length === 1) {
            e.preventDefault();
            handleSelect(filtered[0]);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? 'Selecciona primero una marca' : placeholder}
                    autoComplete="off"
                    className={`block w-full rounded-lg border px-3 py-2.5 pr-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 ${
                        disabled
                            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                            : open
                                ? 'border-indigo-500 bg-white text-slate-900 ring-1 ring-indigo-500'
                                : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                    }`}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => { if (!disabled) { setOpen(o => !o); inputRef.current?.focus(); } }}
                    className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 hover:text-slate-600"
                >
                    <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {open && !disabled && (
                <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-sm">
                    {filtered.length === 0 ? (
                        allowNew && query.trim() ? (
                            <li
                                onMouseDown={() => handleSelect(query.trim())}
                                className="flex items-center gap-2 cursor-pointer px-3 py-2 text-indigo-600 hover:bg-indigo-50"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear "<strong>{query.trim()}</strong>"
                            </li>
                        ) : (
                            <li className="px-3 py-2 text-slate-400">Sin resultados</li>
                        )
                    ) : (
                        <>
                            {filtered.map(option => (
                                <li
                                    key={option}
                                    onMouseDown={() => handleSelect(option)}
                                    className={`cursor-pointer px-3 py-2 hover:bg-indigo-50 hover:text-indigo-700 ${
                                        option === value ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-700'
                                    }`}
                                >
                                    {option}
                                </li>
                            ))}
                            {allowNew && query.trim() && !options.includes(query.trim()) && (
                                <li
                                    onMouseDown={() => handleSelect(query.trim())}
                                    className="flex items-center gap-2 cursor-pointer border-t border-slate-100 px-3 py-2 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Crear "<strong>{query.trim()}</strong>"
                                </li>
                            )}
                        </>
                    )}
                </ul>
            )}
        </div>
    );
}
