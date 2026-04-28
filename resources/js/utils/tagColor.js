const TAG_PALETTES = [
    { bg: 'bg-violet-100',  text: 'text-violet-700',  hover: 'hover:bg-violet-200'  },
    { bg: 'bg-blue-100',    text: 'text-blue-700',    hover: 'hover:bg-blue-200'    },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200' },
    { bg: 'bg-amber-100',   text: 'text-amber-700',   hover: 'hover:bg-amber-200'   },
    { bg: 'bg-rose-100',    text: 'text-rose-700',    hover: 'hover:bg-rose-200'    },
    { bg: 'bg-cyan-100',    text: 'text-cyan-700',    hover: 'hover:bg-cyan-200'    },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', hover: 'hover:bg-fuchsia-200' },
    { bg: 'bg-teal-100',    text: 'text-teal-700',    hover: 'hover:bg-teal-200'    },
    { bg: 'bg-orange-100',  text: 'text-orange-700',  hover: 'hover:bg-orange-200'  },
    { bg: 'bg-lime-100',    text: 'text-lime-700',    hover: 'hover:bg-lime-200'    },
];

export function tagColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return TAG_PALETTES[hash % TAG_PALETTES.length];
}
