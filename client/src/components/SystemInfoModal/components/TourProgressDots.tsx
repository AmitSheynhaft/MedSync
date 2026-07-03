import React from "react";
import { Box } from "@mui/material";

export interface TourProgressDotsProps {
  totalSteps: number;
  activeStep: number;
  color: string;
  onSelect: (index: number) => void;
}

export const TourProgressDots: React.FC<TourProgressDotsProps> = ({
  totalSteps,
  activeStep,
  color,
  onSelect,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.75,
      mb: 2.5,
    }}
  >
    {Array.from({ length: totalSteps }, (_, index) => (
      <Box
        key={index}
        onClick={() => onSelect(index)}
        sx={{
          width: index === activeStep ? 22 : 8,
          height: 8,
          borderRadius: 4,
          cursor: "pointer",
          transition: "all 0.2s",
          bgcolor: index === activeStep ? color : "#dee2e6",
        }}
      />
    ))}
  </Box>
);

export default TourProgressDots;
