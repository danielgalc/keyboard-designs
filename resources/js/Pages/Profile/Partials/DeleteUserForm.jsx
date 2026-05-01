import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

const inputClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function DeleteUserForm() {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef(null);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => { setConfirming(false); clearErrors(); reset(); };

    return (
        <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Eliminar cuenta</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">
                Una vez eliminada, todos tus datos serán borrados permanentemente. Esta acción no se puede deshacer.
            </p>

            {!confirming ? (
                <button onClick={() => setConfirming(true)} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors">
                    Eliminar cuenta
                </button>
            ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-5 space-y-4">
                    <p className="text-sm font-semibold text-red-800">¿Estás seguro de que quieres eliminar tu cuenta?</p>
                    <p className="text-sm text-red-700">Introduce tu contraseña para confirmar.</p>
                    <form onSubmit={deleteUser} className="space-y-4">
                        <div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className={inputClass}
                                placeholder="Tu contraseña actual"
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={processing} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
                                {processing ? 'Eliminando...' : 'Eliminar cuenta definitivamente'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}
