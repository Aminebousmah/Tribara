import React from "react";

interface ProgressIndicatorProps {
    steps: string[];
    currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
    return (
        <ul className="flex gap-4 mb-12">
            {steps.map((step, index) => (
                <li key={step} className="md:flex-1 flex flex-col items-center">
                    <div
                        className={`w-full h-2 rounded-full ${
                            currentStep > index
                                ? "bg-sky-600"
                                : currentStep === index
                                    ? "bg-sky-300"
                                    : "bg-gray-200"
                        }`}
                    ></div>
                    <span
                        className={`text-sm font-medium mt-2 ${
                            currentStep > index
                                ? "text-sky-600"
                                : currentStep === index
                                    ? "text-sky-600"
                                    : "text-gray-500"
                        }`}
                    >
                        {step}
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default ProgressIndicator;
