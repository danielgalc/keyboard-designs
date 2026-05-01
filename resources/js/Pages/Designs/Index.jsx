import { tagColor } from '@/utils/tagColor';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const DEVICE_TYPE_LABELS = {
    laptop: 'Portátil',
    tower:  'Torre',
    sff:    'SFF',
    mini:   'Mini',
};

// ── Dot de verificación ───────────────────────────────────────────────────────
function VerificationDot({ design, printer }) {
    const latest  = design.verifications?.find(v => v.printer_id === printer.id);
    const setting = design.printer_settings?.find(s => s.printer_id === printer.id);
    const stale   = latest && setting && new Date(setting.updated_at) > new Date(latest.verified_at);

    if (!latest) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />—
            </span>
        );
    }
    if (stale) {
        return (
            <span title="Configuración modificada desde la última verificación"
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </span>
        );
    }
    return (
        <span title={`Verificado el ${new Date(latest.verified_at).toLocaleDateString('es-ES')} por ${latest.user?.name}`}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {new Date(latest.verified_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
        </span>
    );
}

// ── Fila de diseño ────────────────────────────────────────────────────────────
function DesignRow({ design, printers, onTagClick }) {
    return (
        <div className="flex items-center justify-between py-2.5 pl-14 pr-5 hover:bg-slate-50 group border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-4 min-w-0">
                {design.language && (
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-bold text-indigo-600 shrink-0">
                        {design.language}
                    </span>
                )}
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{design.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{design.file_name}</p>
                    {design.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {design.tags.map(tag => {
                                const c = tagColor(tag.name);
                                return (
                                    <button key={tag.id} onClick={() => onTagClick(tag.name)}
                                        className={`inline-flex items-center rounded-full ${c.bg} px-2 py-0.5 text-xs font-medium ${c.text} ${c.hover} transition-colors`}>
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
                <div className="hidden sm:flex items-center gap-3">
                    {printers.map(printer => (
                        <div key={printer.id} className="flex flex-col items-center gap-0.5">
                            <span className="text-xs text-slate-400">{printer.name}</span>
                            <VerificationDot design={design} printer={printer} />
                        </div>
                    ))}
                </div>
                <span className="hidden lg:block text-xs text-slate-400">{design.creator?.name}</span>
                <Link href={route('designs.show', design.id)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Ver →
                </Link>
            </div>
        </div>
    );
}

function ModelSection({ modelName, designs, printers, onTagClick }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 py-2.5 pl-10 pr-5 text-left hover:bg-slate-50 transition-colors">
                <svg className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">{modelName}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                    {designs.length} {designs.length === 1 ? 'diseño' : 'diseños'}
                </span>
            </button>
            {open && designs.map(d => <DesignRow key={d.id} design={d} printers={printers} onTagClick={onTagClick} />)}
        </div>
    );
}

function DeviceTypeSection({ typeName, models, printers, onTagClick }) {
    const [open, setOpen] = useState(true);
    const total = Object.values(models).reduce((sum, arr) => sum + arr.length, 0);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 py-3 pl-6 pr-5 text-left hover:bg-slate-50 transition-colors">
                <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-bold text-slate-800">{typeName}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {Object.keys(models).length} modelos · {total} diseños
                </span>
            </button>
            {open && Object.entries(models).map(([modelName, designs]) => (
                <ModelSection key={modelName} modelName={modelName} designs={designs} printers={printers} onTagClick={onTagClick} />
            ))}
        </div>
    );
}

function BrandLogo({ brandName }) {
    const src = `/logos/${brandName}_Logo.png`;
    const [error, setError] = useState(false);
    if (error) return <span className="text-base font-bold text-slate-800">{brandName}</span>;
    return <img src={src} alt={brandName} onError={() => setError(true)} className="h-6 w-auto object-contain" />;
}

function BrandSection({ brandName, deviceTypes, printers, onTagClick }) {
    const [open, setOpen] = useState(true);
    const total = Object.values(deviceTypes).reduce((sum, models) =>
        sum + Object.values(models).reduce((s, arr) => s + arr.length, 0), 0);

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <button onClick={() => setOpen(o => !o)}
                className="flex w-full items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3.5 text-left hover:bg-slate-100 transition-colors">
                <svg className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <BrandLogo brandName={brandName} />
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {total} diseños
                </span>
            </button>
            {open && Object.entries(deviceTypes).map(([typeKey, models]) => (
                <DeviceTypeSection key={typeKey} typeName={DEVICE_TYPE_LABELS[typeKey] ?? typeKey}
                    models={models} printers={printers} onTagClick={onTagClick} />
            ))}
        </div>
    );
}

// ── Iconos SVG inline para tipos de dispositivo ───────────────────────────────
const DEVICE_ICONS = {
    laptop: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
            <rect x="2" y="4" width="20" height="13" rx="2" />
            <path d="M0 19h24" strokeLinecap="round" />
            <path d="M8 19l1.5 2h5L16 19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    tower: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <circle cx="12" cy="17" r="1.5" />
            <path d="M9 6h6M9 9h4" strokeLinecap="round" />
        </svg>
    ),
    sff: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M8 9h8M8 12h5" strokeLinecap="round" />
        </svg>
    ),
    mini: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
            <rect x="6" y="6" width="12" height="12" rx="2" />
            <circle cx="12" cy="15" r="1" />
            <path d="M9 10h6" strokeLinecap="round" />
        </svg>
    ),
};

// Iconos para estado de verificación
const STATUS_ICONS = {
    verified: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4 text-emerald-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    unverified: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4 text-slate-400">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
        </svg>
    ),
    stale: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4 text-orange-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
};

// Mapa de idioma → bandera
const FLAG_MAP = {
    PT: '/flags/portugal.png',
    ES: '/flags/spain.webp',
    EN: '/flags/unitedkingdom.png',
    IT: '/flags/italia.png',
};

function FlagImg({ lang }) {
    const src = FLAG_MAP[lang?.toUpperCase()];
    const [err, setErr] = useState(false);
    if (!src || err) return null;
    return <img src={src} alt={lang} onError={() => setErr(true)} className="h-3.5 w-5 object-cover rounded-sm shrink-0" />;
}

function BrandFilterLogo({ name }) {
    const src = `/logos/${name}_Logo.png`;
    const [err, setErr] = useState(false);
    if (err) {
        return (
            <span className="inline-flex h-4 w-14 shrink-0 items-center justify-start">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-600">
                    {name.charAt(0)}
                </span>
            </span>
        );
    }
    return (
        <span className="inline-flex h-4 w-14 shrink-0 items-center">
            <img src={src} alt={name} onError={() => setErr(true)}
                className="h-full w-full object-contain object-left" />
        </span>
    );
}

// ── Sección de filtro lateral ─────────────────────────────────────────────────
function FilterSection({ title, items, active, onSelect, type }) {
    return (
        <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
            <ul className="space-y-0.5">
                {items.map(({ value, label, count }) => {
                    const isActive = active === value;
                    return (
                        <li key={value}>
                            <button
                                onClick={() => onSelect(isActive ? null : value)}
                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                                    isActive
                                        ? 'bg-indigo-50 font-semibold text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                {/* Icono según tipo de filtro */}
                                {type === 'brand'  && <BrandFilterLogo name={value} />}
                                {type === 'type'   && <span className={isActive ? 'text-indigo-500' : 'text-slate-400'}>{DEVICE_ICONS[value]}</span>}
                                {type === 'lang'   && <FlagImg lang={value} />}
                                {type === 'status' && STATUS_ICONS[value]}
                                {type === 'tag' && (() => { const c = tagColor(value); return <span className={`h-2.5 w-2.5 rounded-full shrink-0 bg-current ${c.text}`} />; })()}

                                <span className="flex-1 text-left truncate">{label}</span>
                                {count != null && (
                                    <span className={`text-xs shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Index({ designs, printers, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch]             = useState(filters.search ?? '');
    const [toast, setToast]               = useState(null);
    const [filterBrand, setFilterBrand]   = useState(null);
    const [filterType, setFilterType]     = useState(null);
    const [filterLang, setFilterLang]     = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterTag, setFilterTag]       = useState([]);
    const [showFilters, setShowFilters]   = useState(false);
    const firstRender = useRef(true);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        const t = setTimeout(() => {
            router.get(route('designs.index'), search ? { search } : {}, { preserveState: true, replace: true });
        }, 350);
        return () => clearTimeout(t);
    }, [search]);

    // Opciones de filtro derivadas de los diseños cargados
    const filterOptions = useMemo(() => {
        const brands   = {};
        const types    = {};
        const langs    = {};

        for (const d of designs) {
            const brand = d.laptop_model?.brand?.name ?? 'Sin marca';
            const type  = d.laptop_model?.device_type ?? 'laptop';
            const lang  = d.language;

            brands[brand] = (brands[brand] ?? 0) + 1;
            types[type]   = (types[type]   ?? 0) + 1;
            if (lang) langs[lang] = (langs[lang] ?? 0) + 1;
        }

        // Tags
        const tagMap = {};
        for (const d of designs) {
            for (const t of (d.tags ?? [])) {
                tagMap[t.name] = (tagMap[t.name] ?? 0) + 1;
            }
        }

        const verified = designs.filter(d => d.verifications?.length > 0).length;
        const unverified = designs.filter(d => !d.verifications?.length).length;
        const stale = designs.filter(d => {
            return d.printer_settings?.some(s => {
                const latest = d.verifications?.find(v => v.printer_id === s.printer_id);
                return latest && new Date(s.updated_at) > new Date(latest.verified_at);
            });
        }).length;

        return {
            brands:  Object.entries(brands).sort(([a], [b]) => a.localeCompare(b)).map(([v, c]) => ({ value: v, label: v, count: c })),
            types:   Object.entries(types).map(([v, c]) => ({ value: v, label: DEVICE_TYPE_LABELS[v] ?? v, count: c })),
            langs:   Object.entries(langs).sort(([a], [b]) => a.localeCompare(b)).map(([v, c]) => ({ value: v, label: v, count: c })),
            tags: Object.entries(tagMap).sort(([a], [b]) => a.localeCompare(b)).map(([v, c]) => ({ value: v, label: v, count: c })),
            status:  [
                { value: 'verified',   label: 'Verificados',             count: verified   },
                { value: 'unverified', label: 'Sin verificar',           count: unverified },
                { value: 'stale',      label: 'Pendiente re-verificar',  count: stale      },
            ],
        };
    }, [designs]);

    // Diseños filtrados con todos los filtros activos
    const filteredDesigns = useMemo(() => {
        return designs.filter(d => {
            if (filterBrand && d.laptop_model?.brand?.name !== filterBrand) return false;
            if (filterType  && d.laptop_model?.device_type !== filterType) return false;
            if (filterLang  && d.language !== filterLang) return false;
            if (filterStatus === 'verified'   && !d.verifications?.length) return false;
            if (filterStatus === 'unverified' && d.verifications?.length)  return false;
            if (filterTag.length > 0 && !filterTag.every(tag => d.tags?.some(t => t.name === tag))) return false;
            if (filterStatus === 'stale') {
                const isStale = d.printer_settings?.some(s => {
                    const latest = d.verifications?.find(v => v.printer_id === s.printer_id);
                    return latest && new Date(s.updated_at) > new Date(latest.verified_at);
                });
                if (!isStale) return false;
            }
            return true;
        });
    }, [designs, filterBrand, filterType, filterLang, filterStatus, filterTag]);

    const tree = useMemo(() => {
        const result = {};
        for (const design of filteredDesigns) {
            const brand = design.laptop_model?.brand?.name ?? 'Sin marca';
            const type  = design.laptop_model?.device_type ?? 'laptop';
            const model = design.laptop_model?.name ?? 'Sin modelo';
            if (!result[brand]) result[brand] = {};
            if (!result[brand][type]) result[brand][type] = {};
            if (!result[brand][type][model]) result[brand][type][model] = [];
            result[brand][type][model].push(design);
        }
        return result;
    }, [filteredDesigns]);

    const activeFiltersCount = [filterBrand, filterType, filterLang, filterStatus].filter(Boolean).length + filterTag.length;
    const clearFilters = () => { setFilterBrand(null); setFilterType(null); setFilterLang(null); setFilterStatus(null); setFilterTag([]); };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Diseños</h1>
                        <p className="text-sm text-slate-500">
                            {filteredDesigns.length !== designs.length
                                ? `${filteredDesigns.length} de ${designs.length} diseños`
                                : `${designs.length} ${designs.length === 1 ? 'diseño' : 'diseños'} en el repositorio`}
                        </p>
                    </div>
                    <Link href={route('designs.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Subir diseño
                    </Link>
                </div>
            }
        >
            <Head title="Diseños" />

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {toast}
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Buscador */}
                <div className="mb-3">
                    <div className="relative">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar... separa palabras para combinar: HP PT, Dell EN..."
                            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 lg:max-w-lg" />
                    </div>
                </div>

                {/* Botón filtros — solo móvil */}
                <div className="mb-4 lg:hidden">
                    <button onClick={() => setShowFilters(o => !o)}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                            showFilters
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                : activeFiltersCount > 0
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                        {activeFiltersCount > 0 && !showFilters && (
                            <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs text-white">{activeFiltersCount} activos</span>
                        )}
                    </button>
                </div>

                {/* Chips de búsqueda múltiple */}
                {search.trim().split(/\s+/).filter(Boolean).length > 1 && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs text-slate-400">Buscando:</span>
                        {search.trim().split(/\s+/).filter(Boolean).map((term, i) => (
                            <span key={i} className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{term}</span>
                        ))}
                        <button onClick={() => setSearch('')} className="ml-1 text-xs text-slate-400 hover:text-slate-600">Limpiar</button>
                    </div>
                )}

                {/* Layout: sidebar + árbol */}
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">

                    {/* Panel de filtros */}
                    <aside className={`w-full lg:w-48 lg:shrink-0 space-y-5 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-5">

                            {activeFiltersCount > 0 && (
                                <button onClick={clearFilters}
                                    className="flex w-full items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Quitar filtros ({activeFiltersCount})
                                </button>
                            )}

                            {filterOptions.brands.length > 0 && (
                                <FilterSection title="Marca" type="brand" items={filterOptions.brands} active={filterBrand} onSelect={setFilterBrand} />
                            )}
                            {filterOptions.types.length > 0 && (
                                <FilterSection title="Tipo" type="type" items={filterOptions.types} active={filterType} onSelect={setFilterType} />
                            )}
                            {filterOptions.langs.length > 0 && (
                                <FilterSection title="Idioma" type="lang" items={filterOptions.langs} active={filterLang} onSelect={setFilterLang} />
                            )}
                            {filterOptions.tags.length > 0 && (
                                <div>
                                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Etiquetas</p>
                                    <ul className="space-y-0.5">
                                        {filterOptions.tags.map(({ value, label, count }) => {
                                            const isActive = filterTag.includes(value);
                                            const c = tagColor(value);
                                            return (
                                                <li key={value}>
                                                    <button
                                                        onClick={() => setFilterTag(prev =>
                                                            prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
                                                        )}
                                                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                                                            isActive
                                                                ? `${c.bg} font-semibold ${c.text}`
                                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 bg-current ${isActive ? c.text : 'text-slate-300'}`} />
                                                        <span className="flex-1 text-left truncate">{label}</span>
                                                        <span className={`text-xs shrink-0 ${isActive ? c.text : 'text-slate-400'}`}>{count}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                            <FilterSection title="Estado" type="status" items={filterOptions.status} active={filterStatus} onSelect={setFilterStatus} />
                        </div>
                    </aside>

                    {/* Árbol de diseños */}
                    <div className="flex-1 min-w-0">
                        {Object.keys(tree).length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow-sm">
                                <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-3 text-sm font-medium text-slate-500">
                                    {search || activeFiltersCount > 0 ? 'Sin resultados para los filtros activos' : 'No hay diseños todavía'}
                                </p>
                                {!search && activeFiltersCount > 0 && (
                                    <button onClick={clearFilters} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Quitar filtros →
                                    </button>
                                )}
                                {!search && !activeFiltersCount && (
                                    <Link href={route('designs.create')} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Subir el primer diseño →
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(tree).sort(([a], [b]) => a.localeCompare(b)).map(([brandName, deviceTypes]) => (
                                    <BrandSection key={brandName} brandName={brandName} deviceTypes={deviceTypes}
                                        printers={printers} onTagClick={setSearch} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
