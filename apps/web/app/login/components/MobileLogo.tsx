export function MobileLogo() {
    return (
        <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-primary to-chart-2 mb-3">
                <svg
                    className="w-7 h-7 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
            </div>
            <h2 className="text-2xl font-bold">JakeX</h2>
        </div>
    );
}
