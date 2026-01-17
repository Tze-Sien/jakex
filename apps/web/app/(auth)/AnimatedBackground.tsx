export function AnimatedBackground() {
    return (
        <>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/4 w-200 h-200 rounded-full bg-primary/5 blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -left-1/4 w-150 h-150 rounded-full bg-chart-2/10 blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/3 left-1/2 w-100 h-100 rounded-full bg-chart-3/5 blur-3xl animate-pulse delay-500" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </>
    );
}
