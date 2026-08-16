import React from "react";
import { Paper, Stack, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MedicalSummary from "../../../components/MedicalSummary/MedicalSummary";

interface AISummaryCardProps {
  overview?: string;
  loading?: boolean;
}

const PLACEHOLDER =
  "סיכום בריאות המופק בבינה מלאכותית יופיע כאן עם צבירת מספיק נתונים.";

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ overview, loading = false }) => {
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
      {loading ? (
        <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.65 }}>
          טוען נתונים...
        </Typography>
      ) : overview ? (
        <MedicalSummary text={overview} />
      ) : (
        <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.65 }}>
          {PLACEHOLDER}
        </Typography>
      )}
    </Paper>
  );
};
