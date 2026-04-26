import Combobox from '@/Components/Combobox';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, error, required, hint, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
            {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

export default function Edit({ design, brands }) {
    const { data, setData, patch, processing, errors, progress } = useForm({
        brand_name:  design.laptop_model?.brand?.name ?? '',
        model_name:  design.laptop_model?.name ?? '',
        language:    design.language ?? '',
        name:        design.name ?? '',
        description: design.description ?? '',
        file:        null,
    });

    const availableModels = useMemo(() => {
        if (!data.brand_name) return [];
        const found = brands.find(b => b.name === data.brand_name);
        return found?.models ?? [];
    }, [data.brand_name, brands]);

    const handleBrandChange = (value) => {
        setData(d => ({ ...d, brand_name: value, model_name: '' }));
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('designs.update', design.id), { forceFormData: true });
    };

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
                        <h1 className="text-lg font-semibold text-slate-900">Editar diseño</h1>
                        <p className="text-sm text-slate-500">{design.name}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Editar · ${design.name}`} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">

                    {/* Dispositivo */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Dispositivo</h2>
                        <div className="space-y-4">
                            <Field label="Marca" required error={errors.brand_name}>
                                <Combobox
                                    value={data.brand_name}
                                    onChange={handleBrandChange}
                                    options={brands.map(b => b.name)}
                                    placeholder="Selecciona o escribe una marca..."
                                    allowNew
                                />
                            </Field>

                            <Field label="Modelo" required error={errors.model_name}>
                                <Combobox
                                    value={data.model_name}
                                    onChange={v => setData('model_name', v)}
                                    options={availableModels.map(m => m.name)}
                                    placeholder="Selecciona o escribe un modelo..."
                                    disabled={!data.brand_name}
                                    allowNew
                                />
                            </Field>

                            <Field label="Idioma del layout" error={errors.language} hint="Solo para teclados. Dejar vacío para frontales de torre u otros dispositivos.">
                                <input
                                    type="text"
                                    value={data.language}
                                    onChange={e => setData('language', e.target.value.toUpperCase())}
                                    className={inputClass}
                                    placeholder="PT (opcional)"
                                    maxLength={20}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Diseño */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Diseño</h2>
                        <div className="space-y-4">
                            <Field label="Nombre del diseño" required error={errors.name}>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClass}
                                    autoFocus
                                />
                            </Field>
                            <Field label="Descripción / notas" error={errors.description}>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className={inputClass}
                                    placeholder="Variantes, observaciones..."
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Archivo */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Archivo</h2>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 mb-4 flex items-center gap-3">
                            <svg className="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{design.file_name}</p>
                                <p className="text-xs text-slate-400">Archivo actual · deja en blanco para mantenerlo</p>
                            </div>
                        </div>
                        <Field label="Reemplazar archivo" error={errors.file} hint="PDF, AI, EPS, PNG, JPG, SVG, ZIP — máximo 50 MB">
                            <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${data.file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                <input type="file" accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.svg,.zip" className="sr-only" onChange={e => setData('file', e.target.files[0])} />
                                {data.file ? (
                                    <>
                                        <svg className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="mt-2 text-sm font-semibold text-indigo-700">{data.file.name}</p>
                                        <p className="text-xs text-indigo-400">{(data.file.size / 1024 / 1024).toFixed(2)} MB · Haz clic para cambiar</p>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mt-2 text-sm font-medium text-slate-500">Haz clic para seleccionar un archivo nuevo</p>
                                    </>
                                )}
                            </label>
                            {progress && (
                                <div className="mt-3">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs text-slate-500">Subiendo...</span>
                                        <span className="text-xs font-semibold text-indigo-600">{progress.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                                        <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${progress.percentage}%` }} />
                                    </div>
                                </div>
                            )}
                        </Field>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('designs.show', design.id)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Guardando...
                                </>
                            ) : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
