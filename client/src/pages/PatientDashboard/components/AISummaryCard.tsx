import React from "react";
import { Paper, Stack, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface AISummaryCardProps {
  overview?: string;
}

const PLACEHOLDER =
  "סיכום בריאות המופק בבינה מלאכותית יופיע כאן עם צבירת מספיק נתונים.";

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ overview }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e9ecef",
        borderLeft: "4px solid #3b5bdb",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
        <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
          סיכום בריאות בבינה מלאכותית
        </Typography>
      </Stack>
      <Typography
        sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.65 }}
      >
        {overview || PLACEHOLDER}
      </Typography>
    </Paper>
  );
};
