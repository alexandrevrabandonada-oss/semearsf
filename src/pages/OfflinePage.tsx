export function OfflinePage() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 rounded-full bg-acento/20 p-6 text-acento">
                <svg
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M5.636 5.636a9 9 0 000 12.728m0 0l2.829-2.829m-2.829 2.829L3 21M9.172 9.172a4 4 0 015.656 0M9 10a1 1 0 011-1h4a1 1 0 011 1m-7 4a1 1 0 011 1h4a1 1 0 011 1m-7-2a1 1 0 11-2 0 1 1 0 012 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                    />
                </svg>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide text-cta">Você está offline</h1>
            <p className="mt-4 max-w-md text-texto/80">
                Parece que você perdeu a conexão com a internet. Verifique seu Wi-Fi ou dados móveis e tente novamente.
            </p>
            <button
                className="mt-8 rounded-md bg-cta px-6 py-3 font-black uppercase tracking-wide text-base transition-colors hover:bg-cta/90"
                onClick={() => window.location.reload()}
                type="button"
            >
                Tentar reconectar
            </button>
        </div>
    );
}
