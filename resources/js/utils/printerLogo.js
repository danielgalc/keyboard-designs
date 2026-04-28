const PRINTER_LOGOS = {
    mimaki: '/Mimaki-Logo.png',
    nocai:  '/nocai-logo.png',
};

export function getPrinterLogo(name) {
    const key = name?.toLowerCase() ?? '';
    const match = Object.entries(PRINTER_LOGOS).find(([k]) => key.includes(k));
    return match?.[1] ?? null;
}
