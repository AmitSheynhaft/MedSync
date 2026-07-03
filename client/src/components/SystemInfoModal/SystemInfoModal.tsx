import React from "react";
import { Box, Dialog, DialogContent } from "@mui/material";
import { useRoleGuide } from "./hooks/useRoleGuideConfig";
import { useTourNavigation } from "./hooks/useTourNavigation";
import { TourHeader } from "./components/TourHeader";
import { TourStepBody } from "./components/TourStepBody";
import { TourProgressDots } from "./components/TourProgressDots";
import { TourNavigationButtons } from "./components/TourNavigationButtons";
import type { ISystemInfoModalProps } from "./types";

export const SystemInfoModal: React.FC<ISystemInfoModalProps> = ({ role, onClose }) => {
  const guide = useRoleGuide(role);
  const totalSteps = guide.steps.length;
  const { activeStep, isFirstStep, isLastStep, goToStep, goNext, goBack } = useTourNavigation(
    totalSteps,
    onClose,
  );
  const currentStep = guide.steps[activeStep];

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      dir="rtl"
      slotProps={{ paper: { sx: { borderRadius: 3, height: 460, maxHeight: "90vh" } } }}
    >
      <TourHeader currentStep={activeStep} totalSteps={totalSteps} onSkip={onClose} />

      <DialogContent sx={{ px: 3, pb: 3, pt: 1, textAlign: "center", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <TourStepBody step={currentStep} color={guide.color} accent={guide.accent} />
        </Box>

        <TourProgressDots
          totalSteps={totalSteps}
          activeStep={activeStep}
          color={guide.color}
          onSelect={goToStep}
        />

        <TourNavigationButtons
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          color={guide.color}
          onBack={goBack}
          onNext={goNext}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SystemInfoModal;
