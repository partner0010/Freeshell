type Step = {
  id: string;
  label: string;
};

type StepperProps = {
  steps: Step[];
  activeId: string;
};

export default function Stepper({ steps, activeId }: StepperProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {steps.map((step, index) => {
        const isActive = step.id === activeId;
        const isComplete = steps.findIndex((s) => s.id === activeId) > index;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                isActive
                  ? "bg-primary-500 text-white"
                  : isComplete
                  ? "bg-success-500 text-white"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {index + 1}
            </span>
            <span className="text-sm text-neutral-600">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
