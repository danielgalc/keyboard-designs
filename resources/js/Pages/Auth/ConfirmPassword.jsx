import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Confirmar contraseña" />
            <h2 className="mb-2 text-base font-semibold text-slate-800">Área segura</h2>
            <p className="mb-5 text-sm text-slate-500">
                Confirma tu contraseña antes de continuar.
            </p>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Contraseña" />
                    <TextInput id="password" type="password" name="password" value={data.password} className="mt-1 block w-full" isFocused onChange={(e) => setData('password', e.target.value)} />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>
                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Confirmando...' : 'Confirmar'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
