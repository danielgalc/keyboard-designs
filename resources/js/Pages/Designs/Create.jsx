import Combobox from '@/Components/Combobox';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const DEVICE_TYPES = [
    { value: 'laptop', label: 'Portátil' },
    { value: 'tower',  label: 'Torre'    },
    { value: 'sff',    label: 'SFF'      },
    { value: 'mini',   label: 'Mini'     },
];

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

export default function Create({ brands }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        brand_name:  '',
        device_type: '',
        model_name:  '',
        language:    '',
        name:        '',
        description: '',
        file:        null,
    });

    const availableModels = useMemo(() => {
        if (!data.brand_name || !data.device_type) return [];
        const found = brands.find(b => b.name === data.brand_name);
        return (found?.models ?? []).filter(m => m.device_type === data.device_type);
    }, [data.brand_name, data.device_type, brands]);

    const handleBrandChange = (value) => {
        setData(d => ({ ...d, brand_name: value, device_type: '', model_name: '' }));
    };

    const handleTypeChange = (type) => {
        setData(d => ({ ...d, device_type: type, model_name: '' }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('designs.store'), { forceFormData: true });
    };

    const canSubmit = data.file && data.brand_name && data.device_type && data.model_name && data.name;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('designs.index')} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Subir nuevo diseño</h1>
                        <p className="text-sm text-slate-500">Añade un diseño al repositorio compartido</p>
                    </div>
                </div>
            }
        >
            <Head title="Subir diseño" />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">

                    {/* Dispositivo */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Dispositivo</h2>
                        <div className="space-y-4">

                            {/* 1. Marca */}
                            <Field label="Marca" required error={errors.brand_name}>
                                <Combobox
                                    value={data.brand_name}
                                    onChange={handleBrandChange}
                                    options={brands.map(b => b.name)}
                                    placeholder="Selecciona o escribe una marca..."
                                    allowNew
                                />
                            </Field>

                            {/* 2. Tipo de dispositivo */}
                            {data.brand_name && (
                                <Field label="Tipo de dispositivo" required error={errors.device_type}>
                                    <div className="grid grid-cols-4 gap-2 mt-1">
                                        {DEVICE_TYPES.map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => handleTypeChange(value)}
                                                className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                                                    data.device_type === value
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            )}

                            {/* 3. Modelo */}
                            {data.device_type && (
                                <Field label="Modelo" required error={errors.model_name}>
                                    <Combobox
                                        value={data.model_name}
                                        onChange={v => setData('model_name', v)}
                                        options={availableModels.map(m => m.name)}
                                        placeholder="Selecciona o escribe un modelo..."
                                        allowNew
                                    />
                                </Field>
                            )}

                            {/* 4. Idioma (solo portátiles) */}
                            {data.device_type === 'laptop' && data.model_name && (
                                <Field label="Idioma del layout" error={errors.language} hint="Ej: PT, EN, FR, DE...">
                                    <input
                                        type="text"
                                        value={data.language}
                                        onChange={e => setData('language', e.target.value.toUpperCase())}
                                        className={inputClass}
                                        placeholder="PT (opcional)"
                                        maxLength={20}
                                    />
                                </Field>
                            )}
                        </div>
                    </div>

                    {/* Diseño — aparece cuando el dispositivo está completo */}
                    {data.device_type && data.model_name && (
                        <>
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Diseño</h2>
                                <div className="space-y-4">
                                    <Field label="Nombre del diseño" required error={errors.name}
                                        hint={data.device_type === 'laptop' ? 'Ej: Tecla fina, Tecla ancha, Retroiluminado...' : 'Ej: Frontal estándar, Frontal con lector...'}>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className={inputClass}
                                            placeholder="Nombre del diseño"
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

                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Archivo</h2>
                                <Field label="Archivo del diseño" required error={errors.file} hint="PDF, AI, EPS, PNG, JPG, SVG, ZIP — máximo 50 MB">
                                    <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${data.file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                        <input type="file" accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.svg,.zip" className="sr-only" onChange={e => setData('file', e.target.files[0])} />
                                        {data.file ? (
                                            <>
                                                <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="mt-2 text-sm font-semibold text-indigo-700">{data.file.name}</p>
                                                <p className="text-xs text-indigo-400">{(data.file.size / 1024 / 1024).toFixed(2)} MB · Haz clic para cambiar</p>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mt-2 text-sm font-medium text-slate-500">Haz clic para seleccionar un archivo</p>
                                                <p className="text-xs text-slate-400">o arrastra y suelta aquí</p>
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
                        </>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('designs.index')} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || !canSubmit}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Subiendo...
                                </>
                            ) : 'Subir diseño'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
