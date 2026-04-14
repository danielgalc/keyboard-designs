import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        laptop_brand: '',
        laptop_model: '',
        source_language: '',
        target_language: '',
        description: '',
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('designs.store'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Subir nuevo diseño
                </h2>
            }
        >
            <Head title="Subir diseño" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-8 shadow">
                        <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">

                            {/* Nombre */}
                            <div>
                                <InputLabel htmlFor="name" value="Nombre del diseño *" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    isFocused
                                    placeholder="Ej: HP 15s-fq5xxx ES→EN"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            {/* Portátil */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="laptop_brand" value="Marca del portátil" />
                                    <TextInput
                                        id="laptop_brand"
                                        className="mt-1 block w-full"
                                        value={data.laptop_brand}
                                        onChange={e => setData('laptop_brand', e.target.value)}
                                        placeholder="Ej: HP"
                                    />
                                    <InputError message={errors.laptop_brand} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="laptop_model" value="Modelo del portátil" />
                                    <TextInput
                                        id="laptop_model"
                                        className="mt-1 block w-full"
                                        value={data.laptop_model}
                                        onChange={e => setData('laptop_model', e.target.value)}
                                        placeholder="Ej: 15s-fq5xxx"
                                    />
                                    <InputError message={errors.laptop_model} className="mt-1" />
                                </div>
                            </div>

                            {/* Idiomas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="source_language" value="Idioma origen" />
                                    <TextInput
                                        id="source_language"
                                        className="mt-1 block w-full"
                                        value={data.source_language}
                                        onChange={e => setData('source_language', e.target.value.toUpperCase())}
                                        placeholder="Ej: ES"
                                        maxLength={10}
                                    />
                                    <InputError message={errors.source_language} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="target_language" value="Idioma destino" />
                                    <TextInput
                                        id="target_language"
                                        className="mt-1 block w-full"
                                        value={data.target_language}
                                        onChange={e => setData('target_language', e.target.value.toUpperCase())}
                                        placeholder="Ej: EN"
                                        maxLength={10}
                                    />
                                    <InputError message={errors.target_language} className="mt-1" />
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <InputLabel htmlFor="description" value="Descripción / notas" />
                                <textarea
                                    id="description"
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Notas sobre el diseño, variantes, etc."
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            {/* Archivo */}
                            <div>
                                <InputLabel htmlFor="file" value="Archivo del diseño *" />
                                <input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.ai,.eps,.png,.jpg,.svg,.zip"
                                    className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-700"
                                    onChange={e => setData('file', e.target.files[0])}
                                />
                                <p className="mt-1 text-xs text-gray-400">PDF, AI, EPS, PNG, JPG, SVG, ZIP — máx. 50MB</p>
                                <InputError message={errors.file} className="mt-1" />

                                {progress && (
                                    <div className="mt-2 h-2 w-full rounded bg-gray-200">
                                        <div
                                            className="h-2 rounded bg-indigo-500 transition-all"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex items-center justify-end gap-4 pt-2">
                                <Link href={route('designs.index')} className="text-sm text-gray-600 underline hover:text-gray-900">
                                    Cancelar
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Subiendo...' : 'Subir diseño'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
