import { useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdateAvatarForm() {
    const { auth } = usePage().props;
    const user = auth.user;

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, progress } = useForm({ avatar: null });
    const deleteForm = useForm({});

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('avatar', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.avatar.update'), {
            forceFormData: true,
            onSuccess: () => {
                setPreview(null);
                setData('avatar', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const handleRemove = () => {
        if (!confirm('¿Eliminar tu foto de perfil?')) return;
        deleteForm.delete(route('profile.avatar.destroy'));
    };

    const currentAvatar = preview || user.avatar_url;
    const initials = user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Foto de perfil</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">Sube una imagen para personalizar tu cuenta.</p>

            <div className="flex items-center gap-6">
                {/* Avatar actual */}
                <div className="shrink-0">
                    {currentAvatar ? (
                        <img
                            src={currentAvatar}
                            alt="Foto de perfil"
                            className="h-20 w-20 rounded-full object-cover border-2 border-slate-200"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600 border-2 border-slate-200">
                            {initials}
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex-1">
                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Seleccionar imagen
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                            <p className="mt-1 text-xs text-slate-400">JPG, PNG, GIF o WebP · Máx. 2 MB</p>
                            {errors.avatar && <p className="mt-1 text-xs font-medium text-red-600">{errors.avatar}</p>}
                        </div>

                        {progress && (
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress.percentage}%` }} />
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing || !data.avatar}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                            >
                                {processing ? 'Subiendo...' : 'Subir foto'}
                            </button>
                            {user.avatar_url && !preview && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={deleteForm.processing}
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40 transition-colors"
                                >
                                    Eliminar foto
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
