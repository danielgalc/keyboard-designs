import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';

export default function SetupPassword({ expired, token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.setup.store'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4">
            <Head title="Activar cuenta" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-6 flex flex-col items-center">
                    <img src="/Group%202.png" alt="KEYOUT" className="w-full object-contain" />
                    <p className="mt-3 text-sm text-slate-400">Repositorio de diseños de teclado</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
                    {expired ? (
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="mb-2 text-base font-semibold text-white">Enlace caducado</h2>
                            <p className="text-sm text-slate-400">
                                Este enlace de activación ya no es válido o ha expirado. Contacta con el administrador para que te envíe uno nuevo.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-base font-semibold text-white">Activa tu cuenta</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Establece una contraseña para <span className="font-medium text-slate-300">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Nueva contraseña
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        autoFocus
                                        className="block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    <InputError message={errors.password} className="mt-1.5" />
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                        className="block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Repite la contraseña"
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                                </div>

                                {errors.token && (
                                    <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        {errors.token}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Guardando...' : 'Activar cuenta'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Built by Pulsia Itech &nbsp;&middot;&nbsp; &copy; Daniel Gallego 2026
                </p>
            </div>
        </div>
    );
}
