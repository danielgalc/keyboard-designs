import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Toast({ message, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
        </div>
    );
}

function ModelRow({ model, brandId }) {
    const [editing, setEditing] = useState(false);
    const editForm = useForm({ name: model.name });
    const deleteForm = useForm({});

    const save = (e) => {
        e.preventDefault();
        editForm.patch(route('admin.models.update', model.id), { onSuccess: () => setEditing(false) });
    };

    const destroy = () => {
        if (confirm(`¿Eliminar modelo "${model.name}"? Se perderá la asociación con ${model.designs_count} diseño(s).`)) {
            deleteForm.delete(route('admin.models.destroy', model.id));
        }
    };

    return (
        <div className="flex items-center justify-between py-2 pl-8 pr-4 hover:bg-slate-50 border-b border-slate-100 last:border-0">
            {editing ? (
                <form onSubmit={save} className="flex flex-1 items-center gap-2">
                    <input
                        type="text"
                        value={editForm.data.name}
                        onChange={e => editForm.setData('name', e.target.value)}
                        className={inputClass + " max-w-xs"}
                        autoFocus
                    />
                    <button type="submit" disabled={editForm.processing} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                        Guardar
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-700">
                        Cancelar
                    </button>
                </form>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-700">{model.name}</span>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                            {{ laptop: 'Portátil', tower: 'Torre', sff: 'SFF', mini: 'Mini' }[model.device_type] ?? model.device_type}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            {model.designs_count} diseño(s)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:text-indigo-800">Editar</button>
                        <button onClick={destroy} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                    </div>
                </>
            )}
        </div>
    );
}

function BrandCard({ brand }) {
    const [open, setOpen] = useState(true);
    const [editingBrand, setEditingBrand] = useState(false);
    const [addingModel, setAddingModel] = useState(false);

    const editBrandForm = useForm({ name: brand.name });
    const deleteBrandForm = useForm({});
    const addModelForm = useForm({ name: '', device_type: 'laptop' });

    const saveBrand = (e) => {
        e.preventDefault();
        editBrandForm.patch(route('admin.brands.update', brand.id), { onSuccess: () => setEditingBrand(false) });
    };

    const destroyBrand = () => {
        if (confirm(`¿Eliminar la marca "${brand.name}" y todos sus modelos?`)) {
            deleteBrandForm.delete(route('admin.brands.destroy', brand.id));
        }
    };

    const saveModel = (e) => {
        e.preventDefault();
        addModelForm.post(route('admin.models.store', brand.id), {
            onSuccess: () => { addModelForm.reset(); setAddingModel(false); },
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Cabecera de marca */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-slate-600">
                        <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    {editingBrand ? (
                        <form onSubmit={saveBrand} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editBrandForm.data.name}
                                onChange={e => editBrandForm.setData('name', e.target.value)}
                                className={inputClass + " max-w-xs"}
                                autoFocus
                            />
                            <button type="submit" disabled={editBrandForm.processing} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">
                                Guardar
                            </button>
                            <button type="button" onClick={() => setEditingBrand(false)} className="text-xs text-slate-500">Cancelar</button>
                        </form>
                    ) : (
                        <span className="text-base font-bold text-slate-800">{brand.name}</span>
                    )}
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs text-slate-600">
                        {brand.models_count} modelos
                    </span>
                </div>
                {!editingBrand && (
                    <div className="flex items-center gap-3">
                        <button onClick={() => setAddingModel(true)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                            + Modelo
                        </button>
                        <button onClick={() => setEditingBrand(true)} className="text-xs text-slate-500 hover:text-slate-700">
                            Editar
                        </button>
                        <button onClick={destroyBrand} className="text-xs text-red-500 hover:text-red-700">
                            Eliminar
                        </button>
                    </div>
                )}
            </div>

            {/* Modelos */}
            {open && (
                <div>
                    {brand.models?.map(model => (
                        <ModelRow key={model.id} model={model} brandId={brand.id} />
                    ))}

                    {/* Formulario añadir modelo */}
                    {addingModel ? (
                        <form onSubmit={saveModel} className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-8 py-3 bg-indigo-50">
                            <select
                                value={addModelForm.data.device_type}
                                onChange={e => addModelForm.setData('device_type', e.target.value)}
                                className={inputClass + " max-w-[130px] cursor-pointer"}
                            >
                                <option value="laptop">Portátil</option>
                                <option value="tower">Torre</option>
                                <option value="sff">SFF</option>
                                <option value="mini">Mini</option>
                            </select>
                            <input
                                type="text"
                                value={addModelForm.data.name}
                                onChange={e => addModelForm.setData('name', e.target.value)}
                                className={inputClass + " max-w-xs"}
                                placeholder="Nombre del modelo..."
                                autoFocus
                            />
                            {addModelForm.errors.name && (
                                <p className="text-xs text-red-600">{addModelForm.errors.name}</p>
                            )}
                            <button type="submit" disabled={addModelForm.processing} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                                Añadir
                            </button>
                            <button type="button" onClick={() => setAddingModel(false)} className="text-xs text-slate-500 hover:text-slate-700">
                                Cancelar
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setAddingModel(true)}
                            className="flex w-full items-center gap-2 border-t border-slate-100 px-8 py-2.5 text-xs text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Añadir modelo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Catalog({ brands }) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);
    const [addingBrand, setAddingBrand] = useState(false);
    const addBrandForm = useForm({ name: '' });

    useEffect(() => {
        if (flash?.success) setToast(flash.success);
    }, [flash]);

    const saveBrand = (e) => {
        e.preventDefault();
        addBrandForm.post(route('admin.brands.store'), {
            onSuccess: () => { addBrandForm.reset(); setAddingBrand(false); },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Catálogo</h1>
                        <p className="text-sm text-slate-500">Gestiona las marcas y modelos</p>
                    </div>
                    <button
                        onClick={() => setAddingBrand(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva marca
                    </button>
                </div>
            }
        >
            <Head title="Catálogo" />
            {toast && <Toast message={toast} onDone={() => setToast(null)} />}

            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">

                {/* Formulario nueva marca */}
                {addingBrand && (
                    <form onSubmit={saveBrand} className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <input
                            type="text"
                            value={addBrandForm.data.name}
                            onChange={e => addBrandForm.setData('name', e.target.value)}
                            className={inputClass + " max-w-xs"}
                            placeholder="Nombre de la marca..."
                            autoFocus
                        />
                        {addBrandForm.errors.name && (
                            <p className="text-xs text-red-600">{addBrandForm.errors.name}</p>
                        )}
                        <button type="submit" disabled={addBrandForm.processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                            Añadir marca
                        </button>
                        <button type="button" onClick={() => setAddingBrand(false)} className="text-sm text-slate-500 hover:text-slate-700">
                            Cancelar
                        </button>
                    </form>
                )}

                {brands.length === 0 && !addingBrand && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
                        <p className="text-sm text-slate-500">No hay marcas todavía.</p>
                        <button onClick={() => setAddingBrand(true)} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Añadir la primera marca →
                        </button>
                    </div>
                )}

                {brands.map(brand => (
                    <BrandCard key={brand.id} brand={brand} />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
