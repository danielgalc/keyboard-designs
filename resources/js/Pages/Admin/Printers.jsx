import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

function PrinterModal({ printer, onClose }) {
    const isEdit = !!printer;
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:   printer?.name  ?? '',
        model:  printer?.model ?? '',
        notes:  printer?.notes ?? '',
        active: printer?.active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.printers.update', printer.id), { onSuccess: onClose });
        } else {
            post(route('admin.printers.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-900">
                        {isEdit ? 'Editar impresora' : 'Nueva impresora'}
                    </h2>
                    <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <Field label="Nombre *" error={errors.name}>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClass} placeholder="Ej: Mimaki" autoFocus />
                    </Field>
                    <Field label="Modelo" error={errors.model}>
                        <input type="text" value={data.model} onChange={e => setData('model', e.target.value)} className={inputClass} placeholder="Ej: UJF3042 MkIIe" />
                    </Field>
                    <Field label="Notas" error={errors.notes}>
                        <textarea rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} className={inputClass} placeholder="Observaciones sobre la impresora..." />
                    </Field>
                    {isEdit && (
                        <div className="flex items-center gap-2">
                            <input
                                id="active"
                                type="checkbox"
                                checked={data.active}
                                onChange={e => setData('active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="active" className="text-sm text-slate-700">Impresora activa</label>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                            {processing ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Añadir impresora'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Printers({ printers }) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState(null);
    const deleteForm = useForm({});

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setToast({ message: flash.success ?? flash.error, type: flash.success ? 'success' : 'error' });
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleDelete = (printer) => {
        if (!confirm(`¿Eliminar la impresora "${printer.name}"? Se perderán todos sus datos de configuración asociados.`)) return;
        deleteForm.delete(route('admin.printers.destroy', printer.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Impresoras</h1>
                        <p className="text-sm text-slate-500">{printers.length} impresora{printers.length !== 1 ? 's' : ''} registrada{printers.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva impresora
                    </button>
                </div>
            }
        >
            <Head title="Impresoras" />

            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={toast.type === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                    </svg>
                    {toast.message}
                </div>
            )}

            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Impresora</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Configuraciones</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {printers.map(printer => (
                                <tr key={printer.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-slate-800">{printer.name}</p>
                                        {printer.model && <p className="text-xs text-slate-400">{printer.model}</p>}
                                        {printer.notes && <p className="mt-0.5 text-xs italic text-slate-400">{printer.notes}</p>}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {printer.settings_count} diseño{printer.settings_count !== 1 ? 's' : ''} configurado{printer.settings_count !== 1 ? 's' : ''}
                                    </td>
                                    <td className="px-5 py-4">
                                        {printer.active ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Activa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                Inactiva
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => setEditingPrinter(printer)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDelete(printer)} className="text-sm font-medium text-red-500 hover:text-red-700">
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreate && <PrinterModal onClose={() => setShowCreate(false)} />}
            {editingPrinter && <PrinterModal printer={editingPrinter} onClose={() => setEditingPrinter(null)} />}
        </AuthenticatedLayout>
    );
}
