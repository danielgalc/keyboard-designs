import TagInput from '@/Components/TagInput';
import { getPrinterLogo } from '@/utils/printerLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const RESOLUTIONS = ['600x600', '600x900', '600x1200', '1200x1200'];

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

const PREVIEW_LIMIT = 5;

function needsReverification(setting, latestVerification) {
    if (!setting) return false;
    if (!latestVerification) return false;
    return new Date(setting.updated_at) > new Date(latestVerification.verified_at);
}

// ── Modal galería ─────────────────────────────────────────────────────────────
function GalleryModal({ design, printer, onClose }) {
    const images = design.printer_images?.filter(i => i.printer_id === printer.id) ?? [];
    const { data, setData, post, processing, reset } = useForm({ image: null });
    const deleteForm = useForm({});
    const [viewing, setViewing] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post(route('designs.images.store', [design.id, printer.id]), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const handleDelete = (image) => {
        if (!confirm('¿Eliminar esta imagen?')) return;
        deleteForm.delete(route('printer-images.destroy', image.id));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Galería de encuadre</h2>
                        <p className="text-sm text-slate-500">{printer.name}{printer.model && ` · ${printer.model}`}</p>
                    </div>
                    <button aria-label="Cerrar" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Galería */}
                <div className="flex-1 overflow-y-auto p-5">
                    {images.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Sin imágenes todavía</p>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {images.map(img => (
                            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                <img
                                    src={route('printer-images.show', img.id)}
                                    alt={img.file_name}
                                    className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setViewing(img)}
                                />
                                <button
                                    onClick={() => handleDelete(img)}
                                    className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                    {img.uploader?.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload */}
                <div className="border-t border-slate-100 px-6 py-4 shrink-0">
                    <form onSubmit={submit} className="flex items-center gap-3">
                        <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-2.5 text-sm transition-colors ${data.image ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}>
                            <input type="file" accept="image/*" className="sr-only" onChange={e => setData('image', e.target.files[0])} />
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {data.image ? data.image.name : 'Selecciona una imagen...'}
                        </label>
                        <button
                            type="submit"
                            disabled={processing || !data.image}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Subiendo...' : 'Añadir'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Visor de imagen completa */}
            {viewing && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 px-4" onClick={() => setViewing(null)}>
                    <img
                        src={route('printer-images.show', viewing.id)}
                        alt={viewing.file_name}
                        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setViewing(null)}
                        className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

function TraceabilityEvent({ event }) {
    return (
        <div className="flex gap-4">
            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
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
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                        {event.type === 'verified' ? 'Verificación registrada'
                        : event.data.action === 'created' ? 'Configuración inicial guardada'
                        : 'Configuración actualizada'}
                    </p>
                    <span className="text-xs text-slate-400">{formatDate(event.date)}</span>
                </div>
                <p className="text-xs text-slate-500">por <span className="font-medium">{event.data.user?.name}</span></p>

                {event.type === 'config' && event.data.action === 'updated' && event.data.changes && (
                    <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs space-y-1">
                        {Object.entries(event.data.changes).map(([field, { from, to }]) => (
                            <div key={field} className="flex items-center gap-2">
                                <span className="font-medium text-slate-600 w-32 shrink-0">{FIELD_LABELS[field] ?? field}</span>
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
                    <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs space-y-1">
                        {Object.entries(event.data.snapshot)
                            .filter(([, v]) => v !== null && v !== '')
                            .map(([field, value]) => (
                                <div key={field} className="flex items-center gap-2">
                                    <span className="font-medium text-slate-600 w-32 shrink-0">{FIELD_LABELS[field] ?? field}</span>
                                    <span className="text-slate-800">{String(value)}</span>
                                </div>
                            ))}
                    </div>
                )}

                {event.type === 'verified' && event.data.notes && (
                    <p className="mt-1 text-xs italic text-slate-500">"{event.data.notes}"</p>
                )}
            </div>
        </div>
    );
}

// ── Modal trazabilidad ────────────────────────────────────────────────────────
function TraceabilityModal({ design, printer, settingLogs, verifications, onClose }) {
    const logs   = settingLogs?.[printer.id] ?? [];
    const verifs = verifications?.filter(v => v.printer_id === printer.id) ?? [];

    const allEvents = [
        ...logs.map(l => ({ type: 'config',   date: l.logged_at,   data: l })),
        ...verifs.map(v => ({ type: 'verified', date: v.verified_at, data: v })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const preview   = allEvents.slice(0, PREVIEW_LIMIT);
    const remaining = allEvents.length - PREVIEW_LIMIT;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Trazabilidad</h2>
                        <p className="text-sm text-slate-500">{printer.name}{printer.model && ` · ${printer.model}`}</p>
                    </div>
                    <button aria-label="Cerrar" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Timeline */}
                <div className="overflow-y-auto px-6 py-4">
                    {allEvents.length === 0 && (
                        <p className="py-8 text-center text-sm text-slate-400">Sin actividad registrada para esta impresora.</p>
                    )}

                    <div className="relative">
                        {allEvents.length > 0 && <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />}
                        <div className="space-y-5">
                            {preview.map((event, i) => <TraceabilityEvent key={i} event={event} />)}

                            {/* Indicador de eventos anteriores + enlace */}
                            {remaining > 0 && (
                                <div className="flex gap-4 items-center">
                                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <Link
                                        href={route('designs.traceability', [design.id, printer.id])}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                        onClick={onClose}
                                    >
                                        Ver {remaining} evento{remaining !== 1 ? 's' : ''} anterior{remaining !== 1 ? 'es' : ''} →
                                    </Link>
                                </div>
                            )}

                            {/* Evento base: diseño añadido (solo si caben todos los eventos) */}
                            {remaining === 0 && (
                                <div className="flex gap-4">
                                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer con enlace al historial completo */}
                {allEvents.length > 0 && (
                    <div className="border-t border-slate-100 px-6 py-3 shrink-0">
                        <Link
                            href={route('designs.traceability', [design.id, printer.id])}
                            className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                            onClick={onClose}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Ver historial completo
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Modal configuración y encuadre ────────────────────────────────────────────
function SettingsModal({ design, printer, setting, onClose }) {
    const isMimaki = printer.name.toLowerCase().includes('mimaki');

    const { data, setData, post, processing, errors } = useForm({
        offset_x:   setting?.offset_x  ?? '',
        offset_y:   setting?.offset_y  ?? '',
        rotation:   String(setting?.rotation ?? 0),
        scale:      setting?.scale     ?? '100',
        copies:     setting?.copies    ?? '1',
        notes:      setting?.notes     ?? '',
        ink_type:   setting?.ink_type  ?? (isMimaki ? 'Acrylic' : ''),
        resolution: setting?.resolution ?? (isMimaki ? '600x600' : ''),
        overprint:  setting?.overprint  ?? (isMimaki ? '2' : ''),
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('designs.settings.upsert', [design.id, printer.id]), { onSuccess: onClose });
    };

    const numField = (label, key, extra = {}) => (
        <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
            <input type="number" step="any" value={data[key]} onChange={e => setData(key, e.target.value)} className={inputClass} {...extra} />
            {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Configuración y encuadre</h2>
                        <p className="text-sm text-slate-500">{printer.name}{printer.model && ` · ${printer.model}`}</p>
                    </div>
                    <button aria-label="Cerrar" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-5">
                    {/* Encuadre */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Encuadre</p>
                        <div className="grid grid-cols-2 gap-3">
                            {numField(isMimaki ? 'Escaneo (X) mm' : 'Offset X (mm)', 'offset_x')}
                            {numField(isMimaki ? 'Alimentación (Y) mm' : 'Offset Y (mm)', 'offset_y')}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Rotación</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {['0', '90', '180', '270'].map(deg => (
                                        <button
                                            key={deg}
                                            type="button"
                                            onClick={() => setData('rotation', deg)}
                                            className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                                                data.rotation === deg
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {deg}°
                                        </button>
                                    ))}
                                </div>
                                {errors.rotation && <p className="mt-1 text-xs text-red-600">{errors.rotation}</p>}
                            </div>
                            {numField('Escala (%)', 'scale', { min: 0, max: 999, step: '0.1' })}
                            {numField('Copias', 'copies', { min: 1, step: '1' })}
                        </div>
                    </div>

                    {/* Campos específicos Mimaki */}
                    {isMimaki && (
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Configuración Mimaki</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de tinta</label>
                                    <input
                                        type="text"
                                        value={data.ink_type}
                                        onChange={e => setData('ink_type', e.target.value)}
                                        className={inputClass}
                                        placeholder="Acrylic"
                                    />
                                    {errors.ink_type && <p className="mt-1 text-xs text-red-600">{errors.ink_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Resolución</label>
                                    <select
                                        value={data.resolution}
                                        onChange={e => setData('resolution', e.target.value)}
                                        className={inputClass + ' cursor-pointer'}
                                    >
                                        {RESOLUTIONS.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    {errors.resolution && <p className="mt-1 text-xs text-red-600">{errors.resolution}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Sobreimprimir</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.overprint}
                                        onChange={e => setData('overprint', e.target.value)}
                                        className={inputClass}
                                    />
                                    {errors.overprint && <p className="mt-1 text-xs text-red-600">{errors.overprint}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notas */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Notas adicionales</label>
                        <textarea rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} className={inputClass} placeholder="Observaciones..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                            {processing ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Modal verificación ────────────────────────────────────────────────────────
function VerificationModal({ design, printer, onClose }) {
    const { data, setData, post, processing, errors } = useForm({ notes: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('designs.verifications.store', [design.id, printer.id]), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Registrar verificación</h2>
                        <p className="text-sm text-slate-500">{printer.name}</p>
                    </div>
                    <button aria-label="Cerrar" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
                        Confirmas que este diseño ha sido impreso y verificado en <strong>{printer.name}</strong>. Se registrará la fecha y hora actuales junto a tu nombre.
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Observaciones (opcional)</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className={inputClass}
                            placeholder="Resultado perfecto, sin ajustes necesarios..."
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {processing ? 'Guardando...' : 'Confirmar verificación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PrinterHeader({ name, model }) {
    const logo = getPrinterLogo(name);
    const [error, setError] = useState(false);
    return (
        <div>
            {logo && !error
                ? <img src={logo} alt={name} onError={() => setError(true)} className="h-5 w-auto object-contain" />
                : <span className="text-sm font-semibold text-slate-800">{name}</span>
            }
            {logo && !error && (
                <p className="mt-0.5 text-xs font-medium text-slate-600">{name}</p>
            )}
            {model && <p className="mt-0 text-xs text-slate-400">{model}</p>}
        </div>
    );
}

// ── Tarjeta impresora ─────────────────────────────────────────────────────────
function PrinterCard({ design, printer, settingLogs }) {
    const isMimaki = printer.name.toLowerCase().includes('mimaki');
    const setting = design.printer_settings?.find(s => s.printer_id === printer.id);
    const latestVerification = design.verifications?.find(v => v.printer_id === printer.id);
    const [showSettings, setShowSettings]           = useState(false);
    const [showVerification, setShowVerification]   = useState(false);
    const [showTraceability, setShowTraceability]   = useState(false);
    const [showGallery, setShowGallery]             = useState(false);

    const imageCount = design.printer_images?.filter(i => i.printer_id === printer.id).length ?? 0;
    const traceabilityCount = (settingLogs?.[printer.id]?.length ?? 0)
        + (design.verifications?.filter(v => v.printer_id === printer.id).length ?? 0);

    const fields = [
        [isMimaki ? 'Escaneo (X)' : 'Offset X', setting?.offset_x != null ? `${setting.offset_x} mm` : null],
        [isMimaki ? 'Alimentación (Y)' : 'Offset Y', setting?.offset_y != null ? `${setting.offset_y} mm` : null],
        ['Rotación', setting?.rotation != null ? `${setting.rotation}°` : null],
        ['Escala',   setting?.scale    != null ? `${setting.scale}%`    : null],
        ['Copias',   setting?.copies   != null ? String(setting.copies) : null],
        ...(isMimaki ? [
            ['Tipo de tinta', setting?.ink_type   ?? null],
            ['Resolución',    setting?.resolution ?? null],
            ['Sobreimprimir', setting?.overprint  != null ? String(setting.overprint) : null],
        ] : []),
    ];

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
                    <div>
                        <PrinterHeader name={printer.name} model={printer.model} />
                    </div>
                    {!latestVerification ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Sin verificar
                        </span>
                    ) : needsReverification(setting, latestVerification) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700" title="La configuración fue modificada después de la última verificación">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Pendiente de re-verificar
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Verificado {new Date(latestVerification.verified_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            <span className="text-emerald-500">· {latestVerification.user?.name}</span>
                        </span>
                    )}
                </div>

                {/* Datos de encuadre */}
                <div className="px-5 py-4">
                    {setting ? (
                        <div className="grid grid-cols-3 gap-x-6 gap-y-3 sm:grid-cols-6">
                            {fields.map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-xs font-medium text-slate-400">{label}</dt>
                                    <dd className="mt-0.5 text-sm font-semibold text-slate-700">{value ?? <span className="font-normal text-slate-300">—</span>}</dd>
                                </div>
                            ))}
                            {setting.notes && (
                                <div className="col-span-3 sm:col-span-6 mt-1 border-t border-slate-100 pt-3">
                                    <dt className="text-xs font-medium text-slate-400">Notas</dt>
                                    <dd className="mt-0.5 text-sm text-slate-600">{setting.notes}</dd>
                                </div>
                            )}
                            <div className="col-span-3 sm:col-span-6 text-xs text-slate-400 mt-1">
                                Actualizado por {setting.updated_by?.name ?? '—'} · {formatDate(setting.updated_at)}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Sin datos de encuadre todavía.</p>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Configuración y encuadre
                    </button>
                    <button
                        onClick={() => setShowTraceability(true)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Trazabilidad
                        {traceabilityCount > 0 && (
                            <span className="ml-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                                {traceabilityCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowGallery(true)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Galería
                        {imageCount > 0 && (
                            <span className="ml-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-600">{imageCount}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowVerification(true)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Registrar verificación
                    </button>
                </div>
            </div>

            {showSettings && <SettingsModal design={design} printer={printer} setting={setting} onClose={() => setShowSettings(false)} />}
            {showVerification && <VerificationModal design={design} printer={printer} onClose={() => setShowVerification(false)} />}
            {showGallery && <GalleryModal design={design} printer={printer} onClose={() => setShowGallery(false)} />}
            {showTraceability && (
                <TraceabilityModal
                    design={design}
                    printer={printer}
                    settingLogs={settingLogs}
                    verifications={design.verifications}
                    onClose={() => setShowTraceability(false)}
                />
            )}
        </>
    );
}

// ── Modal preview ─────────────────────────────────────────────────────────────
function PreviewModal({ design, onClose }) {
    const isPdf   = design.file_mime_type === 'application/pdf';
    const isImage = design.file_mime_type?.startsWith('image/');
    const previewUrl = route('designs.preview', design.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6" onClick={onClose}>
            <div className="flex w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3 shrink-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{design.file_name}</p>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                        <a href={route('designs.download', design.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            Descargar
                        </a>
                        <button aria-label="Cerrar" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-slate-100">
                    {isPdf && (
                        <embed src={previewUrl} type="application/pdf" className="h-full w-full" style={{ minHeight: '70vh' }} />
                    )}
                    {isImage && (
                        <div className="flex h-full items-center justify-center p-4">
                            <img src={previewUrl} alt={design.file_name} className="max-h-full max-w-full object-contain rounded" />
                        </div>
                    )}
                    {!isPdf && !isImage && (
                        <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">Vista previa no disponible para este formato</p>
                            <a href={route('designs.download', design.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                Descargar archivo
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Show({ design, printers, settingLogs, allTags }) {
    const { auth, flash } = usePage().props;
    const [toast, setToast] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [currentTags, setCurrentTags] = useState(design.tags?.map(t => t.name) ?? []);
    const [tagsSaving, setTagsSaving] = useState(false);

    const saveTags = (tags) => {
        setCurrentTags(tags);
        setTagsSaving(true);
        router.post(route('designs.tags.sync', design.id), { tags }, {
            preserveScroll: true,
            onFinish: () => setTagsSaving(false),
        });
    };

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleDelete = () => {
        if (confirm(`¿Eliminar "${design.name}"? Esta acción no se puede deshacer.`)) {
            router.delete(route('designs.destroy', design.id));
        }
    };

    return (
        <>
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('designs.index')} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">{design.name}</h1>
                            <p className="text-sm text-slate-500">
                                {[design.laptop_model?.brand?.name, design.laptop_model?.name].filter(Boolean).join(' · ') || 'Sin modelo especificado'}
                                {design.language && <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-bold text-indigo-600">{design.language}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Vista previa
                        </button>
                        <a
                            href={route('designs.download', design.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar
                        </a>
                        <Link
                            href={route('designs.edit', design.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                        </Link>
                        {auth.user.role === 'admin' && (
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={design.name} />

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {toast}
                </div>
            )}

            <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

                {/* Información general */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-4">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Información del diseño</h2>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4 px-6 py-5 sm:grid-cols-4">
                        {[
                            ['Marca',   design.laptop_model?.brand?.name],
                            ['Modelo',  design.laptop_model?.name],
                            ['Idioma',  design.language],
                            ['Archivo', design.file_name],
                            ['Tamaño',        formatBytes(design.file_size)],
                            ['Subido por',    design.creator?.name],
                            ['Fecha',         formatDate(design.created_at)],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium text-slate-400">{label}</dt>
                                <dd className="mt-0.5 text-sm text-slate-700">{value || <span className="text-slate-300">—</span>}</dd>
                            </div>
                        ))}
                        {design.description && (
                            <div className="col-span-2 sm:col-span-4 border-t border-slate-100 pt-4">
                                <dt className="text-xs font-medium text-slate-400">Descripción</dt>
                                <dd className="mt-0.5 text-sm text-slate-600 whitespace-pre-line">{design.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Etiquetas */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Etiquetas</h2>
                        {tagsSaving && <span className="text-xs text-slate-400">Guardando...</span>}
                    </div>
                    <div className="px-6 py-4">
                        <TagInput
                            tags={currentTags}
                            allTags={allTags}
                            onChange={saveTags}
                        />
                    </div>
                </div>

                {/* Impresoras */}
                <div>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Datos por impresora</h2>
                    <div className="space-y-4">
                        {printers.map(printer => (
                            <PrinterCard key={printer.id} design={design} printer={printer} settingLogs={settingLogs} />
                        ))}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>

        {showPreview && <PreviewModal design={design} onClose={() => setShowPreview(false)} />}
        </>
    );
}
