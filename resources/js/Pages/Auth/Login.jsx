import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
            <Head title="Acceder" />

            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <img src="/Logo%20completo.png" alt="KeyLayout" className="h-20 w-auto object-contain" />
                    <p className="mt-3 text-sm text-slate-400">Repositorio de diseños de teclado</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
                    {status && (
                        <div className="mb-4 rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                autoComplete="username"
                                autoFocus
                                className="block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="tu@email.com"
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                    Contraseña
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-xs text-indigo-400 hover:text-indigo-300">
                                        ¿La olvidaste?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                autoComplete="current-password"
                                className="block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-400">Recordarme</label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Accediendo...' : 'Acceder'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
