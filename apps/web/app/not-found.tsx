import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "./(auth)/AnimatedBackground";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <>
      <AnimatedBackground />

      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden bg-background">
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-2xl text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="JakeX Logo"
                width={80}
                height={80}
                className="rounded-2xl"
              />
            </div>

            {/* 404 Card */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-chart-2 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />

              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-12 shadow-2xl">
                <div className="space-y-6">
                  {/* Error Code */}
                  <div className="relative">
                    <h1 className="text-8xl font-bold bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                      404
                    </h1>
                  </div>

                  {/* Error Message */}
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground">
                      Page Not Found
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link href={ROUTES.HOME}>
                      <Button
                        className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-all"
                      >
                        Go Home
                      </Button>
                    </Link>
                    <Link href={ROUTES.DASHBOARD}>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto h-12 px-8 text-base font-semibold border-2 active:scale-95 transition-all"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-sm text-muted-foreground">
              Need help? Check out our{" "}
              <Link href={ROUTES.HOME} className="text-primary hover:underline font-medium">
                homepage
              </Link>{" "}
              or contact support.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden min-h-screen bg-background flex flex-col">
        {/* Top App Bar */}
        <div className="safe-area-top bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="px-6 py-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="JakeX Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <h1 className="text-xl font-bold">JakeX</h1>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center space-y-8">
            {/* Error Code */}
            <div className="relative">
              <h1 className="text-7xl font-bold bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Page Not Found
              </h2>
              <p className="text-muted-foreground text-base">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Link href={ROUTES.HOME} className="block">
                <Button
                  className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                  Go Home
                </Button>
              </Link>
              <Link href={ROUTES.DASHBOARD} className="block">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 active:scale-95 transition-all"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-sm text-muted-foreground pt-4">
              Need help?{" "}
              <Link href={ROUTES.HOME} className="text-primary hover:underline font-medium">
                Go to homepage
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="safe-area-bottom" />
      </div>
    </>
  );
}
