import { useEffect } from 'react';

/**
 * Modal de confirmación reutilizable.
 *
 * Props:
 *   title    — título del modal (ej. "Eliminar usuario")
 *   message  — descripción/pregunta (ej. "¿Seguro que quieres eliminar a Juan?")
 *   confirm  — texto del botón de confirmación (default: "Eliminar")
 *   onConfirm — callback al confirmar
 *   onCancel  — callback al cancelar / cerrar
 *   danger   — si true (default) el botón de confirmación es rojo; false → indigo
 */
export default function ConfirmModal({
    title,
    message,
    confirm: confirmLabel = 'Eliminar',
    onConfirm,
    onCancel,
    danger = true,
}) {
    // Cerrar con Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-xl bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Icono + título */}
                <div className="px-6 pt-6 pb-4">
                    <div className={`mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full ${danger ? 'bg-red-100' : 'bg-indigo-100'}`}>
                        {danger ? (
                            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <h3 className="text-center text-base font-semibold text-slate-900">{title}</h3>
                    {message && (
                        <p className="mt-2 text-center text-sm text-slate-500 leading-relaxed">{message}</p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                            danger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
