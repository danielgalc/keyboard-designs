import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function PrinterCard({ printer, settings, verifications }) {
    const setting = settings?.find(s => s.printer_id === printer.id);
    const latestVerification = verifications?.find(v => v.printer_id === printer.id);

    return (
        <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-800">{printer.name}</h3>
                    {printer.model && <p className="text-xs text-gray-400">{printer.model}</p>}
                </div>
                {latestVerification ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        ✓ Verificado {new Date(latestVerification.verified_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="ml-1 text-green-500">· {latestVerification.user?.name}</span>
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                        Sin verificar
                    </span>
                )}
            </div>

            {setting ? (
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                    {[
                        ['Offset X', setting.offset_x != null ? `${setting.offset_x} mm` : '—'],
                        ['Offset Y', setting.offset_y != null ? `${setting.offset_y} mm` : '—'],
                        ['Ancho', setting.width != null ? `${setting.width} mm` : '—'],
                        ['Alto', setting.height != null ? `${setting.height} mm` : '—'],
                        ['Escala', setting.scale != null ? setting.scale : '—'],
                        ['Copias', setting.copies ?? '—'],
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
                    <div className="col-span-2 sm:col-span-4 text-xs text-gray-400 mt-1">
                        Actualizado por {setting.updated_by?.name ?? '—'} · {formatDate(setting.updated_at)}
                    </div>
                </div>
            ) : (
                <p className="mt-3 text-sm text-gray-400">No hay datos de encuadre para esta impresora.</p>
            )}

            <div className="mt-4 flex gap-3">
                <Link
                    href="#"
                    className="text-xs text-indigo-600 hover:text-indigo-900"
                >
                    {setting ? 'Editar encuadre' : '+ Añadir encuadre'}
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                    href="#"
                    className="text-xs text-green-600 hover:text-green-900"
                >
                    + Registrar verificación
                </Link>
            </div>
        </div>
    );
}

export default function Show({ design, printers }) {
    const { auth } = usePage().props;

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

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Información general */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
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
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                            Datos por impresora
                        </h3>
                        <div className="space-y-4">
                            {printers.map(printer => (
                                <PrinterCard
                                    key={printer.id}
                                    printer={printer}
                                    settings={design.printer_settings}
                                    verifications={design.verifications}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
