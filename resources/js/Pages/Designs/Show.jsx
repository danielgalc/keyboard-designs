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

// ── Modal encuadre ────────────────────────────────────────────────────────────
function SettingsModal({ design, printer, setting, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        offset_x: setting?.offset_x ?? '',
        offset_y: setting?.offset_y ?? '',
        width:    setting?.width    ?? '',
        height:   setting?.height   ?? '',
        scale:    setting?.scale    ?? '1',
        copies:   setting?.copies   ?? '1',
        notes:    setting?.notes    ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('designs.settings.upsert', [design.id, printer.id]), {
            onSuccess: onClose,
        });
    };

    const field = (label, key, extra = {}) => (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <input
                type="number"
                step="any"
                value={data[key]}
                onChange={e => setData(key, e.target.value)}
                className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                {...extra}
            />
            {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                <div className="border-b px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-800">
                        Encuadre — {printer.name} {printer.model && `(${printer.model})`}
                    </h2>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {field('Offset X (mm)', 'offset_x')}
                        {field('Offset Y (mm)', 'offset_y')}
                        {field('Ancho (mm)', 'width', { min: 0 })}
                        {field('Alto (mm)', 'height', { min: 0 })}
                        {field('Escala', 'scale', { min: 0, step: '0.0001' })}
                        {field('Copias', 'copies', { min: 1, step: '1' })}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Notas</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Perfil de color, ajustes especiales..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="text-sm text-gray-600 underline hover:text-gray-900">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                        >
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
        post(route('designs.verifications.store', [design.id, printer.id]), {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                <div className="border-b px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-800">
                        Registrar verificación — {printer.name}
                    </h2>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        Estás confirmando que este diseño ha sido impreso y verificado correctamente en <strong>{printer.name}</strong>.
                        Se registrará la fecha y hora actuales junto a tu nombre.
                    </p>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones (opcional)</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Ej: resultado perfecto, sin ajustes necesarios..."
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="text-sm text-gray-600 underline hover:text-gray-900">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                        >
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
    const setting = design.printer_settings?.find(s => s.printer_id === printer.id);
    const latestVerification = design.verifications?.find(v => v.printer_id === printer.id);

    const [showSettings, setShowSettings]         = useState(false);
    const [showVerification, setShowVerification] = useState(false);

    return (
        <>
            <div className="rounded-lg border border-gray-200 p-5">
                {/* Cabecera */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800">{printer.name}</h3>
                        {printer.model && <p className="text-xs text-gray-400">{printer.model}</p>}
                    </div>
                    {latestVerification ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            ✓ Verificado el {new Date(latestVerification.verified_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            <span className="ml-1 text-green-500">· {latestVerification.user?.name}</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                            Sin verificar
                        </span>
                    )}
                </div>

                {/* Datos de encuadre */}
                {setting ? (
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                        {[
                            ['Offset X', setting.offset_x != null ? `${setting.offset_x} mm` : '—'],
                            ['Offset Y', setting.offset_y != null ? `${setting.offset_y} mm` : '—'],
                            ['Ancho',    setting.width    != null ? `${setting.width} mm`    : '—'],
                            ['Alto',     setting.height   != null ? `${setting.height} mm`   : '—'],
                            ['Escala',   setting.scale    != null ? setting.scale             : '—'],
                            ['Copias',   setting.copies   ?? '—'],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium text-gray-400">{label}</dt>
                                <dd className="text-gray-700">{value}</dd>
                            </div>
                        ))}
                        {setting.notes && (
                            <div className="col-span-2 sm:col-span-4">
                                <dt className="text-xs font-medium text-gray-400">Notas</dt>
                                <dd className="text-gray-600">{setting.notes}</dd>
                            </div>
                        )}
                        <div className="col-span-2 sm:col-span-4 mt-1 text-xs text-gray-400">
                            Actualizado por {setting.updated_by?.name ?? '—'} · {formatDate(setting.updated_at)}
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-gray-400">No hay datos de encuadre para esta impresora.</p>
                )}

                {/* Acciones */}
                <div className="mt-4 flex gap-4">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-900"
                    >
                        {setting ? 'Editar encuadre' : '+ Añadir encuadre'}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={() => setShowVerification(true)}
                        className="text-xs text-green-600 hover:text-green-900"
                    >
                        + Registrar verificación
                    </button>
                </div>
            </div>

            {showSettings && (
                <SettingsModal
                    design={design}
                    printer={printer}
                    setting={setting}
                    onClose={() => setShowSettings(false)}
                />
            )}
            {showVerification && (
                <VerificationModal
                    design={design}
                    printer={printer}
                    onClose={() => setShowVerification(false)}
                />
            )}
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
                    <div>
                        <Link href={route('designs.index')} className="text-sm text-gray-400 hover:text-gray-600">
                            ← Diseños
                        </Link>
                        <h2 className="mt-1 text-xl font-semibold leading-tight text-gray-800">
                            {design.name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={route('designs.download', design.id)}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Descargar
                        </a>
                        {auth.user.role === 'admin' && (
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={design.name} />

            {/* Toast notificación */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-green-700 px-5 py-3 text-sm text-white shadow-lg">
                    {toast}
                </div>
            )}

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Información general */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Información del diseño
                        </h3>
                        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Marca</dt>
                                <dd className="text-gray-700">{design.laptop_brand || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Modelo</dt>
                                <dd className="text-gray-700">{design.laptop_model || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Idioma origen</dt>
                                <dd className="text-gray-700">{design.source_language || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Idioma destino</dt>
                                <dd className="text-gray-700">{design.target_language || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Archivo</dt>
                                <dd className="text-gray-700">{design.file_name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Tamaño</dt>
                                <dd className="text-gray-700">{formatBytes(design.file_size)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Subido por</dt>
                                <dd className="text-gray-700">{design.creator?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-400">Fecha</dt>
                                <dd className="text-gray-700">{formatDate(design.created_at)}</dd>
                            </div>
                            {design.description && (
                                <div className="col-span-2 sm:col-span-4">
                                    <dt className="text-xs font-medium text-gray-400">Descripción</dt>
                                    <dd className="text-gray-600 whitespace-pre-line">{design.description}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Tarjetas por impresora */}
                    <div>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Datos por impresora
                        </h3>
                        <div className="space-y-4">
                            {printers.map(printer => (
                                <PrinterCard key={printer.id} design={design} printer={printer} />
                            ))}
                        </div>
                    </div>

                    {/* Historial de verificaciones */}
                    {design.verifications?.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Historial de verificaciones
                            </h3>
                            <div className="rounded-lg bg-white shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Impresora</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Verificado por</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Fecha</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-400">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {design.verifications.map(v => (
                                            <tr key={v.id}>
                                                <td className="px-5 py-3 text-gray-700">{v.printer?.name}</td>
                                                <td className="px-5 py-3 text-gray-700">{v.user?.name}</td>
                                                <td className="px-5 py-3 text-gray-500">{formatDate(v.verified_at)}</td>
                                                <td className="px-5 py-3 text-gray-500">{v.notes || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
