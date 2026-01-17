interface Step {
  label: string;
  status: "completed" | "current" | "upcoming";
}

interface ProgressStepperProps {
  steps: Step[];
}

export function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <div className="w-full max-w-md mx-auto px-6 py-5">
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />

        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{
            width: `${((steps.findIndex(s => s.status === "current")) / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center gap-2">
              {/* Circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10
                  ${
                    step.status === "completed"
                      ? "bg-primary shadow-lg shadow-primary/30"
                      : step.status === "current"
                      ? "bg-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20"
                      : "bg-muted border-2 border-border"
                  }
                `}
              >
                {step.status === "completed" ? (
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span
                    className={`text-sm font-bold ${
                      step.status === "current"
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors whitespace-nowrap ${
                  step.status === "current"
                    ? "text-foreground"
                    : step.status === "completed"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
