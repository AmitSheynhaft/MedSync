import { useState } from "react";

export interface TourNavigation {
  activeStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (index: number) => void;
  goNext: () => void;
  goBack: () => void;
}

export function useTourNavigation(totalSteps: number, onFinish: () => void): TourNavigation {
  const [activeStep, setActiveStep] = useState(0);

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  const goToStep = (index: number) =>
    setActiveStep(Math.min(Math.max(0, index), totalSteps - 1));

  const goNext = () => {
    if (isLastStep) onFinish();
    else setActiveStep((step) => step + 1);
  };

  const goBack = () => setActiveStep((step) => Math.max(0, step - 1));

  return { activeStep, isFirstStep, isLastStep, goToStep, goNext, goBack };
}
