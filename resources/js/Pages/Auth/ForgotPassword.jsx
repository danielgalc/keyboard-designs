import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar contraseña" />
            <h2 className="mb-2 text-base font-semibold text-slate-800">Recuperar contraseña</h2>
            <p className="mb-5 text-sm text-slate-500">
                Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            {status && <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</div>}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <TextInput id="email" type="email" name="email" value={data.email} className="block w-full" isFocused onChange={(e) => setData('email', e.target.value)} placeholder="tu@email.com" />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>
                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Enviando...' : 'Enviar enlace'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
