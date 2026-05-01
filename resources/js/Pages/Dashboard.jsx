import { getPrinterLogo } from '@/utils/printerLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function PrinterLogoOrName({ name }) {
    const logo = getPrinterLogo(name);
    const [error, setError] = useState(false);
    return (
        <div>
            {logo && !error
                ? <img src={logo} alt={name} onError={() => setError(true)} className="h-5 w-auto object-contain" />
                : <span className="text-sm font-bold text-slate-700">{name}</span>
            }
            {logo && !error && (
                <p className="mt-0.5 text-xs font-medium text-slate-500">{name}</p>
            )}
        </div>
    );
}

function ProgressBar({ value, total }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{value} de {total} verificados</span>
                <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                    className="h-1.5 rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function StaleDesignsModal({ designs, printers, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Pendientes de re-verificar</h2>
                        <p className="text-sm text-slate-500">Configuración modificada tras la última verificación</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <ul className="overflow-y-auto divide-y divide-slate-100">
                    {designs.map(d => {
                        const stalePrinters = printers.filter(p => d.stale_printers?.includes(p.id));
                        return (
                            <li key={d.id}>
                                <Link
                                    href={route('designs.show', d.id)}
                                    onClick={onClose}
                                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {[d.laptop_model?.brand?.name, d.laptop_model?.name].filter(Boolean).join(' · ')}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {d.name}{d.language && <span className="ml-1.5 font-bold text-indigo-500">{d.language}</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4 shrink-0">
                                        {stalePrinters.map(p => (
                                            <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                                                {p.name}
                                            </span>
                                        ))}
                                        <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default function Dashboard({ totalDesigns, printerStats, needsReverification, staleDesigns, recentDesigns, recentVerifications }) {
    const [showStale, setShowStale] = useState(false);

    // Reconstruir lista de printers desde printerStats para el modal
    const printers = printerStats.map(p => ({ id: p.id, name: p.name }));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Inicio</h1>
                    <p className="text-sm text-slate-500">Resumen del repositorio</p>
                </div>
            }
        >
            <Head title="Inicio" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

                {/* Stats — panel unificado */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

                    {/* Móvil: apilado vertical / Desktop: columnas en grid */}
                    <div className="flex flex-col divide-y divide-slate-100 lg:divide-y-0 lg:divide-x lg:grid"
                        style={{ gridTemplateColumns: `180px repeat(${printerStats.length}, 1fr)` }}>

                        {/* Total */}
                        <div className="flex flex-col justify-between p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Repositorio</p>
                            <div className="mt-3 lg:mt-6">
                                <span className="text-3xl font-bold tracking-tight text-slate-800 lg:text-4xl">{totalDesigns}</span>
                                <p className="mt-1 text-sm text-slate-500">diseños</p>
                            </div>
                            <Link href={route('designs.index')} className="mt-3 lg:mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                Ver repositorio →
                            </Link>
                        </div>

                        {/* Una fila/columna por impresora */}
                        {printerStats.map(p => {
                            const pct = totalDesigns > 0 ? Math.round((p.verified / totalDesigns) * 100) : 0;
                            const allVerified = p.verified === totalDesigns && totalDesigns > 0;
                            return (
                                <div key={p.id} className="p-5 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <PrinterLogoOrName name={p.name} />
                                            {p.model && <p className="mt-0.5 text-xs text-slate-400 truncate">{p.model}</p>}
                                        </div>
                                        <span className={`shrink-0 text-xs font-semibold tabular-nums ${allVerified ? 'text-emerald-600' : 'text-slate-500'}`}>
                                            {pct}%
                                        </span>
                                    </div>
                                    <div>
                                        <div className="h-1.5 w-full rounded-full bg-slate-100">
                                            <div className={`h-1.5 rounded-full transition-all ${allVerified ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                            <span>{p.verified} verificados</span>
                                            <span className="text-slate-300">{p.configured} config.</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Franja de alerta */}
                    {needsReverification > 0 && (
                        <div className="border-t border-orange-100 bg-orange-50 px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-2 sm:items-center">
                                <svg className="h-4 w-4 text-orange-500 shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-sm font-medium text-orange-800">
                                    {needsReverification} {needsReverification === 1 ? 'diseño pendiente' : 'diseños pendientes'} de re-verificar
                                </span>
                            </div>
                            <button
                                onClick={() => setShowStale(true)}
                                className="shrink-0 text-xs font-semibold text-orange-700 hover:text-orange-900 underline underline-offset-2 text-left sm:text-right"
                            >
                                Ver listado
                            </button>
                        </div>
                    )}
                </div>

                {/* Listas */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Últimos diseños */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">Últimos diseños subidos</h2>
                            <Link href={route('designs.index')} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                Ver todos →
                            </Link>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {recentDesigns.length === 0 && (
                                <li className="px-5 py-10 text-center text-sm text-slate-400">Sin diseños todavía</li>
                            )}
                            {recentDesigns.map(d => (
                                <li key={d.id}>
                                    <Link href={route('designs.show', d.id)} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {d.language && (
                                                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-bold text-indigo-600 shrink-0">{d.language}</span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {[d.laptop_model?.brand?.name, d.laptop_model?.name].filter(Boolean).join(' · ')}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{d.name}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0 ml-3">{formatDate(d.created_at)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Últimas verificaciones */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-700">Últimas verificaciones</h2>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {recentVerifications.length === 0 && (
                                <li className="px-5 py-10 text-center text-sm text-slate-400">Sin verificaciones todavía</li>
                            )}
                            {recentVerifications.map(v => (
                                <li key={v.id}>
                                    <Link href={route('designs.show', v.design_id)} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                                {v.user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {[v.design?.laptop_model?.brand?.name, v.design?.laptop_model?.name].filter(Boolean).join(' · ')}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {v.design?.name}
                                                    {v.design?.language && <span className="ml-1 font-bold text-indigo-500">{v.design.language}</span>}
                                                    <span className="mx-1.5 text-slate-300">·</span>
                                                    {v.printer?.name}
                                                    <span className="mx-1.5 text-slate-300">·</span>
                                                    {v.user?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0 ml-3">{formatDate(v.verified_at)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {showStale && (
                <StaleDesignsModal
                    designs={staleDesigns}
                    printers={printers}
                    onClose={() => setShowStale(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
