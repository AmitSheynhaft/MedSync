import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface TourHeaderProps {
  currentStep: number;
  totalSteps: number;
  onSkip: () => void;
}

export const TourHeader: React.FC<TourHeaderProps> = ({ currentStep, totalSteps, onSkip }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 2.5,
      py: 1.5,
    }}
  >
    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#adb5bd" }}>
      שלב {currentStep + 1} מתוך {totalSteps}
    </Typography>
    <IconButton onClick={onSkip} aria-label="דלג" size="small">
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
);

export default TourHeader;
