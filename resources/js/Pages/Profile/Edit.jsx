import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Mi perfil</h1>
                    <p className="text-sm text-slate-500">Gestiona tu información de cuenta</p>
                </div>
            }
        >
            <Head title="Mi perfil" />
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <UpdatePasswordForm />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <DeleteUserForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
