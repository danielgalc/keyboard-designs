import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verificar email" />
            <h2 className="mb-2 text-base font-semibold text-slate-800">Verifica tu email</h2>
            <p className="mb-5 text-sm text-slate-500">
                Hemos enviado un enlace de verificación a tu dirección de email. Haz clic en el enlace para activar tu cuenta.
            </p>
            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    Se ha enviado un nuevo enlace de verificación.
                </div>
            )}
            <form onSubmit={submit} className="space-y-4">
                <PrimaryButton className="w-full justify-center" disabled={processing}>
                    {processing ? 'Enviando...' : 'Reenviar enlace de verificación'}
                </PrimaryButton>
                <div className="text-center">
                    <Link href={route('logout')} method="post" as="button" className="text-sm text-slate-500 underline hover:text-slate-700">
                        Cerrar sesión
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
