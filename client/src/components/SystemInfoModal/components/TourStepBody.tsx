import React from "react";
import { Box, Typography } from "@mui/material";
import type { ITourStep } from "../types";

export interface TourStepBodyProps {
  step: ITourStep;
  color: string;
  accent: string;
}

export const TourStepBody: React.FC<TourStepBodyProps> = ({ step, color, accent }) => (
  <>
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: "20px",
        bgcolor: accent,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2.5,
        "& svg": { fontSize: 34 },
      }}
    >
      {step.icon}
    </Box>

    <Typography sx={{ fontSize: 19, fontWeight: 700, color: "#1a1a2e", mb: 1 }}>
      {step.title}
    </Typography>
    <Typography sx={{ fontSize: 14.5, color: "#495057", lineHeight: 1.7, mb: 2 }}>
      {step.description}
    </Typography>

    {step.tip && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center",
          p: 1.25,
          borderRadius: 2,
          bgcolor: accent,
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: 13, color, fontWeight: 600 }}>{step.tip}</Typography>
      </Box>
    )}
  </>
);

export default TourStepBody;
