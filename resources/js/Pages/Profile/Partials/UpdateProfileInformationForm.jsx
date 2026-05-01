import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Información de perfil</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">Actualiza tu nombre y dirección de email.</p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                    <input id="name" type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClass} autoComplete="name" required />
                    <InputError className="mt-1.5" message={errors.name} />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClass} autoComplete="username" required />
                    <InputError className="mt-1.5" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
                        Tu dirección de email no está verificada.{' '}
                        <Link href={route('verification.send')} method="post" as="button" className="font-medium underline hover:text-amber-900">
                            Reenviar email de verificación
                        </Link>
                        {status === 'verification-link-sent' && (
                            <p className="mt-1 font-medium text-emerald-700">Enlace enviado correctamente.</p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                    <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-emerald-600 font-medium">Guardado.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
