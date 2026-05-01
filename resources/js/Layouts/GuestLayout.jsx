export default function Guest({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12">
            <div className="mb-8 flex flex-col items-center">
                <img src="/Group%202.png" alt="KEYOUT" className="w-48 object-contain" />
            </div>
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-white px-8 py-7 shadow-2xl">
                {children}
            </div>
        </div>
    );
}
