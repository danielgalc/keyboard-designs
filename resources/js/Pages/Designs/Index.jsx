import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function VerificationBadge({ design, printer }) {
    const latest = design.verifications?.find(v => v.printer_id === printer.id);

    if (!latest) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Sin verificar
            </span>
        );
    }

    const date = new Date(latest.verified_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700" title={`Por ${latest.user?.name}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {date}
        </span>
    );
}

export default function Index({ designs, printers, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

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
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Diseños</h1>
                        <p className="text-sm text-slate-500">
                            {designs.total} {designs.total === 1 ? 'diseño' : 'diseños'} en el repositorio
                        </p>
                    </div>
                    <Link
                        href={route('designs.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Subir diseño
                    </Link>
                </div>
            }
        >
            <Head title="Diseños" />

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {toast}
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Buscador */}
                <div className="mb-5 flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, marca o modelo..."
                            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Diseño</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Portátil</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Idiomas</th>
                                {printers.map(printer => (
                                    <th key={printer.id} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {printer.name}
                                    </th>
                                ))}
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Subido por</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {designs.data.length === 0 && (
                                <tr>
                                    <td colSpan={5 + printers.length} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm font-medium text-slate-500">
                                                {search ? 'Sin resultados para esa búsqueda' : 'No hay diseños todavía'}
                                            </p>
                                            {!search && (
                                                <Link href={route('designs.create')} className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                                                    Subir el primer diseño →
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {designs.data.map(design => (
                                <tr key={design.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <p className="text-sm font-semibold text-slate-800">{design.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{design.file_name}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">
                                        {[design.laptop_brand, design.laptop_model].filter(Boolean).join(' ') || (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {design.source_language && design.target_language ? (
                                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-slate-600">{design.source_language}</span>
                                                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-slate-600">{design.target_language}</span>
                                            </span>
                                        ) : <span className="text-slate-300">—</span>}
                                    </td>
                                    {printers.map(printer => (
                                        <td key={printer.id} className="px-5 py-3.5">
                                            <VerificationBadge design={design} printer={printer} />
                                        </td>
                                    ))}
                                    <td className="px-5 py-3.5 text-sm text-slate-500">{design.creator?.name}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <Link
                                            href={route('designs.show', design.id)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
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
                    <div className="mt-4 flex justify-center gap-1">
                        {designs.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={`min-w-[36px] rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : link.url
                                            ? 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                            : 'cursor-default text-slate-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
