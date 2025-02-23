export function StatusStepper({ status }) {
  const steps = [
    {
      id: "admin",
      label: "مراجعة إدارية",
      description: "تحت المراجعة الإدارية",
    },
    {
      id: "evaluation",
      label: "تقييم المقاول",
      description: "تقييم العقار",
    },
    {
      id: "final",
      label: "الحالة النهائية",
      description: "القرار النهائي",
    },
  ];

  const getStepStatus = (stepId) => {
    switch (status) {
      case "pending":
        return stepId === "admin" ? "current" : "upcoming";
      case "rejected":
        return stepId === "admin" ? "rejected" : "upcoming";
      case "eval_pending":
        return stepId === "admin"
          ? "completed"
          : stepId === "evaluation"
          ? "current"
          : "upcoming";
      case "approved":
        return "completed";
      default:
        return "upcoming";
    }
  };

  const getStepStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "current":
        return "bg-blue-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "approved":
        return "bg-green-500 text-white";
      default:
        return "bg-white border-2 border-gray-300 text-gray-500";
    }
  };

  const getStepIcon = (step, stepStatus) => {
    if (stepStatus === "completed" || stepStatus === "approved") {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (stepStatus === "rejected") {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }
    return <span>{steps.indexOf(step) + 1}</span>;
  };

  return (
    <div className="w-full py-4">
      <div className="flex justify-between">
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStyle(
                  stepStatus
                )}`}
              >
                {getStepIcon(step, stepStatus)}
              </div>
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-medium ${
                    stepStatus === "completed" || stepStatus === "approved"
                      ? "text-green-600"
                      : stepStatus === "current"
                      ? "text-blue-600"
                      : stepStatus === "rejected"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 