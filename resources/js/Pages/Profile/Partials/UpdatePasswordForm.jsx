import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function UpdatePasswordForm() {
    const passwordInput = useRef(null);
    const currentPasswordInput = useRef(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) { reset('password', 'password_confirmation'); passwordInput.current?.focus(); }
                if (errors.current_password) { reset('current_password'); currentPasswordInput.current?.focus(); }
            },
        });
    };

    return (
        <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Cambiar contraseña</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">Usa una contraseña larga y aleatoria para mantener tu cuenta segura.</p>

            <form onSubmit={updatePassword} className="space-y-4">
                <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña actual</label>
                    <input id="current_password" ref={currentPasswordInput} type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} className={inputClass} autoComplete="current-password" />
                    <InputError message={errors.current_password} className="mt-1.5" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Nueva contraseña</label>
                    <input id="password" ref={passwordInput} type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputClass} autoComplete="new-password" />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>
                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar contraseña</label>
                    <input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className={inputClass} autoComplete="new-password" />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>
                <div className="flex items-center gap-4 pt-1">
                    <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                        {processing ? 'Guardando...' : 'Actualizar contraseña'}
                    </button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-emerald-600 font-medium">Guardado.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
