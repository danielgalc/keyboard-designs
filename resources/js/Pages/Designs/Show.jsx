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

// ── Modal configuración y encuadre ────────────────────────────────────────────
function SettingsModal({ design, printer, setting, onClose }) {
    const isMimaki = printer.name.toLowerCase().includes('mimaki');

    const { data, setData, post, processing, errors } = useForm({
        offset_x:   setting?.offset_x  ?? '',
        offset_y:   setting?.offset_y  ?? '',
        width:      setting?.width     ?? '',
        height:     setting?.height    ?? '',
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
                    <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
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
                            {numField('Ancho (mm)', 'width', { min: 0 })}
                            {numField('Alto (mm)', 'height', { min: 0 })}
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
                    <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
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

// ── Tarjeta impresora ─────────────────────────────────────────────────────────
function PrinterCard({ design, printer }) {
    const isMimaki = printer.name.toLowerCase().includes('mimaki');
    const setting = design.printer_settings?.find(s => s.printer_id === printer.id);
    const latestVerification = design.verifications?.find(v => v.printer_id === printer.id);
    const [showSettings, setShowSettings]         = useState(false);
    const [showVerification, setShowVerification] = useState(false);

    const fields = [
        [isMimaki ? 'Escaneo (X)' : 'Offset X', setting?.offset_x != null ? `${setting.offset_x} mm` : null],
        [isMimaki ? 'Alimentación (Y)' : 'Offset Y', setting?.offset_y != null ? `${setting.offset_y} mm` : null],
        ['Ancho',  setting?.width   != null ? `${setting.width} mm`  : null],
        ['Alto',   setting?.height  != null ? `${setting.height} mm` : null],
        ['Escala', setting?.scale   != null ? `${setting.scale}%`    : null],
        ['Copias', setting?.copies  != null ? String(setting.copies) : null],
        ...(isMimaki ? [
            ['Tipo de tinta',  setting?.ink_type   ?? null],
            ['Resolución',     setting?.resolution ?? null],
            ['Sobreimprimir',  setting?.overprint  != null ? String(setting.overprint) : null],
        ] : []),
    ];

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">{printer.name}</h3>
                        {printer.model && <p className="text-xs text-slate-400">{printer.model}</p>}
                    </div>
                    {latestVerification ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Verificado {new Date(latestVerification.verified_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            <span className="text-emerald-500">· {latestVerification.user?.name}</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Sin verificar
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
                <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
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
        </>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Show({ design, printers }) {
    const { auth, flash } = usePage().props;
    const [toast, setToast] = useState(null);

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
                        <a
                            href={route('designs.download', design.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar
                        </a>
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

                {/* Impresoras */}
                <div>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Datos por impresora</h2>
                    <div className="space-y-4">
                        {printers.map(printer => (
                            <PrinterCard key={printer.id} design={design} printer={printer} />
                        ))}
                    </div>
                </div>

                {/* Historial de verificaciones */}
                {design.verifications?.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Historial de verificaciones</h2>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Impresora</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Verificado por</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {design.verifications.map(v => (
                                        <tr key={v.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3 text-sm font-medium text-slate-700">{v.printer?.name}</td>
                                            <td className="px-5 py-3 text-sm text-slate-600">{v.user?.name}</td>
                                            <td className="px-5 py-3 text-sm text-slate-500">{formatDate(v.verified_at)}</td>
                                            <td className="px-5 py-3 text-sm text-slate-500">{v.notes || <span className="text-slate-300">—</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
