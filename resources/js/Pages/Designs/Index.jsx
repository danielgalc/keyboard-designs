import { tagColor } from '@/utils/tagColor';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

const DEVICE_TYPE_LABELS = {
    laptop: 'Portátil',
    tower:  'Torre',
    sff:    'SFF',
    mini:   'Mini',
};

function DesignRow({ design, printers, onTagClick }) {
    return (
        <div className="flex items-center justify-between py-2.5 pl-14 pr-5 hover:bg-slate-50 group border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-4 min-w-0">
                {design.language && (
                    <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600">
                        {design.language}
                    </span>
                )}
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{design.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{design.file_name}</p>
                    {design.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {design.tags.map(tag => {
                                const c = tagColor(tag.name);
                                return (
                                    <button
                                        key={tag.id}
                                        onClick={() => onTagClick(tag.name)}
                                        className={`inline-flex items-center rounded-full ${c.bg} px-2 py-0.5 text-xs font-medium ${c.text} ${c.hover} transition-colors`}
                                    >
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
                <Link
                    href={route('designs.show', design.id)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                >
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
            <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 py-2 pl-10 pr-5 text-left hover:bg-slate-50 transition-colors">
                <svg className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-medium text-slate-600">{modelName}</span>
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
            <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 py-2 pl-6 pr-5 text-left hover:bg-slate-50 transition-colors">
                <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">{typeName}</span>
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

    if (error) {
        return <span className="text-base font-bold text-slate-800">{brandName}</span>;
    }

    return (
        <img
            src={src}
            alt={brandName}
            onError={() => setError(true)}
            className="h-6 w-auto object-contain"
        />
    );
}

function BrandSection({ brandName, deviceTypes, printers, onTagClick }) {
    const [open, setOpen] = useState(true);
    const total = Object.values(deviceTypes).reduce((sum, models) =>
        sum + Object.values(models).reduce((s, arr) => s + arr.length, 0), 0);

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3.5 text-left hover:bg-slate-100 transition-colors"
            >
                <svg className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <BrandLogo brandName={brandName} />
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {total} diseños
                </span>
            </button>
            {open && Object.entries(deviceTypes).map(([typeKey, models]) => (
                <DeviceTypeSection
                    key={typeKey}
                    typeName={DEVICE_TYPE_LABELS[typeKey] ?? typeKey}
                    models={models}
                    printers={printers}
                    onTagClick={onTagClick}
                />
            ))}
        </div>
    );
}

export default function Index({ designs, printers, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [toast, setToast] = useState(null);
    const firstRender = useRef(true);

    const handleTagClick = (tagName) => {
        setSearch(tagName);
    };

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get(
                route('designs.index'),
                search ? { search } : {},
                { preserveState: true, replace: true }
            );
        }, 350);
        return () => clearTimeout(t);
    }, [search]);

    // Agrupar diseños en árbol: brand → device_type → model → [designs]
    const tree = useMemo(() => {
        const result = {};
        for (const design of designs) {
            const brand = design.laptop_model?.brand?.name ?? 'Sin marca';
            const type  = design.laptop_model?.device_type ?? 'laptop';
            const model = design.laptop_model?.name ?? 'Sin modelo';
            if (!result[brand]) result[brand] = {};
            if (!result[brand][type]) result[brand][type] = {};
            if (!result[brand][type][model]) result[brand][type][model] = [];
            result[brand][type][model].push(design);
        }
        return result;
    }, [designs]);

    const totalDesigns = designs.length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Diseños</h1>
                        <p className="text-sm text-slate-500">
                            {totalDesigns} {totalDesigns === 1 ? 'diseño' : 'diseños'} en el repositorio
                        </p>
                    </div>
                    <Link
                        href={route('designs.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                    >
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
                <div className="mb-5">
                    <div className="relative max-w-sm">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar marca, modelo, idioma..."
                            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Árbol */}
                {Object.keys(tree).length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow-sm">
                        <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-3 text-sm font-medium text-slate-500">
                            {search ? 'Sin resultados para esa búsqueda' : 'No hay diseños todavía'}
                        </p>
                        {!search && (
                            <Link href={route('designs.create')} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                Subir el primer diseño →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(tree).sort(([a], [b]) => a.localeCompare(b)).map(([brandName, deviceTypes]) => (
                            <BrandSection key={brandName} brandName={brandName} deviceTypes={deviceTypes} printers={printers} onTagClick={handleTagClick} />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
