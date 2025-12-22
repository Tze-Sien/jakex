"use client";

export function FloatingOrbs() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Primary Orb - Large */}
            <div
                className="absolute w-96 h-96 rounded-full animate-float opacity-30"
                style={{
                    background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%)",
                    top: "10%",
                    right: "-10%",
                    filter: "blur(40px)",
                }}
            />

            {/* Secondary Orb - Medium */}
            <div
                className="absolute w-72 h-72 rounded-full animate-float-slow animation-delay-500 opacity-25"
                style={{
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)",
                    bottom: "20%",
                    left: "-5%",
                    filter: "blur(30px)",
                }}
            />

            {/* Accent Orb - Small */}
            <div
                className="absolute w-48 h-48 rounded-full animate-float-reverse animation-delay-300 opacity-20"
                style={{
                    background: "radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0) 70%)",
                    top: "50%",
                    left: "30%",
                    filter: "blur(25px)",
                }}
            />

            {/* Green Accent - Small */}
            <div
                className="absolute w-40 h-40 rounded-full animate-float animation-delay-700 opacity-20"
                style={{
                    background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0) 70%)",
                    top: "60%",
                    right: "20%",
                    filter: "blur(20px)",
                }}
            />

            {/* Floating Particles */}
            <div className="absolute w-3 h-3 rounded-full bg-primary/40 animate-particle top-[20%] left-[15%]" />
            <div className="absolute w-2 h-2 rounded-full bg-chart-2/50 animate-particle animation-delay-200 top-[40%] right-[25%]" />
            <div className="absolute w-4 h-4 rounded-full bg-pink-500/30 animate-particle animation-delay-500 top-[70%] left-[60%]" />
            <div className="absolute w-2 h-2 rounded-full bg-emerald-500/40 animate-particle animation-delay-300 top-[30%] right-[40%]" />
            <div className="absolute w-3 h-3 rounded-full bg-amber-500/30 animate-particle animation-delay-700 top-[80%] left-[20%]" />
        </div>
    );
}
