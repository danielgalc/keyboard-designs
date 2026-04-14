import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function VerificationBadge({ design, printer }) {
    const latest = design.verifications?.find(v => v.printer_id === printer.id);

    if (!latest) {
        return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                Sin verificar
            </span>
        );
    }

    const date = new Date(latest.verified_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700" title={`Por ${latest.user?.name}`}>
            ✓ {date}
        </span>
    );
}

export default function Index({ designs, printers, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('designs.index'), { search }, { preserveState: true, replace: true });
        }, 350);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Diseños</h2>
                    <Link
                        href={route('designs.create')}
                        className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                    >
                        + Subir diseño
                    </Link>
                </div>
            }
        >
            <Head title="Diseños" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Buscador */}
                    <div className="mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, marca o modelo..."
                            className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    {/* Tabla */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Diseño</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Portátil</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Idiomas</th>
                                    {printers.map(printer => (
                                        <th key={printer.id} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            {printer.name}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subido por</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Ver</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {designs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5 + printers.length} className="px-6 py-10 text-center text-sm text-gray-500">
                                            No hay diseños todavía.{' '}
                                            <Link href={route('designs.create')} className="text-indigo-600 underline">Subir el primero</Link>
                                        </td>
                                    </tr>
                                )}
                                {designs.data.map(design => (
                                    <tr key={design.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{design.name}</div>
                                            <div className="text-xs text-gray-400">{design.file_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {[design.laptop_brand, design.laptop_model].filter(Boolean).join(' ') || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {design.source_language && design.target_language
                                                ? `${design.source_language} → ${design.target_language}`
                                                : '—'}
                                        </td>
                                        {printers.map(printer => (
                                            <td key={printer.id} className="px-6 py-4">
                                                <VerificationBadge design={design} printer={printer} />
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-sm text-gray-500">{design.creator?.name}</td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <Link href={route('designs.show', design.id)} className="text-indigo-600 hover:text-indigo-900">
                                                Ver →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {designs.last_page > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {designs.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`rounded px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
