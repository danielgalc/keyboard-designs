import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

function NavItem({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
        >
            {children}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top nav */}
            <nav className="bg-slate-900 shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        {/* Brand + links */}
                        <div className="flex items-center gap-6">
                            <Link href={route('designs.index')} className="flex items-center">
                                <img src="/Group%202.png" alt="KEYOUT" className="h-9 w-auto object-contain" />
                            </Link>
                            <div className="hidden items-center gap-1 sm:flex">
                                <NavItem href={route('designs.index')} active={route().current('designs.*')}>
                                    Diseños
                                </NavItem>
                                {auth.user.role === 'admin' && (
                                    <>
                                        <NavItem href={route('admin.catalog')} active={route().current('admin.catalog')}>
                                            Catálogo
                                        </NavItem>
                                        <NavItem href={route('admin.printers')} active={route().current('admin.printers')}>
                                            Impresoras
                                        </NavItem>
                                        <NavItem href={route('admin.users')} active={route().current('admin.users')}>
                                            Usuarios
                                        </NavItem>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User menu */}
                        <div className="relative hidden sm:block">
                            <button
                                onClick={() => setMenuOpen(o => !o)}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </span>
                                <span>{auth.user.name}</span>
                                <svg className="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg">
                                        <div className="border-b border-slate-700 px-4 py-2">
                                            <p className="text-xs text-slate-400">Conectado como</p>
                                            <p className="text-sm font-medium text-white truncate">{auth.user.email}</p>
                                            <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${auth.user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-600 text-slate-300'}`}>
                                                {auth.user.role}
                                            </span>
                                        </div>
                                        <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                                            Mi perfil
                                        </Link>
                                        <Link href={route('logout')} method="post" as="button" className="block w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                                            Cerrar sesión
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white sm:hidden"
                            onClick={() => setMenuOpen(o => !o)}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {menuOpen && (
                    <div className="border-t border-slate-700 px-4 pb-3 pt-2 sm:hidden">
                        <Link href={route('designs.index')} className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5">Diseños</Link>
                        <Link href={route('profile.edit')} className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5">Mi perfil</Link>
                        <Link href={route('logout')} method="post" as="button" className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5">Cerrar sesión</Link>
                    </div>
                )}
            </nav>

            {/* Page header */}
            {header && (
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </div>
            )}

            {/* Content */}
            <main>{children}</main>
        </div>
    );
}
