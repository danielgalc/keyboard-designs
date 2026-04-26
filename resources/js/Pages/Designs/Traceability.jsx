import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const FIELD_LABELS = {
    offset_x:   'Escaneo X / Offset X',
    offset_y:   'Alimentación Y / Offset Y',
    rotation:   'Rotación',
    scale:      'Escala',
    copies:     'Copias',
    notes:      'Notas',
    ink_type:   'Tipo de tinta',
    resolution: 'Resolución',
    overprint:  'Sobreimprimir',
};

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function EventItem({ event }) {
    return (
        <div className="flex gap-4">
            <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                event.type === 'verified' ? 'bg-emerald-100'
                : event.data.action === 'created' ? 'bg-indigo-100'
                : 'bg-amber-100'
            }`}>
                {event.type === 'verified' ? (
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : event.data.action === 'created' ? (
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                ) : (
                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                )}
            </div>
            <div className="flex-1 pb-1">
                <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-800">
                        {event.type === 'verified' ? 'Verificación registrada'
                        : event.data.action === 'created' ? 'Configuración inicial guardada'
                        : 'Configuración actualizada'}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(event.date)}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">por <span className="font-medium">{event.data.user?.name}</span></p>

                {event.type === 'config' && event.data.action === 'updated' && event.data.changes && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs space-y-1.5">
                        {Object.entries(event.data.changes).map(([field, { from, to }]) => (
                            <div key={field} className="flex items-center gap-3">
                                <span className="font-medium text-slate-500 w-36 shrink-0">{FIELD_LABELS[field] ?? field}</span>
                                <span className="text-slate-400 line-through">{from ?? '—'}</span>
                                <svg className="h-3 w-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className="text-slate-800 font-semibold">{to ?? '—'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {event.type === 'config' && event.data.action === 'created' && event.data.snapshot && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs space-y-1.5">
                        {Object.entries(event.data.snapshot)
                            .filter(([, v]) => v !== null && v !== '')
                            .map(([field, value]) => (
                                <div key={field} className="flex items-center gap-3">
                                    <span className="font-medium text-slate-500 w-36 shrink-0">{FIELD_LABELS[field] ?? field}</span>
                                    <span className="text-slate-800">{String(value)}</span>
                                </div>
                            ))}
                    </div>
                )}

                {event.type === 'verified' && event.data.notes && (
                    <p className="text-xs italic text-slate-500">"{event.data.notes}"</p>
                )}
            </div>
        </div>
    );
}

export default function Traceability({ design, printer, settingLogs, verifications }) {
    // Combinar logs paginados con verificaciones y ordenar por fecha
    const configEvents = (settingLogs.data ?? []).map(l => ({
        type: 'config', date: l.logged_at, data: l,
    }));
    const verifEvents = verifications.map(v => ({
        type: 'verified', date: v.verified_at, data: v,
    }));
    const allEvents = [...configEvents, ...verifEvents]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('designs.show', design.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Historial completo · {printer.name}</h1>
                        <p className="text-sm text-slate-500">
                            {[design.laptop_model?.brand?.name, design.laptop_model?.name].filter(Boolean).join(' · ')}
                            {design.language && <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-bold text-indigo-600">{design.language}</span>}
                            <span className="mx-2 text-slate-300">·</span>
                            {design.name}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Trazabilidad · ${design.name} · ${printer.name}`} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                    {allEvents.length === 0 ? (
                        <p className="py-12 text-center text-sm text-slate-400">Sin actividad registrada.</p>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
                            <div className="space-y-6">
                                {allEvents.map((event, i) => <EventItem key={i} event={event} />)}

                                {/* Evento base */}
                                <div className="flex gap-4">
                                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-800">Diseño añadido al repositorio</p>
                                            <span className="text-xs text-slate-400">{formatDate(design.created_at)}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">por <span className="font-medium">{design.creator?.name}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Paginación de logs de configuración */}
                {settingLogs.last_page > 1 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {settingLogs.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={`min-w-[36px] rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    link.active ? 'bg-indigo-600 text-white'
                                    : link.url ? 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                    : 'cursor-default text-slate-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
