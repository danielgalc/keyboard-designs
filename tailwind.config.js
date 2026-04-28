import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    safelist: [
        'bg-violet-100',  'text-violet-700',  'hover:bg-violet-200',
        'bg-blue-100',    'text-blue-700',    'hover:bg-blue-200',
        'bg-emerald-100', 'text-emerald-700', 'hover:bg-emerald-200',
        'bg-amber-100',   'text-amber-700',   'hover:bg-amber-200',
        'bg-rose-100',    'text-rose-700',    'hover:bg-rose-200',
        'bg-cyan-100',    'text-cyan-700',    'hover:bg-cyan-200',
        'bg-fuchsia-100', 'text-fuchsia-700', 'hover:bg-fuchsia-200',
        'bg-teal-100',    'text-teal-700',    'hover:bg-teal-200',
        'bg-orange-100',  'text-orange-700',  'hover:bg-orange-200',
        'bg-lime-100',    'text-lime-700',    'hover:bg-lime-200',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
