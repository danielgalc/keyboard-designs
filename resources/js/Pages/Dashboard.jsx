import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ label, value, sub, color = 'indigo' }) {
    const colors = {
        indigo:  'bg-indigo-50 text-indigo-700 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        orange:  'bg-orange-50 text-orange-700 border-orange-100',
        slate:   'bg-slate-50 text-slate-700 border-slate-100',
    };
    return (
        <div className={`rounded-xl border p-5 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-70">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
        </div>
    );
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function Dashboard({ totalDesigns, printerStats, needsReverification, recentDesigns, recentVerifications }) {
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

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Diseños totales"
                        value={totalDesigns}
                        color="indigo"
                    />
                    {printerStats.map(p => (
                        <StatCard
                            key={p.id}
                            label={`Verificados en ${p.name}`}
                            value={p.verified}
                            sub={`${p.configured} con configuración`}
                            color="emerald"
                        />
                    ))}
                    <StatCard
                        label="Pendientes de re-verificar"
                        value={needsReverification}
                        sub="Configuración modificada tras última verificación"
                        color={needsReverification > 0 ? 'orange' : 'slate'}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Últimos diseños */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-700">Últimos diseños subidos</h2>
                            <Link href={route('designs.index')} className="text-xs text-indigo-600 hover:text-indigo-800">
                                Ver todos →
                            </Link>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {recentDesigns.length === 0 && (
                                <li className="px-5 py-8 text-center text-sm text-slate-400">Sin diseños todavía</li>
                            )}
                            {recentDesigns.map(d => (
                                <li key={d.id}>
                                    <Link href={route('designs.show', d.id)} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {d.language && (
                                                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-bold text-indigo-600 shrink-0">{d.language}</span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">
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
                                <li className="px-5 py-8 text-center text-sm text-slate-400">Sin verificaciones todavía</li>
                            )}
                            {recentVerifications.map(v => (
                                <li key={v.id}>
                                    <Link href={route('designs.show', v.design_id)} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                                                {v.user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                    {[v.design?.laptop_model?.brand?.name, v.design?.laptop_model?.name].filter(Boolean).join(' · ')}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {v.design?.name}
                                                    {v.design?.language && <span className="ml-1 font-semibold text-indigo-500">{v.design.language}</span>}
                                                    <span className="mx-1 text-slate-300">·</span>
                                                    {v.printer?.name}
                                                    <span className="mx-1 text-slate-300">·</span>
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

                {/* Aviso pendientes */}
                {needsReverification > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
                        <svg className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-orange-800">
                                {needsReverification} combinación{needsReverification !== 1 ? 'es' : ''} pendiente{needsReverification !== 1 ? 's' : ''} de re-verificar
                            </p>
                            <p className="text-xs text-orange-600 mt-0.5">
                                La configuración de encuadre fue modificada después de la última verificación. Entra en cada diseño y verifica que el encuadre sigue siendo correcto.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
