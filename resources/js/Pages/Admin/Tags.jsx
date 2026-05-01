import { tagColor } from '@/utils/tagColor';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Tags({ tags }) {
    const { flash } = usePage().props;
    const [toast, setToast]                       = useState(null);
    const [editingTag, setEditingTag]             = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [confirmUnused, setConfirmUnused]       = useState(false);
    const createForm = useForm({ name: '' });
    const deleteForm = useForm({});
    const unusedForm = useForm({});

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setToast({ message: flash.success ?? flash.error, type: flash.success ? 'success' : 'error' });
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.tags.store'), { onSuccess: () => createForm.reset() });
    };

    const handleDelete = (tag) => {
        deleteForm.delete(route('admin.tags.destroy', tag.id), {
            onSuccess: () => setConfirmingDelete(null),
        });
    };

    const handleDeleteUnused = () => {
        unusedForm.delete(route('admin.tags.destroyUnused'), {
            onSuccess: () => setConfirmUnused(false),
        });
    };

    const unusedCount = tags.filter(t => t.designs_count === 0).length;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Etiquetas</h1>
                    <p className="text-sm text-slate-500">{tags.length} etiqueta{tags.length !== 1 ? 's' : ''} en total</p>
                </div>
            }
        >
            <Head title="Etiquetas" />

            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={toast.type === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                    </svg>
                    {toast.message}
                </div>
            )}

            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* Lista de etiquetas */}
                    {tags.length > 0 && (
                        <ul className="divide-y divide-slate-100">
                            {tags.map(tag => {
                                const c = tagColor(tag.name);
                                return (
                                    <li key={tag.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                        {editingTag?.id === tag.id ? (
                                            <EditTagForm tag={tag} onDone={() => setEditingTag(null)} />
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-3">
                                                {/* Etiqueta + usos */}
                                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                    <span className={`inline-flex shrink-0 items-center rounded-full ${c.bg} px-3 py-1 text-sm font-medium ${c.text}`}>
                                                        {tag.name}
                                                    </span>
                                                    {tag.designs_count > 0 ? (
                                                        <span className="hidden sm:inline text-sm text-slate-500 shrink-0">
                                                            {tag.designs_count} diseño{tag.designs_count !== 1 ? 's' : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400 shrink-0">
                                                            Sin uso
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Acciones */}
                                                {editingTag?.id !== tag.id && (
                                                    confirmingDelete?.id === tag.id ? (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs text-slate-500">
                                                                {tag.designs_count > 0 ? `Se quitará de ${tag.designs_count} diseño(s)` : '¿Confirmar?'}
                                                            </span>
                                                            <button onClick={() => handleDelete(tag)} disabled={deleteForm.processing}
                                                                className="inline-flex min-h-[36px] items-center rounded-md bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
                                                                {deleteForm.processing ? 'Eliminando...' : 'Confirmar'}
                                                            </button>
                                                            <button onClick={() => setConfirmingDelete(null)}
                                                                className="inline-flex min-h-[36px] items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button onClick={() => { setEditingTag(tag); setConfirmingDelete(null); }}
                                                                className="inline-flex min-h-[36px] items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-indigo-600 hover:bg-slate-50 transition-colors">
                                                                Renombrar
                                                            </button>
                                                            <button onClick={() => { setConfirmingDelete(tag); setEditingTag(null); }}
                                                                className="inline-flex min-h-[36px] items-center rounded-md border border-red-100 bg-red-50 px-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Formulario nueva etiqueta */}
                    <form onSubmit={handleCreate} className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3">
                        <input
                            type="text"
                            value={createForm.data.name}
                            onChange={e => createForm.setData('name', e.target.value.toLowerCase())}
                            placeholder="Nueva etiqueta..."
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {createForm.errors.name && (
                            <p className="text-xs text-red-600">{createForm.errors.name}</p>
                        )}
                        <button type="submit" disabled={createForm.processing || !createForm.data.name.trim()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {createForm.processing ? 'Creando...' : 'Añadir'}
                        </button>
                    </form>

                    {/* Limpiar sin uso */}
                    {unusedCount > 0 && (
                        <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50">
                            <p className="text-xs text-slate-500">
                                {unusedCount} etiqueta{unusedCount !== 1 ? 's' : ''} sin uso en ningún diseño
                            </p>
                            {confirmUnused ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">¿Confirmar?</span>
                                    <button onClick={handleDeleteUnused} disabled={unusedForm.processing}
                                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
                                        {unusedForm.processing ? 'Eliminando...' : 'Sí, eliminar'}
                                    </button>
                                    <button onClick={() => setConfirmUnused(false)}
                                        className="text-xs text-slate-500 hover:text-slate-700">
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmUnused(true)}
                                    className="text-xs font-medium text-red-600 hover:text-red-800">
                                    Eliminar sin uso
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-slate-400 text-center">
                    Las etiquetas se crean automáticamente al añadirlas a un diseño. Para crearlas, entra en un diseño y escribe en el campo de etiquetas.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}

function EditTagForm({ tag, onDone }) {
    const { data, setData, patch, processing, errors } = useForm({ name: tag.name });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.tags.update', tag.id), { onSuccess: onDone });
    };

    return (
        <form onSubmit={submit} className="flex items-center gap-2">
            <input
                type="text"
                value={data.name}
                onChange={e => setData('name', e.target.value.toLowerCase())}
                className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            <button type="submit" disabled={processing}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                Guardar
            </button>
            <button type="button" onClick={onDone} className="text-xs text-slate-500 hover:text-slate-700">
                Cancelar
            </button>
        </form>
    );
}
