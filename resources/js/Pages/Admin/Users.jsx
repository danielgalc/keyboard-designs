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

function RoleBadge({ role }) {
    return role === 'admin' ? (
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            Admin
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Operator
        </span>
    );
}

// ── Modal crear usuario ───────────────────────────────────────────────────────
function CreateModal({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'operator',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-900">Nuevo usuario</h2>
                    <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <Field label="Nombre" error={errors.name}>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClass} placeholder="Nombre completo" autoFocus />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClass} placeholder="correo@empresa.com" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Contraseña" error={errors.password}>
                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" />
                        </Field>
                        <Field label="Confirmar contraseña" error={errors.password_confirmation}>
                            <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className={inputClass} placeholder="Repite la contraseña" />
                        </Field>
                    </div>
                    <Field label="Rol" error={errors.role}>
                        <select value={data.role} onChange={e => setData('role', e.target.value)} className={inputClass + ' cursor-pointer'}>
                            <option value="operator">Operator — puede subir diseños y registrar verificaciones</option>
                            <option value="admin">Admin — acceso completo incluido catálogo y usuarios</option>
                        </select>
                    </Field>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                            {processing ? 'Creando...' : 'Crear usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Modal editar usuario ──────────────────────────────────────────────────────
function EditModal({ user, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.users.update', user.id), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Editar usuario</h2>
                        <p className="text-sm text-slate-500">{user.name}</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <Field label="Nombre" error={errors.name}>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClass} autoFocus />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClass} />
                    </Field>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
                        <p className="text-xs font-medium text-slate-500">Cambiar contraseña <span className="font-normal text-slate-400">(deja en blanco para no cambiarla)</span></p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nueva contraseña" error={errors.password}>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" />
                            </Field>
                            <Field label="Confirmar contraseña" error={errors.password_confirmation}>
                                <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className={inputClass} placeholder="Repite la contraseña" />
                            </Field>
                        </div>
                    </div>
                    <Field label="Rol" error={errors.role}>
                        <select value={data.role} onChange={e => setData('role', e.target.value)} className={inputClass + ' cursor-pointer'}>
                            <option value="operator">Operator</option>
                            <option value="admin">Admin</option>
                        </select>
                    </Field>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Users({ users }) {
    const { auth, flash } = usePage().props;
    const [toast, setToast] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const deleteForm = useForm({});

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setToast({ message: flash.success ?? flash.error, type: flash.success ? 'success' : 'error' });
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleDelete = (user) => {
        if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
        deleteForm.delete(route('admin.users.destroy', user.id));
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">Usuarios</h1>
                        <p className="text-sm text-slate-500">{users.length} {users.length === 1 ? 'usuario' : 'usuarios'} registrados</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo usuario
                    </button>
                </div>
            }
        >
            <Head title="Usuarios" />

            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={toast.type === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                    </svg>
                    {toast.message}
                </div>
            )}

            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Usuario</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Alta</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {user.name}
                                                    {user.id === auth.user.id && (
                                                        <span className="ml-2 text-xs font-normal text-slate-400">(tú)</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-slate-500">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="inline-flex min-h-[36px] items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-indigo-600 hover:bg-slate-50 hover:text-indigo-800 transition-colors"
                                            >
                                                Editar
                                            </button>
                                            {user.id !== auth.user.id && (
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="inline-flex min-h-[36px] items-center rounded-md border border-red-100 bg-red-50 px-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
            {editingUser && <EditModal user={editingUser} onClose={() => setEditingUser(null)} />}
        </AuthenticatedLayout>
    );
}
