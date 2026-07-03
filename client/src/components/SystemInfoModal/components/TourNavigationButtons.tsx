import React from "react";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export interface TourNavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  color: string;
  onBack: () => void;
  onNext: () => void;
}

export const TourNavigationButtons: React.FC<TourNavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  color,
  onBack,
  onNext,
}) => (
  <Box sx={{ display: "flex", gap: 1.5 }}>
    {!isFirstStep && (
      <Button
        variant="outlined"
        onClick={onBack}
        startIcon={<ArrowForwardIcon />}
        sx={{
          flex: 1,
          py: 1.1,
          borderRadius: 2,
          fontWeight: 600,
          color: "#495057",
          borderColor: "#dee2e6",
          "& .MuiButton-startIcon": { ml: 1, mr: -0.25 },
          "&:hover": { borderColor: "#adb5bd", bgcolor: "#f8f9fa" },
        }}
      >
        הקודם
      </Button>
    )}
    <Button
      variant="contained"
      onClick={onNext}
      endIcon={!isLastStep ? <ArrowBackIcon /> : undefined}
      sx={{
        flex: 2,
        py: 1.1,
        borderRadius: 2,
        fontWeight: 700,
        fontSize: 15,
        bgcolor: color,
        boxShadow: "none",
        "& .MuiButton-endIcon": { mr: 1, ml: -0.25 },
        "&:hover": { bgcolor: color, boxShadow: "none", filter: "brightness(0.95)" },
      }}
    >
      {isLastStep ? "בואו נתחיל" : "הבא"}
    </Button>
  </Box>
);

export default TourNavigationButtons;
